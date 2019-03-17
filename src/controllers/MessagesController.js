var User = require('../db/sequelize').User;
var Organization = require('../db/sequelize').Organization;
var UserRole = require('../db/sequelize').UserRole;
var UserOrganizations = require('../db/sequelize').UserOrganizations;

class MessagesController{

    async index(req, res){
        var org = await Organization.findByPk(1, 
            { include: [
                { model: User }
            ]}
        );

        //var orgs = await user.getOrganizations();

        res.send(org);
    }

    async show(req, res){
        var m = await Message.findByPk(req.params.id);
        console.log(m.getName());
        console.log(JSON.stringify(m));
        res.send(m);
    }

    async create(req, res){
        await Message.create(req.body);
        res.send(req.body);
    }

    delete(req, res){
        console.log('delete: ', req.params.id);
        res.send(req.params);
    }
}

module.exports = new MessagesController();