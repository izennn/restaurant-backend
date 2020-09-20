const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

// route takes endpoint as parameter
promoRouter.route('/')
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next(); // will continue to look for functions that match '/dishes/ endpoint
})
.get((req, res, next) => {
	// now res is modified
	res.end('Will send all the promos to you!');
})
.post((req, res, next) => {
	// post requests carry some info in body
	res.end('Will add info to promo: ' + req.body.name
	+ " with details: " + req.body.description); // expect a "name" field in JSON 
})
.put((req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /promo');
})
.delete((req, res, next) => {
	// later we will restrict this dangerous operation to authorized users
	res.statusCode = 403;
	res.end('DELETE operation not supported on /promo');
})

promoRouter.route('/:promoId')
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next();
})
.get((req, res, next) => {
	res.end(`Getting details for promo ${req.params.promoId}`)
})
.post((req, res, next) => {
	res.end(`Updating promo ${req.params.promoId}\nWith name: ${req.body.name}, description: ${req.body.description}`)
})
.put((req, res, next) => {
	res.write(`Updating the promo ${req.params.promoId}\n`)
	res.end(`Will udpate the promo: ${req.body.name} with details: ${req.body.description}`)
})
.delete((req, res, next) => {
	res.statusCode = 403;
	res.end(`Deleting promo ${req.params.promoId}`);
})

module.exports = promoRouter;