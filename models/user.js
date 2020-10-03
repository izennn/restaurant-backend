const mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


const User = new mongoose.Schema({
	firstname: {
		type: String,
		default: ''
	},
	lastname: {
		type: String,
		default: ''
	},
	facebookId: String, // stores facebook ID of user that has passed in access token
	admin: {
		type: Boolean,
		default: false
	}
});

/* passport-local-mongoose plugin automatically adds in username & 
hashed passowrd, along with additional methods */
User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User);
