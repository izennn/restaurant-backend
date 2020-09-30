const express = require('express');
const bodyParser = require('body-parser');

// cors
const cors = require('./cors');

// authenticate
const authenticate = require('../authenticate');

// mongoose & mongo
const Leader = require('../models/leaders');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

// route takes endpoint as parameter
leaderRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next(); // will continue to look for functions that match '/dishes/ endpoint
})
.get(cors.cors, (req, res, next) => {
	Leader.find({})
	.then((leaders) => {
		res.json(leaders);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Leader.create(req.body)
	.then((leader) => {
		res.json(leader);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /leader');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Leader.remove({})
	.then((leader) => {
		res.json(leader);
	}, (err) => next(err))
	.catch((err) => next(err));
})

leaderRouter.route('/:leaderId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.all(cors.cors, (req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next();
})
.get((req, res, next) => {
	// GET result for a specified leader
	const { params } = req;

	Leader.findById(params.leaderId)
	.then((leader) => {
		res.json(leader);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	// POST operation not supported on specified promo
	res.statusCode = 403;
	res.setHeader('Content-Type', 'html/txt');
	res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	// UPDATE specified leader
	Leader.findByIdAndUpdate(req.params.leaderId, {
		$set: req.body
	}, { new: true })
	.then((leader) => {
		res.json(leader)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	// DELETE a specified leader
	Leader.findByIdAndRemove(req.params.leaderId)
	.then((leader) => {
		res.json(leader);
	}, (err) => next(err))
	.catch((err) => next(err));
});

module.exports = leaderRouter;