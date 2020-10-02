const mongoose = require('mongoose');

const favoriteDishSchema = new mongoose.Schema({
	dish: {
		type: mongoose.Types.ObjectId,
		ref: 'Dish'
	}
})

const favoriteSchema = new mongoose.Schema({
	author: {
		type: mongoose.Types.ObjectId,
		ref: 'User'
	},
	dishes: [ favoriteDishSchema ]
}, {
	timestamps: true
});

const Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = favorites;