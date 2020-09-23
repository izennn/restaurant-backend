const mongoose = require('mongoose');

const leaderSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	}, 
	image: {
		type: String,
		required: true
	},
	designation: {
		type: String,
		requried: true
	},
	abbr: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	featured: {
		type: Boolean,
		required: true,
		default: false
	}
}, {
	timestamp: true
});

const Leader = mongoose.model('Leader', leaderSchema);

module.exports = Leader;