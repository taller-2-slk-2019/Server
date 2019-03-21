var express = require('express');
var app = express();

var logger = require('logops');
logger.format = logger.formatters.dev;

var bodyParser = require('body-parser');
app.use(bodyParser.json());


//Set routers
var usersRouter = require('./routes/users');
app.use('/users', usersRouter);

var organizationsRouter = require('./routes/organizations');
app.use('/organizations', organizationsRouter);

var channelsRouter = require('./routes/channels');
app.use('/channels', channelsRouter);


app.get('/', function(req, res){
    res.send("Welcome to Taller2-Slack");
});


var port = process.env.PORT || 3000;

app.listen(port, function () {
    logger.info('App listening in port %i', port);
});

module.exports = app;