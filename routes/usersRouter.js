var express = require('express');
const bodyParser = require('body-parser');

const cors = require('./cors');

// mongoose model
var User = require('../models/user');

// authenticate methods
var passport = require('passport');
var authenticate = require('../authenticate');

// router
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) // for any endpoint if recieve options, 
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({}).exec()
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))    
  .catch((err) => next(err));
});

/* POST user sign up */
router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  // Before using passport: 
  // User.findOne({}).then().catch()

  // User.register comes from passport-local-mongoose plugin to User schema
  User.register(new User({username: req.body.username}), 
  req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      });
    }
    else {
      // authenticate again with passport
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCod = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({
            success: true, // quickly check if registration successful
            status: 'Registration Successful!',
            user: user
          });
        });
      })
    }
  });
});

/* POST operation for user login; body contains auth header */
router.post('/login', cors.corsWithOptions, (req, res, next) => {
  /* authenticate.getToken(user) uses jwt.sign method, which creates a token
   * jwt.sign(payload, options)
   * req.user contains _id, and is present because of passport.authenticate('local') middleware
  */

  // move authenticate to down here to help distinguish between auth err or user login error  
  passport.authenticate('local', (err, user, info) => {
    if (err) 
      return next(err);
    if (!user) {
      // user not found? or password incorrect
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: false,
        status: 'Login Unsuccessful!',
        err: info
      });
    } 
    // if no error && user not null, pass in logIn func
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: false,
          status: 'Login Unsuccessful!',
          err: 'Could not login user!'
        });
      }
      
      var token = authenticate.getToken({_id: req.user._id}); // create token
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        token: token, // pass token back to client
        status: "Login Successful",
      });
    }) 
  })(req, res, next); // why do we need to append these?
});

/* GET logout: on success, no need for 'next()' function */
router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  /*
  if (req.session) {
    req.session.destroy(); // destroy session
    res.clearCookie('session-id'); // remove cookie w name 'session-id'
    res.redirect('/'); // redirect to homepage
  }
  else {
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
  */
  req.logout();
  res.redirect('/');
});

// Facebook login
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  // if passport auth successful, there will be user in req, as done by passport's done()
  if (req.user) {
    let token = authenticate.getToken({_id: req.user._id});
    // once we get JWT we don't need FB token anymore
    res.status = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token: token,
      status: 'You are succesfully logged in!'
    });
  }
});

// handle if JWT expired
router.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', (session: false), (err, user, info) => {
    if (err) {
      return next(err); // let express err handle 
    }
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT Invalid',
        success: false,
        err: info
      })
    }
    else {
      // valid user
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT Valid',
        success: true,
        user: user
      })
    }
  }) (req, res);
})

module.exports = router;
