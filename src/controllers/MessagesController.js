var Message = require('../models/Message');

class MessagesController{

	index(req, res){
		res.send("Hello world from heroku and travis");
	}

	show(req, res){
		var m = new Message("Hello World from message");
		console.log("Created message");
		console.log(m);
		console.log(JSON.stringify(m));
		res.send(m.getMessage());
	}

	create(req, res){
		console.log('name', req.body.name);
		console.log('age', req.body.age);
		res.send(req.body);
	}

	delete(req, res){
		console.log('delete: ', req.params.id);
		res.send(req.params);
	}
}

module.exports = new MessagesController();