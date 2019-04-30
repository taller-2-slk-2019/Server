var models = require('../database/sequelize');
var Message = models.message;
var Op = models.Sequelize.Op;

class MessageStatisticsDao {

    async getMessagesCountByChannel(channelId) {
        return await Message.count({
            where: {
                channelId: channelId
            }
        });
    }

    async getMessagesCountByUser(userId) {
        return await Message.count({
            where: {
                senderId: userId
            }
        });
    }

    async getMessagesCountByOrganization(organization) {
        var [channels, conversations] = await Promise.all([
                organization.getChannels().map(channel => channel.id),
                organization.getConversations().map(conversation => conversation.id)
            ]);

        return await Message.count({
            attributes: ['type'],
            where: {
                [Op.or]: [{channelId: channels}, {conversationId: conversations}]
            },
            group: ['type']
        });
    }
}

module.exports = new MessageStatisticsDao();