const express = require('express');
const bodyParser = require('body-parser');

// mongoose & model
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');

// API restpoint handling for /dishes
const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// route takes endpoint as parameter
dishRouter.route('/')
.get((req, res, next) => {
	// fetch all dishes using db.collection.find
	Dishes.find({})
	.then((dishes) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		// takes JSON string and puts it in response body
		res.json(dishes);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post((req, res, next) => {
	// res.end('Will add info to dish: ' + req.body.name
	// + " with details: " + req.body.description); // expect a "name" field in JSON 
	Dishes.create(req.body)
	.then((dish) => {
		console.log("Created dish: ", dish);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish);
	}, (err) => next(err))
	.catch(err => next(err));
})
.put((req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
	Dishes.remove({})
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
})

dishRouter.route('/:dishId')
.get((req, res, next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post((req, res, next) => {
	res.statusCode = 403;
	res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
})
.put((req, res, next) => {
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
.delete((req, res, next) => {
	Dishes.findByIdAndRemove(req.params.dishId)
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.get((req, res, next) => {
	Dishes.findById(req.params.dishId)
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
.post((req, res, next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		if (dish !== null) {
			// body of req has the comments, push it into dish.comments array
			dish.comments.push(req.body);
			dish.save()
			.then((dish) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				// return updated dish
				res.json(dish);
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
.put((req, res, next) => {
	res.statusCode = 403;
	res.end(`PUT operation not supported on /dishes/${req.params.dishId}/comments`);
})
.delete((req, res, next) => {
	const { params, body } = req;
	Dishes.findById(params.dishId)
	.then((dish) => {
		if (dish !== null) {
			// delete each comment
			for (var i = dish.comments.length - 1; i >= 0; i--) {
				dish.comments.id(dish.comments[i]._id).remove();
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
.get((req, res, next) => {
	const { params, body } = req;
	Dishes.findById(params.dishId)
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
.post((req, res, next) => {
	res.statusCode = 403;
	res.end(`POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`);
})
.put((req, res, next) => {
	const { params, body } = req;
	const { dishId, commentId } = params;

	Dishes.findById(dishId)
	.then((dish) => {
		if (dish !== null && dish.comments.id(commentId) !== null) {
			// udpate specified comment with req.body values
			if (body.rating) {
				dish.comments.id(commentId).rating = body.rating;
			}
			if (body.comment) {
				dish.comments.id(commentId).comment = body.comment;
			}

			dish.save()
			.then((dish) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dish);
			}, (err) => next(err));
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
.delete((req, res, next) => {
	const { params } = req;
	const { dishId, commentId } = params;

	Dishes.findById(dishId)
	.then((dish) => {
		if (dish !== null && dish.comments.id(commentId) !== null) {
			dish.comments.id(commentId).remove();
			
			dish.save()
			.then((dish) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dish);
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
