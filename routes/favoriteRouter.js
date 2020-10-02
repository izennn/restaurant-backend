const express = require('express');
const bodyParser = require('body-parser');

// cors
const cors = require('./cors');

// authenticate
const authenticate = require('../authenticate');

// mongoose model function
const Favorites = require('../models/favorite');

// create Favorites Express router
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser);

favoriteRouter.route('/')
.options(cors.withOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	const current_userId = req.user._id;
	// find favorites list associated with current user ID
	// once found, populate w user & dishes info
	Favorites.find({author: ObjectId(current_userId)}).exec()
	.populate('author')
	.populate('dishes')
	.then((favoritesList) => {
		if (favoritesList == null) {
			let err = new Error(`Favorites list for user with user ID ${current_userId} could not be found.`);
			err.status = 404;
			return next(err);	
		}
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(favoritesList);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put((req, res, next) => {
	res.statusCode = 403;
	res.end(`PUT operation not supported on /favorites route.`)
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	const current_userId = req.user._id;
	Favorites.find({author: ObjectId(current_userId)}).exec()
	.find((favoritesList) => {
		const newDishes = req.body;
		if (!favoritesList) {
			// create new favoritesList for user if nothing found
			Favorites.createOne({
				author: current_userId;
				dishes: newDishes;
			})
			.then((favoritesList) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favoritesList);
			}, (err) => next(err))
			.catch((err) => next(err));
		} else {
			let touched = false;
			for (dish in newDishes) {
				if (favoritesList.indexOf(dish) === -1) {
					favoritesList.push(dish)
					touched = true;
				}
			}
			if (touched) {
				favoritesList.save()
				.then((favoritesList) => {
					Favorites.findById(favoritesList._id)
					.populate('author')
					.populate('dishes')
					.then((favoritesList) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favoritesList);
					}, (err) => next(err));
				}, (err) => next(err))
				.catch((err) => next(err));
			}
		}
	}, (err) => next(er))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	// DELETE favorites list associated with current user
	const current_userId = req.user._id;
	Favorites.find({author: current_userId}).exec()
	.then((favoritesList) => {
		if (!favoritesList) {
			let err = new Error(`Favorites list for user with user ID ${current_userId} could not be found.`);
			err.status = 404;
			return next(err);	
		} else {
			favoritesList.dump()
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});

// favoriteRouter.route('/:dishId')

module.exports = favoriteRouter;