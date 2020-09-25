var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRouter');
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

// un-authenticated users can still access homepage and login paths
app.use('/', indexRouter);
app.use('/users', usersRouter);

/* we provide a secret key to encrypt & sign the cookie sent from server to client
app.use(cookieParser('12345-67890-09876-54321')); 
NOTE: we will not need cookieParser once we've installed express-session middleware */

/* return new Error with custom message & status */
function createErr(message, statusCode) {
  var err = new Error(message);
  err.status = statusCode;
  return err;
}

/* auth middleware to be ran before dish, leader, promotion routers */
function auth(req, res, next) {
  // check if client req has properties signedCookies or signedCookies.user: 
  console.log(req.session);

  if (!req.session.user) {
    return next(createErr('You are not authenticated!', 403));
  }
  else { 
    // if req contains session information
    if (req.session.user === 'authenticated') {
      next();
    }
    else {
      return next(createErr('You are not authenticated!', 403));
    }
  }
}
app.use(auth);

/* express static */
app.use(express.static(path.join(__dirname, 'public')));

/* custom routes that need to be put AFTER authentication */
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// mongoose server
const mongoose = require('mongoose');
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
