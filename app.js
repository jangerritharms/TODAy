/* global __dirname */
var express = require("express");
var http = require("http");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var ejs = require("ejs");
var passport = require("passport");
var stylus = require('stylus');
var nib = require('nib');
var db = require("./db");
var port = 3000;
var app = express();

require("./config/passport")(passport);
    
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .define('bg_color', '#0f0f38')
    .define('fg_color', '#ebeff0')
    .use(nib());
}

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.static(__dirname + "/client"));
app.use(stylus.middleware(
  { src: __dirname + '/client/css'
  , compile: compile
  }
));
app.use(session({secret: 'twitterLogin'}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use('/', require('./routes/index'));
app.use('/todo', require('./routes/todo'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/profile', require('./routes/profile'));


db.connect({
  host: 'localhost',
  user: 'root',
  password: 'webdata',
  database: 'todo'
}, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  else
    http.createServer(app).listen(port);
});
