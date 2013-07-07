var mongoose = require('mongoose')
	, Account = require('./account');

var sequenceSchema = new mongoose.Schema({
	moment: { type: mongoose.Schema.Types.ObjectId, ref: 'Moment' },

	steps: [{
		text: String
	}],

	date: { type: Date, default: Date.now },
	hidden: Boolean,
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
});

module.exports = mongoose.model('Sequence', sequenceSchema); // Compile schema to a model