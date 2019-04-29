var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Bot = models.bot;
var { BotAlreadyExistsError } = require('../helpers/Errors');

class BotDao{

    async get(organizationId){
        return await Bot.findAll({
            where: {organizationId: organizationId}
        });
    }

    async create(botData){
        var org = await OrganizationDao.findById(botData.organizationId);

        var orgBots = (await org.getBots()).map((bot) => {
            return bot.name;
        });

        if (orgBots.includes(botData.name)){
            throw new BotAlreadyExistsError(botData.name, org.id);
        }
        
        return await Bot.create(botData);
    }

    async findByName(name, organizationId){
        return await Bot.findOne({
            where: {organizationId: organizationId,
                    name: name }
        });
    }

    async delete(id){
        await Bot.destroy({
            where: {
                id: id
            }
        });
    }

}

module.exports = new BotDao();