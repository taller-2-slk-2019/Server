var Message = require('../db/sequelize').Message;

class MessagesController{

    index(req, res){
        res.send("Hello world from heroku and travis");
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