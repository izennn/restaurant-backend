var express = require('express');
const bodyParser = require('body-parser');

// mongoose model
var User = require('../models/user');

// router
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* create and return new Error object w custom message & status */
function createErr(message, status) {
  var err = new Error(message);
  err.status = status;
  return err;
}

/* POST user sign up */
router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if (user !== null) {
      var customErr = createErr(`User with username ${req.body.username} already exists.`, 403);
      next(customErr);
    } else {
      return User.create({
        username: req.body.username,
        password: req.body.password,
      })
    }
  })
  .then((user) => {
    // promise returned from User.create
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      status: "registration Successful", 
      user: user
    })
  }, (err) => next(err))
  .catch((err) => next(err));
});

/* POST operation for user login; body contains auth header */
router.post('/login', (req, res, next) => {
  if (!req.session.user) {
    var authHeader = req.headers.authorization;
    // if client req does not contain auth header: 
    if (!authHeader) 
    {
      var error = createErr('You are not autehnticated!', 401);
      res.setHeader('WWW-Authenticate', 'Basic');
      return next(error);
    }
    // else we know auth header exists: 
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':'); 
    var username = auth[0];
    var password = auth[1];

    // search in DB if username, username & password combo exists
    User.findOne({username: username})
    .then((user)=> {
      if (user === null) {
        return next(createErr(`User ${username} does not exist!`, 403));
      }
      else if (user.password !== password) {
        return next(createErr('Your password is incorrect', 403));
      } 
      else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!');
      }
    }, (err) => next(err))
    .catch((err) => next(err));
  }
  else { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated')
  }
});

/* GET on logout, also no need to send further info (no need for next) */
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(); // destroy session
    res.clearCookie('session-id'); // remove cookie w name 'session-id'
    res.redirect('/'); // redirect to homepage
  }
  else {
    next(createErr('You are not logged in!', 403));
  }
})

module.exports = router;
