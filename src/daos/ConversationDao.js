var { filter } = require('p-iteration');
var TitoBotService = require('../services/TitoBotService');
var FirebaseService = require('../firebase/FirebaseService');
var UserDao = require('./UserDao');
var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Op = models.Sequelize.Op;
var Conversation = models.conversation;
var { ConversationNotFoundError, UserNotBelongsToOrganizationError, InvalidConversationError } = require('../helpers/Errors');

class ConversationDao{

    async create(organizationId, userId, userToken){
        var user1 = await UserDao.findByToken(userToken);
        var user2 = await UserDao.findById(userId);

        var organization = await OrganizationDao.findById(organizationId);

        if (user1.id == user2.id){
            throw new InvalidConversationError();
        }
        if (!(await organization.hasUser(user1))){
            throw new UserNotBelongsToOrganizationError(organization.id, user1.id);
        }
        if (!(await organization.hasUser(user2))){
            throw new UserNotBelongsToOrganizationError(organization.id, user2.id);
        }

        var conversation = await this.findByUsers(organization, user1, user2);
        if (conversation){
            return conversation;
        }

        var conversationModel = await Conversation.create({organizationId: organizationId});
        await conversationModel.addUsers([user1, user2]);
        TitoBotService.conversationCreated(conversationModel, user1);
        FirebaseService.sendConversationInvitationNotification(user2, user1, conversationModel);
        return await Conversation.findByPk(conversationModel.id, this._getIncludeUsers(user1.id));
    }

    async findById(id){
        var conversation = await Conversation.findByPk(id);
        if (!conversation){
            throw new ConversationNotFoundError(id);
        }
        return conversation;
    }

    async findByUsers(organization, user1, user2){
        var conversations = await organization.getConversations(this._getIncludeUsers(user1.id));

        var result = await filter(conversations, async (conversation) => {
            var results = await Promise.all([
                    conversation.hasUser(user1),
                    conversation.hasUser(user2)
                ]);
            return results.every(r => r);
        });

        return result.length > 0 ? result[0] : null;
    }

    async get(userToken, organizationId){
        var [org, user] = await Promise.all([
                OrganizationDao.findById(organizationId),
                UserDao.findByToken(userToken)
            ]);

        var orgConversations = await org.getConversations(this._getIncludeUsers(user.id));

        var userConversations = await filter(orgConversations, async (conversation) => {
            return await conversation.hasUser(user);
        });

        return userConversations;
    }

    _getIncludeUsers(userId){
        return {include: [
                    { association: Conversation.users, 
                      attributes: { exclude: ['token'] }, 
                      where: {id: {
                        [Op.not]: userId
                      }}
                    }
                ]};
    }

}

module.exports = new ConversationDao();