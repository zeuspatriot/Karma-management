'use strict';

var Rules = require('./rules.model');
var config = require('../../config/environment');

//create and assign rules
exports.createAndAssign = function (req, res){
	var rule = new Rules({
		user: req.body.id,
		content: [
			{
				msg: req.body.msg,
				points: req.body.points
			}
		]
	});
	rule.save();
};

//get rules for one Team
exports.getRulesByTeam = function (req, res){
	Rules.findOne({team: req.body.team}, function(err, rules){
		if(err) return err;
		if(!rules) return res.json('No rules found',400);
		if(rules){
			return res.json(rules);
		}
	})
};
//get rules for one User
exports.getRulesByUserId = function (req, res){
	Rules.findOne({user: req.body.id}, function(err, rules){
			if(err) return err;
			if(!rules) return res.json('No rules found',400);
			if(rules){
				res.json(rules);
			}
	})
};

//Add new rule by User id, or by "global"
exports.addRules = function (req, res){
	Rules.findOneAndUpdate({user: req.body.userId},{
		$push:
			{content:{
					msg: req.body.msg,
					points: req.body.points
				}
			}
		}, function(err, rules){
		if(err) return err;
		if(!rules) return res.json('No rules found',401);
		if(rules){
			res.json(rules);
		}
	})
};

//Delete rule msg
exports.deleteRule = function(req, res){
	Rules.findOne({'user':req.body.userId}, function(err, rule) {
		if(err) return res.send(500, err);
		if(rule){
			rule.content.forEach(function(elem, index){
				if(elem.msg === req.body.msg){
					rule.content.splice(index,1);
				}
			});
			rule.save();
		}
		return res.json(204);
	});
};