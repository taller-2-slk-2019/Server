var moment = require('moment');
var { Op } = require('sequelize');
var models = require('../database/sequelize');
var RequestStats = models.requestStats;
const STATS_DAYS_OLD = 30;

class RequestStatsDao{

    async save(request){
        return await RequestStats.create(request);
    }

    async get(){
        return await RequestStats.findAll({
            where: {
                createdAt: {
                    [Op.gte]: moment().subtract(STATS_DAYS_OLD, 'days').toDate()
                }
            }
        });
    }
}

module.exports = new RequestStatsDao();