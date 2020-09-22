const express = require('express');
const bodyParser = require('body-parser');

// mongoose & model
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');

// API restpoint handling for /dishes
const dishRouter = express.Router();

dishRouter.use(bodyParser.json())

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

module.exports = dishRouter;
