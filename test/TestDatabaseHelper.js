var models = require('../src/database/sequelize');
var User = models.user;
var Organization = models.organization;
var Channel = models.channel;
var Conversation = models.conversation;

var { forEach } = require('p-iteration');

const { userCreateData } = require('./data/userData');
const { organizationCreateData } = require('./data/organizationData');
var { channelCreateData } = require('./data/channelData');
var { conversationCreateData } = require('./data/conversationData');

class TestDatabaseHelper {

    async createUser(email = '') {
        var data = Object.create(userCreateData());
        if (email) {
            data.email = email;
        }
        return await User.create(data)
    }

    async createOrganization(users = []) {
        var org = await Organization.create(Object.create(organizationCreateData));
        await forEach(users, async (user) => {
            await org.addUser(user, {through: {role:'role'}});
        });
        return org;
    }

    async createChannel(user, organization) {
        var channelData = Object.create(channelCreateData);
        channelData.creatorId = user.id;
        channelData.organizationId = organization.id;
        var channel = await Channel.create(channelData);
        await channel.setUsers([user]);
        return channel;
    }

    async createConversation(user1, user2, organization) {
        var data = Object.create(conversationCreateData);
        data.organizationId = organization.id;
        var conversation = await Conversation.create(data);
        await conversation.addUsers([user1, user2]);
        return conversation;
    }
}

module.exports = new TestDatabaseHelper();