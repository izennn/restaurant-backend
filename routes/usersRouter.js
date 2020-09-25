var express = require('express');
const bodyParser = require('body-parser');

// mongoose model
var User = require('../models/user');
var passport = require('passport');

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
  // Before passport, passport-local, passport-local-mongoose: 
  // User.findOne({}).then().catch()

  // With passport-local, passport-local-mongoose:
  User.register(new User({username: req.body.username}), 
  req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      })
    }
    else {
      // authenticate again with passport
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: true, // quickly check if registration successful
          status: 'Registration Successful!',
          user: user
        });
      })
    }
  });
});

/* POST operation for user login; body contains auth header */
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  /* Before passport: 
   * check req.session.user ?
   * check authHeader?
   * User.findOne.then().catch()
   * if returned user's username & password match, 
   * return req.session.user = 'authenticated'
  */

  /* With passport: 
   * 1. we expect username/password to be included in the body of the post msg
   * and we expect the username/password to be in body, not authHeader
   *
   * 2. Call passport.authenticate as middleware
   * If any error when running passport.authenticate, passport authenticate local will
   * authomatically send back a reply to the client about failture of auth
   * If no error, the next func (req, res, nect) => {} will be ran
  */
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    status: "Login Successful",
  });
});

/* GET on logout, also no need to send further info (no need for next) */
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(); // destroy session
    console.log("Destroyed sessions!");
    res.clearCookie('session-id'); // remove cookie w name 'session-id'
    res.redirect('/'); // redirect to homepage
  }
  else {
    next(createErr('You are not logged in!', 403));
  }
})

module.exports = router;
