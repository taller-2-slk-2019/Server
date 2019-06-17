var models = require('../database/sequelize');
var RequestStats = models.requestStats;

class RequestStatsDao{

    async save(request){
        await RequestStats.create(request);
    }
}

module.exports = new RequestStatsDao();