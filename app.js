var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const mongoose = require('mongoose');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

/* express router middleware */
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

/* use session as middleware when dealing with sessions
  app.use(session({
    name: 'session-id',
    secret: config.secret,
    saveUninitialized: false,
    resave: false,
    store: new FileStore({
      retries: 1
    })
  }));
*/

// passport middleware
app.use(passport.initialize());
// app.use(passport.session()); needed when using sessions

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

/* auth middleware to be ran before dish, leader, promotion routers 
  * Before passport: 
  * check if client req has session.user
  * if so, check if session.user === 'authenticated' (value that we set)
  * next()

  * With passport: 
  * req.user is automatically filled in for us
  * if req.user exists that means passport already authenticated for us  

  function auth(req, res, next) {
    if (!req.user) {
      return next(createErr('You are not authenticated', 403));      
    } else {
      next();      
    }
  }
  app.use(auth);

  * But with JWT, we don't need to run this auth before every route,
  * (we don't need to check if req.user exists)
*/

/* express static */
app.use(express.static(path.join(__dirname, 'public')));

/* custom routes that need to be put AFTER authentication */
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// establish connection to Mongo server
const url = config.mongoUrl;
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
