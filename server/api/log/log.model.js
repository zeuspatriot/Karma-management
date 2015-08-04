'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: "User"},
	log:{type: Array, default:[
			{
				points: 0,
				date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
				msg: "User created",
				updatedBy: "System",
				note: ""
			}]
	}
});

module.exports = mongoose.model('Log', LogSchema);