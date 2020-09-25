var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

/* This file stores authentication stsrategies */

// if not using local mongoose passport, replace 'User.authenticate' with custom authenticater
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());