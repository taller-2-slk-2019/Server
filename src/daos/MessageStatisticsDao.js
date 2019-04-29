var models = require('../database/sequelize');
var Message = models.message;

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
}

module.exports = new MessageStatisticsDao();