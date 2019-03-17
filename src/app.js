var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());


//Set routers
var usersRouter = require('./routes/users');
app.use('/users', usersRouter);


app.get('/', function(req, res){
    res.send("Welcome to Taller2-Slack");
});


var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`App listening in port ${port}`);
});

module.exports = app;