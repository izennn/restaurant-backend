var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function auth(req, res, next) {
  // we will change request headers to include auth

  console.log(req.headers);

  var authHeader = req.headers.authorization;
  if (!authHeader) // if client did not provide auth header
  {
    var err = new Error('You are not authenticated.')

    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401; // unauthorized access
    next(err);
    return;
  }
  // else we know auth header exists: 
  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':'); 
  // because auth header is "Basic QWxh..."
  // then split again because username & password separated by ':'

  var username = auth[0];
  var password = auth[1];

  // for the moment, use mock username & password
  if (username === 'admin' && password === 'password') {
    next();
  }
  else {
    // generate error, challenge client to send in correct authorization
    var err = new Error('You are not authenticated.');

    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    next(err);
  }
}

// authentification middleware
// clients should have to go through authentification middleware to use routes
app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// mongoose server
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');

// establish connection to Mongo server
const url = 'mongodb://localhost:27017/restaurant';
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connected correctly to server');
}, (err) => console.log(err));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
