const mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


const User = new mongoose.Schema({
	admin: {
		type: Boolean,
		default: false
	}
});

/* plugin automatically adds in username & 
hashed passowrd & additional methods */
User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User);
