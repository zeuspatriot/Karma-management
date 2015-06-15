'use strict';

var Log = require('./log.model');
var config = require('../../config/environment');

exports.showCurrent = function(req, res){
	Log.findOne({user: req.body.id}, function(err, log){
		if(err) return res.json(err);
		if(!log) return res.json(401);
		if(log){
			return res.json(log);
		}
	})
};
