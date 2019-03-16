class Message{

	constructor(message){
		this.message = message;
		this.date = 1234;
	}

	getMessage(){
		return this.message;
	}
}

module.exports = Message;