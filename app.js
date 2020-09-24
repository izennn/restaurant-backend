var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

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

// use session
app.use(session({
  name: 'session-id',
  secret:'12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

// we provide a secret key to encrypt & sign the cookie sent from server to client
// app.use(cookieParser('12345-67890-09876-54321')); 

function notAuthenticatedErrResponse(res) {
  var err = new Error('You are not authenticated');
  res.setHeader('WWW-Authenticate', 'Basic');
  err.status = 403;
  return err;
}

function auth(req, res, next) {
  // check if client req has properties signedCookies or signedCookies.user: 
  console.log(req.session);

  if (!req.session.user) {
    var authHeader = req.headers.authorization;
    // if client req does not contain auth header: 
    if (!authHeader) 
    {
      next(notAuthenticatedErrResponse(res));
      return;
    }
    // else we know auth header exists: 
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':'); 
    var username = auth[0];
    var password = auth[1];

    // for the moment, use mock username & password
    if (username === 'admin' && password === 'password') {
      // include 'user' into the singed cookie with value 'admin'
      // now all subsequent calls to client will include this cookie

      // res.cookie('user', 'admin', { signed: true }); 
      req.session.user = 'admin';
      next();
    }
    else {
      // generate error, challenge client to send in correct authorization
      next(notAuthenticatedErrResponse(res));
    }    
  }
  else { // if req contains signed cookie 'user'
    if (req.session.user === 'admin') {
      next();
    }
    else {
      return next(notAuthenticatedErrResponse(res));
    }
  }
}

// authentification middleware
// this middleware is put before: express.static and routes
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
const connect = mongoose.connect(
  url, 
  {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true 
  }
);

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
