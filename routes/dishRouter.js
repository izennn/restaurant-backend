const express = require('express');
const bodyParser = require('body-parser');

// cors
const cors = require('./cors');

// authenticate
const authenticate = require('../authenticate');

// mongoose model function
const Dishes = require('../models/dishes');

// API restpoint handling for /dishes
const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// route takes endpoint as parameter
dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
	// fetch all dishes using db.collection.find
	// when dishes are constructed, populate author field w user
	Dishes.find({})
	.populate('comments.author')
	.then((dishes) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		// takes JSON string and puts it in response body
		res.json(dishes);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	// res.end('Will add info to dish: ' + req.body.name
	// + " with details: " + req.body.description); // expect a "name" field in JSON 
	Dishes.create(req.body)
	.then((dish) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish);
	}, (err) => next(err))
	.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Dishes.deleteMany({})
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
})

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Dishes.findByIdAndUpdate(req.params.dishId, {
		$set: req.body 
	}, { new: true }) // new: true returns object after udpate AFTEr update was applied (v.s. BEFORE)
	.then((dish) => {
		console.log(`Updated dish with dish ID ${req.params.dishId}`);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Dishes.findByIdAndRemove(req.params.dishId)
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish) => {
		// handle if dish with dishId not exist
		if (dish !== null) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish.comments);	
		}
		else {
			err = new Error(`Dish ${req.params.dishId} not found.`);
			err.status = 404;
			// next will be handled by error handler in app.js
			return next(err);
		}
	}, (err) => next(err))	
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		if (dish !== null) {
			// insert author into req.body, get user from req.user
			// user exists because we used authenticate.verifyUser, 
			// the passport authorized JWT loads user info into req.body in form of req.user
			req.body.author = req.user._id;
			dish.comments.push(req.body);
			dish.save()
			.then((dish) => {
				Dishes.findById(dish._id)
				.populate('comments.author')
				.then((dish) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish);
				})
			}, (err) => next(err));
		}
		else {
			err = new Error(`Dish ${req.params.dishId} not found.`)
			err.status = 404;
			return next(err);
			// else will be handled by app.js error handler
		}
	}, (err) => next(err))
	.catch((err) => next(er));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end(`PUT operation not supported on /dishes/${req.params.dishId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	const { params, body } = req;

	Dishes.findById(params.dishId)
	.then((dish) => {
		const current_userid = req.user._id;

		if (dish !== null) {
			let author_id;
			for (let i = dish.comments.length - 1; i >= 0; i--) {
				// var author_id = mongoose.Types.ObjectId(dish.comments.id(dish.comments[i]).author._id);
				author_id = dish.comments.id(dish.comments[i]._id).author._id;

				// primative (bool, string, number, null, undefined, symbol) vs Object
				// only ojbects have methods (.equals())
				// for objects, '---' means check reference whereas '.equals()' checks value
				if (author_id.equals(current_userid)) {
					dish.comments.id(dish.comments[i]._id).remove();
				}
			}
			dish.save()
			.then((dish) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dish);
			}, (err) => next(err))
			.catch((err) => next(err));
		}
		else {
			err = new Error(`Dish with ID ${params.dishId} could not be found.`);
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
	const { params, body } = req;
	Dishes.findById(params.dishId)
	.populate('comments.author')
	.then((dish) => {
		if (dish !== null && dish.comments.id(params.commentId) !== null) {
			console.log(`Found comment with ${params.commentId}`);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish.comments.id(params.commentId));
		}
		else if (dish === null) {
			err = new Error(`Could not find dish with ID: ${params.dishId}`);
			err.status = 404;
			return next(err);
		}
		else {
			err = new Error(`Could not find comment with ID: ${params.commentId}`);
			err.status = 404;
			return next(err);
		}
	}, err => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end(`POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	const { params, body } = req;
	const { dishId, commentId } = params;

	Dishes.findById(dishId)
	.then((dish) => {
		if (dish !== null && dish.comments.id(commentId) !== null) {
			const current_userid = req.user._id;
			const author_id = dish.comments.id(commentId).author._id;

			if (current_userid.equals(author_id)) {
				if (body.rating) {
					dish.comments.id(commentId).rating = body.rating;
				}
				if (body.comment) {
					dish.comments.id(commentId).comment = body.comment;
				}

				dish.save()
				.then((dish) => {
					// search for dish, populate comments author into dish
					Dishes.findById(dish._id)
					.populate('comments.author')
					.then((dish) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);
					})
				}, (err) => next(err));
			}
			else {
				let err = new Error('You are unauthorized to perform this action!');
				err.status = 401;
				return next(err);
			}
		}
		else if (dish === null) {
			err = new Error(`Could not find dish with ID: ${dishId}`);
			err.status = 404;
			return next(err);
		}
		else {
			err = new Error(`Could not find comment with ID: ${commentId}`);
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	const { params } = req;
	const { dishId, commentId } = params;

	Dishes.findById(dishId)
	.then((dish) => {
		if (dish !== null && dish.comments.id(commentId) !== null) {
			const current_userid = req.user._id;
			const author_id = dish.comments.id(commentId).author._id;

			if (current_userid.equals(author_id)) {
				dish.comments.id(commentId).remove();
			}
			else {
				let err = new Error('You are unauthorized to perform this action!');
				err.status = 401;
				return next(err);
			}
			
			dish.save()
			.then((dish) => {
				Dishes.findById(dish._id)
				.populate('comments.author')
				.then((dish) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish);
				})
			}, (err) => next(err));
		} else if (dish === null) {
			err = new Error(`Could not find dish with ID: ${dishId}`);
			err.status = 404;
			return next(err);
		} else {
			err = new Error(`Could not find comment with ID: ${commentId}`);
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})

module.exports = dishRouter;
