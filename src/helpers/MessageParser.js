var Config = require('./Config');

class MessageParser {

    getMentionedUsers(message){
        var words = message.split(" ");
        var users = [];

        words.forEach((word) => {
            if (word.startsWith(Config.messageUserMentionChar)){
                var user = word.substr(1);
                if (user && !users.includes(user)){
                    users.push(user);
                }
            }
        });

        return users;
    }

}

module.exports = new MessageParser();