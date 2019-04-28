var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var Bot = models.bot;
var { BotAlreadyExistsError } = require('../helpers/Errors');

class BotDao{

    async get(organizationId){
        var org = await OrganizationDao.findById(organizationId);
        return await org.getBots();
    }

    async create(botData){
        var org = await OrganizationDao.findById(botData.organizationId);

        var orgBots = (await org.getBots()).map((bot) => {
            return bot.name;
        });

        if (orgBots.includes(botData.name)){
            throw new BotAlreadyExistsError(botData.name, org.id);
        }
        
        return Bot.create(botData);
    }

    async findByName(name, organizationId){
        var org = await OrganizationDao.findById(organizationId);

        var bots = await org.getBots({where: {name: name}});

        return bots.length > 0 ? bots[0] : null;
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