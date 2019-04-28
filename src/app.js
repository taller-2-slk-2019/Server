var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());

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

var conversationsRouter = require('./routes/ConversationsRoutes');
app.use('/conversations', conversationsRouter);

var messagesRouter = require('./routes/MessagesRoutes');
app.use('/messages', messagesRouter);

var forbiddenWordsRouter = require('./routes/ForbiddenWordsRoutes');
app.use('/forbiddenWords', forbiddenWordsRouter);

var botsRouter = require('./routes/BotsRoutes');
app.use('/bots', botsRouter);

var adminRouter = require('./routes/AdminUsersRoutes');
app.use('/admin', adminRouter);

var firebaseRouter = require('./routes/FirebaseRoutes');
app.use('/firebase', firebaseRouter);


app.all('*', function(req, res){
    logger.warn('Invalid Api called   Method: %s  Url: %s', req.method, req.url);
    res.status(404).send('Invalid Api');
});


var port = process.env.PORT || 3000;

app.listen(port, function () {
    logger.info('App listening in port %i', port);
});

module.exports = app;
