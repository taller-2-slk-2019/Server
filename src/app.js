var express = require('express');
var app = express();


var logger = require('logops');
logger.format = logger.formatters.dev;

var bodyParser = require('body-parser');
app.use(bodyParser.json());


//Set routers
var usersRouter = require('./routes/UsersRoutes');
app.use('/users', usersRouter);

var organizationsRouter = require('./routes/OrganizationsRoutes');
app.use('/organizations', organizationsRouter);

var channelsRouter = require('./routes/ChannelsRoutes');
app.use('/channels', channelsRouter);

var messagesRouter = require('./routes/MessagesRoutes');
app.use('/messages', messagesRouter);

var forbiddenWordsRouter = require('./routes/ForbiddenWordsRoutes');
app.use('/forbiddenWords', forbiddenWordsRouter);


app.all('*', function(req, res){
    logger.warn('Invalid Api called Method: %s  Url: %s', req.method, req.url);
    res.send('Invalid Api');
});


var port = process.env.PORT || 3000;

app.listen(port, function () {
    logger.info('App listening in port %i', port);
});

module.exports = app;