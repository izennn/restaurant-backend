var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

/* This file stores authentication stsrategies */

// if not using local mongoose passport, replace 'User.authenticate' with custom authenticater
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* getToken using jwt.sign
 * Given user payload, return signed token
 * this method leverages jwt.sign(payload, secret key, options)
 * and returns the jwt
 */
exports.getToken = function(user) {
	return jwt.sign(
		user,
		config.secretKey,
		{ expiresIn: 3600 }
	)
};

// JwtStrategy(options, verify)
var opts = {};
// extract jwt from header Authentication: 'bearer xxx'
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(
	opts,
	(jwt_payload, done) => {
		console.log(`JWT payload: ${jwt_payload}`);
		User.findOne({_id: jwt_payload._id}, (err, user) => {
			// done is the callback provided by passport; loads things onto request message
			// method type: (error: any, user?: any, info?: any): void
			if (err) {
				return done(err, false)
			} else if (user) {
				return done(null, user)
			} else {
				return done(null, false);
			}
		});
	}
));

/* verfiyUser using passport.authenticate
 * Middleware to be ran on HTTP methods on routes
 * (e.g. dishRouter.route('/').post(authenticate.verifyUser, (req, res, next) => {}))
 *
 * uses passport.authenticate method which takes in parameters: strategy, options
 */
exports.verifyUser = passport.authenticate(
	'jwt', 
	{ session: false }
);

exports.verifyAdmin = function(req, res, next) {
	if (!req.user.admin) {
		var err = new Error("You are not authorized to perform this action!");
		err.status = 401;
		return next(err);
	}
	else {
		next();
	}
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy(
	{
		clientID: config.facebook.clientId,
		clientSecret: config.facebook.clientSecret,
	}, (accessToken, refreshToken, profile, done) => {
		User.findOne({facebookId: profile.id}, (err, user) => {
			if (err) {
				// on error!
				return done(error, false);
			}
			if (!err && user !== null) {
				// if user exists
				return done(null, user);
			}
			else {
				// if user is null (doesn't exist)?
				user = new User({
					username: profile.displayName
				});
				user.facebookId = profile.id;
				user.firstname = profile.name.givenName;
				user.lastname = profile.name.familyName;
				user.save((err, user) => {
					if (err) {
						return done(err, false);
					}
					else {
						return done(null, user);
					}
				});
			}
		})
	}
));