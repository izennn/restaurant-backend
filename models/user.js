const mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


const User = new mongoose.Schema({
	firstname: {
		type: String,
		default: ''
	},
	lasttname: {
		type: String,
		default: ''
	},
	admin: {
		type: Boolean,
		default: false
	}
});

/* passport-local-mongoose plugin automatically adds in username & 
hashed passowrd & additional methods */
User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User);
