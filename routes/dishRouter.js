const express = require('express');
const bodyParser = require('body-parser');

// API restpoint handling for /dishes
const dishRouter = express.Router();

dishRouter.use(bodyParser.json())

// route takes endpoint as parameter
dishRouter.route('/')
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next(); // will continue to look for functions that match '/dishes/ endpoint
})
.get((req, res, next) => {
	// now res is modified
	res.end('Will send all the dishes to you!');
})
.post((req, res, next) => {
	// post requests carry some info in body
	res.end('Will add info to dish: ' + req.body.name
	+ " with details: " + req.body.description); // expect a "name" field in JSON 
})
.put((req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
	// later we will restrict this dangerous operation to authorized users
	res.statusCode = 403;
	res.end('DELETE operation not supported on /dishes');
})

dishRouter.route('/:dishId')
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next();
})
.get((req, res, next) => {
	res.end(`Getting details for dish ${req.params.dishId}`)
})
.post((req, res, next) => {
	res.end(`Updating dish ${req.params.dishId}\nWith name: ${req.body.name}, description: ${req.body.description}`)
})
.put((req, res, next) => {
	res.write(`Updating the dish ${req.params.dishId}\n`)
	res.end(`Will udpate the dish: ${req.body.name} with details: ${req.body.description}`)
})
.delete((req, res, next) => {
	res.statusCode = 403;
	res.end(`Deleting dish ${req.params.dishId}`);
})

module.exports = dishRouter;
