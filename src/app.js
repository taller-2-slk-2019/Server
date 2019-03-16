var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());


//Set routers
var messagesRouter = require('./routes/messages');
app.use('/messages', messagesRouter);


app.listen(80, function () {
  console.log('App listening in port 80');
});

module.exports = app;