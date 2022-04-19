var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash    = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var passportConfig = require('./config/passport')
var db = require('./config/database.js');

var routes = require('./controller/routes.js');

passportConfig(passport, db);
var app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));

//middleware that is used to make passport work, as well as work with the pg client
//Your sessions table stores sessions of people who are logged in
app.use(morgan('dev')); // log every request to the consolee
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(session({
	secret: "secret",
	resave : true,
	saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session

routes(app, passport, db);
app.use(express.static('./client'));

var PORT = process.env.PORT || 7000;

app.listen(PORT, function(){
	console.log("Listening on PORT " + PORT);
});
