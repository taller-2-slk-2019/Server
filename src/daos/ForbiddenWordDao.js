var OrganizationDao = require('./OrganizationDao');
var models = require('../database/sequelize');
var ForbiddenWord = models.forbiddenWord;
var { ForbiddenWordAlreadyExistsError } = require('../helpers/Errors');

class ForbiddenWordDao{

    async get(organizationId){
        return await ForbiddenWord.findAll({
            where: {organizationId: organizationId}
        });
    }

    async create(wordData){
        var org = await OrganizationDao.findById(wordData.organizationId);

        var orgWords = (await org.getForbiddenWords()).map((word) => {
            return word.word;
        });

        if (orgWords.includes(wordData.word)){
            throw new ForbiddenWordAlreadyExistsError(wordData.word, org.id);
        }
        
        return ForbiddenWord.create(wordData);
    }

    async delete(id){
        await ForbiddenWord.destroy({
            where: {
                id: id
            }
        });
    }

}

module.exports = new ForbiddenWordDao();