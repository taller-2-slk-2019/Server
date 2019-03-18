var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set('views', __dirname + '/resources/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


//Set routers
var usersRouter = require('./routes/users');
app.use('/users', usersRouter);

var organizationsRouter = require('./routes/organizations');
app.use('/organizations', organizationsRouter);


app.get('/', function(req, res){
    res.send("Welcome to Taller2-Slack");
});

app.get('/doc', function(req, res){
    res.render('apiDoc.html');
});


var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`App listening in port ${port}`);
});

module.exports = app;