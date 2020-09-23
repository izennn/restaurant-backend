const mongoose = require('mongoose');

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promoSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	label: {
		type: String,
		required: true
	},
	price: {
		type: Currency,
		required: true
	},
	description: {
		type: String,
		required: true
	}
}, {
	timestamp: true
})

const Promos = mongoose.model('Promotion', promoSchema);
module.exports = Promos;