var randtoken = require('rand-token');

var channelCreateData = function() {
    return {
        name: "channel" + randtoken.generate(20),
        isPublic: true,
        description: "description for channel", 
        welcome: "welcome to the channel!"
    };
};

module.exports = { 
    channelCreateData: channelCreateData,
};