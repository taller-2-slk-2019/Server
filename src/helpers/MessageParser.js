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

    replaceForbiddenWords(message, words){
        var messageWords = message.split(" ");
        var messageParsed = [];

        messageWords.forEach((word) => {
            if (words.includes(word)){
                messageParsed.push(Config.forbiddenWordsReplacement);
            } else {
                messageParsed.push(word);
            }
        });

        return messageParsed.join(' ');
    }

}

module.exports = new MessageParser();