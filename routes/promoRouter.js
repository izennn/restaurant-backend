const express = require('express');
const bodyParser = require('body-parser');

// mongoose & mongo models
const mongoose = require('mongoose');
const Promos = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

// route takes endpoint as parameter
promoRouter.route('/')
.get((req, res, next) => {
	Promos.find({})
	.then((promos) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promos);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post((req, res, next) => {
	// post requests carry some info in body
	Promos.create(req.body)
	.then((promo) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promo);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put((req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
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
.all((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	next();
})
.get((req, res, next) => {
	const { params } = req;

	Promos.findById(params.promoId)
	.then((promo) => {
		res.json(promo)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post((req, res, next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'html/txt');
	res.end(`POST operation not supported on promotions/${req.params.promoId}`);
})
.put((req, res, next) => {
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
.delete((req, res, next) => {
	Promos.findByIdAndRemove(req.params.promoId)
	.then((promo) => {
		res.json(promo)
	}, (err) => next(err))
	.catch((err) => next(err));
})

module.exports = promoRouter;