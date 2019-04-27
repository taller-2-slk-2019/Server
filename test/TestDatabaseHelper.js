var models = require('../src/database/sequelize');
var User = models.user;
var AdminUser = models.adminUser;
var Organization = models.organization;
var Channel = models.channel;
var Conversation = models.conversation;
var Message = models.message;

var { forEach } = require('p-iteration');

const { userCreateData } = require('./data/userData');
const { adminUserCreateData } = require('./data/adminUserData');
const { organizationCreateData } = require('./data/organizationData');
var { channelCreateData } = require('./data/channelData');
var { conversationCreateData } = require('./data/conversationData');
var { messageCreateData } = require('./data/messageData');

class TestDatabaseHelper {

    async createUser(email = '') {
        var data = Object.create(userCreateData());
        if (email) {
            data.email = email;
        }
        return await User.create(data)
    }

    async createAdminUser(username = 'admin') {
        var data = Object.create(adminUserCreateData());
        data.username = username;
        return await AdminUser.create(data)
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

    async createChannelMessage(msg, channel, user) {
        var data = Object.create(messageCreateData);
        data.senderId = user.id;
        data.channelId = channel.id;
        data.data = msg;
        return await Message.create(data);
    }

    async createConversationMessage(msg, conversation, user) {
        var data = Object.create(messageCreateData);
        data.senderId = user.id;
        data.conversationId = conversation.id;
        data.data = msg;
        return await Message.create(data);
    }
}

module.exports = new TestDatabaseHelper();