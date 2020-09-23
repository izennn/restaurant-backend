const express = require('express');
const bodyParser = require('body-parser');

// mongoose & mongo
const Leader = require('../models/leaders');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

// route takes endpoint as parameter
leaderRouter.route('/')
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next(); // will continue to look for functions that match '/dishes/ endpoint
})
.get((req, res, next) => {

})
.post((req, res, next) => {
})
.put((req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /leader');
})
.delete((req, res, next) => {
})

leaderRouter.route('/:leaderId')
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next();
})
.get((req, res, next) => {
	// GET result for a specified leader
})
.post((req, res, next) => {
	// POST operation not supported on specified promo
	res.statusCode = 403;
	res.end(`POST operation not supported on /dishes/${req.params.dishId}`);r
})
.put((req, res, next) => {
	// UPDATE specified leader
})
.delete((req, res, next) => {
	// DELETE a specified leader
})

module.exports = leaderRouter;