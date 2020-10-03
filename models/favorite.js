const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
	author: {
		type: mongoose.Types.ObjectId,
		ref: 'User'
	},
	dishes: [{
		type: mongoose.Types.ObjectId,
		ref: 'Dish'
	}]
}, {
	timestamps: true
});

const Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;