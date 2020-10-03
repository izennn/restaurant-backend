/*
 * Put all CORS realted methods here
 */

const express = require('express');
const cors = require('cors');
const app = express();

// all the origins the server is willing to accept
const whitelist = [
	'http://localhost:3000', 
	'http://localhost:3443',
	'http://Izens-MacBook-Pro:3001' // frontend yan build
]

let corsOptionsDelegate = (req, callback) => {
	let corsOptions;

	if (whitelist.indexOf(req.header('Origin') === -1)) {
		corsOptions = { origin: true }
	}
	else {
		corsOptions = { origin: false }
	}
	callback(null, corsOptions);
};

// reply access-control-allow-origin: *
exports.cors = cors();
// reply access-control-allow-origin: with options
exports.corsWithOptions = cors(corsOptionsDelegate);