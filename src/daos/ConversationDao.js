var { filter } = require('p-iteration');
var UserDao = require('./UserDao');
var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Conversation = models.conversation;
var { ConversationNotFoundError } = require('../helpers/Errors');

class ConversationDao{

    async create(){
        //TODO check user belongs to organization and role, channel name does not exist in org
        /*var user = await UserDao.findByToken(channel.creatorToken);

        var organization = await OrganizationDao.findById(channel.organizationId);

        channel.creatorId = user.id;
        channel.organizationId = organization.id;

        var channelModel = await Channel.create(channel);
        await channelModel.addUser(user);
        return channelModel;*/
    }

    async findById(id){
        var conversation = await Conversation.findByPk(id);
        if (!conversation){
            throw new ConversationNotFoundError(id);
        }
        return conversation;
    }

    async findByUsers(organization, user1, user2){
        var conversations = await organization.getConversations();

        var result = await filter(conversations, async (conversation) => {
            var hasUser1 = await conversation.hasUser(user1);
            var hasUser2 = await conversation.hasUser(user2);
            return hasUser1 && hasUser2;
        });

        return result.length > 0 ? result[0] : null;
    }

    async get(userToken, organizationId){
        var org = await OrganizationDao.findById(organizationId);
        var user = await UserDao.findByToken(userToken);

        var orgConversations = await org.getConversations({include: [{ association: Conversation.users, attributes: { exclude: ['token'] }}]});

        var userConversations = await filter(orgConversations, async (conversation) => {
            return await conversation.hasUser(user);
        });

        return userConversations;
    }

}

module.exports = new ConversationDao();