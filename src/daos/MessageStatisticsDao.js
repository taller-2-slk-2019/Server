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
}

module.exports = new MessageStatisticsDao();