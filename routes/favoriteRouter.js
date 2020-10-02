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
			Favorites.create({
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
				if (favoritesList.dishes.indexOf(dish) === -1) {
					favoritesList.dishes.push(dish)
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
	Favorites.find({author: OjbectId(current_userId)}).exec()
	.then((favoritesList) => {
		if (!favoritesList) {
			let err = new Error(`Favorites list for user with user ID ${current_userId} could not be found.`);
			err.status = 404;
			return next(err);	
		} else {
			db.collection.findOneAndDelete({author: current_userId}).exec()
			.then((favoritesList) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favoritesList)
			}, (err) => next(err))
			.catch((err) => next(err));
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.option((res, req) => {res.sendStatus(200);})
.get(authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end('GET operation not supported on /favorites/:dishId');
})
.put(authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end('GET operation not supported on /favorites/:dishId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	// firstly check if :dishId valid?
	// if valid check if dishId already in favorites list
	Favorites.find({author: ObjectId(req.user._id)}).exec()
	.then((favoritesList) => {
		if (!favoritesList) {
			let err = new Error(`Favorites list for user with user ID ${current_userId} could not be found.`);
			err.status = 404;
			return next(err);	
		} else {
			const dishId = req.params.dishId;

			if (favoritesList.dishes.indexOf(dishId) === -1) {
				// append dish ID to favorites list
				favoritesList.dishes.push(dishId);
				favoritesList.save()
				.then((list) => {
					res.setStatus = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(list);
				}, (err) => next(err));
			} else {
				res.status = 200;
				res.end(`Dish with ID ${dishId} is already in favorites list!`);
			}			
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({author: ObjectId(req.user._id)}).exec()
	.then((favoritesList) => {
		if (!favoritesList) {
			let err = new Error(`Favorites list for user with user ID ${current_userId} could not be found.`);
			err.status = 404;
			return next(err);	
		} else {
			const dishId = req.params.dishId;
			const dishIdIndex = favoritesList.dishes.indexOf(dishId);

			if (dishIdIndex !== -1) {
				favoritesList.dishes.splice(dishIdIndex, 1);
				favoritesList.save()
				.then((list) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(list);
				}, (err) => next(err));
			} else {
				res.setStatus = 200;
				res.end(`Dish with ID ${dishId} is already in favorites list!`);
			}			
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});

module.exports = favoriteRouter;