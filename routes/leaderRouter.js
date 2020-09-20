const express = require('express');
const bodyParser = require('body-parser');

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
	// now res is modified
	res.end('Will send all the leaders to you!');
})
.post((req, res, next) => {
	// post requests carry some info in body
	res.end('Will add info to leader: ' + req.body.name
	+ " with details: " + req.body.description); // expect a "name" field in JSON 
})
.put((req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /leader');
})
.delete((req, res, next) => {
	// later we will restrict this dangerous operation to authorized users
	res.statusCode = 403;
	res.end('DELETE operation not supported on /leader');
})

leaderRouter.route('/:leaderId')
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	next();
})
.get((req, res, next) => {
	res.end(`Getting details for leader ${req.params.leaderId}`)
})
.post((req, res, next) => {
	res.end(`Updating leader ${req.params.leaderId}\nWith name: ${req.body.name}, description: ${req.body.description}`)
})
.put((req, res, next) => {
	res.write(`Updating the leader ${req.params.leaderId}\n`)
	res.end(`Will udpate the leader: ${req.body.name} with details: ${req.body.description}`)
})
.delete((req, res, next) => {
	res.statusCode = 403;
	res.end(`Deleting leader ${req.params.leaderId}`);
})

module.exports = leaderRouter;