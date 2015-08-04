'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var RulesSchema = new Schema({
	content:{type: Array, default: [
		{
			msg: String,
			points: Number,
			note: String
		}
	]},
	user: String
});

module.exports = mongoose.model('Rules', RulesSchema);