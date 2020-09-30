const express = require('express');
const bodyParser = require('body-parser');

// cors
const cors = require('./cors');

// authenticate
const authenticate = require('../authenticate');

// mongoose  model
const Promos = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

// route takes endpoint as parameter
promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
	Promos.find({})
	.then((promos) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promos);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	// post requests carry some info in body
	Promos.create(req.body)
	.then((promo) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promo);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	// delete all promos
	Promos.remove({})
	.then((promos) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promos);
	}, (err) => next(err))
	.catch((err) => next(err));
})

promoRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	next();
})
.get(cors.cors, (req, res, next) => {
	const { params } = req;

	Promos.findById(params.promoId)
	.then((promo) => {
		res.json(promo)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'html/txt');
	res.end(`POST operation not supported on promotions/${req.params.promoId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	const { params, body } = req;

	// Model.findByIdAndUpdate(id, update, options, callback)
	Promos.findByIdAndUpdate(promoId, {
		$set: body
	}, { new: true})
	.then((promo) => {
		res.json(promo);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Promos.findByIdAndRemove(req.params.promoId)
	.then((promo) => {
		res.json(promo)
	}, (err) => next(err))
	.catch((err) => next(err));
})

module.exports = promoRouter;