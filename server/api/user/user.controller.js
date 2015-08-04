'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var Log = require('../log/log.model');
var Rules = require('../rules/rules.model');

var validationError = function(res, err) {
	return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
	User.find({}, '-salt -hashedPassword', function (err, users) {
		if(err) return res.send(500, err);
		res.json(200, users);
	});
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
	var newUser = new User(req.body);
	newUser.provider = 'local';
	newUser.role = 'user';
	newUser.save(function(err, user) {
		if (err) return validationError(res, err);
		var log = new Log({user: user._id});
		log.save();
		var rules = new Rules({user: user._id, content: []});
		rules.save();
		var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
		res.json({ token: token });
	});
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
	var userId = req.params.id;

	User.findById(userId, function (err, user) {
		if (err) return next(err);
		if (!user) return res.send(401);
		res.json(user);
	});
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
	User.findByIdAndRemove(req.params.id, function(err, user) {
		if(err) return res.send(500, err);
		return res.send(204);
	});
};

/**
* Update selected user
*/
exports.update = function(req, res){
	var userId = req.body.id;
	var updatedUser = req.body.update;

	User.findOneAndUpdate({_id:userId}, updatedUser, function(err, user){
		if(err) return err;
		if(!user) return res.json(401);
		if(user){
			return res.json(user);
		}
	});
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
	var userId = req.user._id;
	var oldPass = String(req.body.oldPassword);
	var newPass = String(req.body.newPassword);

	User.findById(userId, function (err, user) {
		if(user.authenticate(oldPass)) {
			user.password = newPass;
			user.save(function(err) {
				if (err) return validationError(res, err);
				res.send(200);
			});
		} else {
			res.send(403);
		}
	});
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
	var userId = req.user._id;
	User.findOne({
		_id: userId
	}, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
		if (err) return next(err);
		if (!user) return res.json(401);
		res.json(user);
	});
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
	res.redirect('/');
};

exports.changeUserKarma = function(req, res){
	User.findAndUpdateKarma({
		user:{
			_id: {$in: [].concat(req.body.id)}
		},
		log:{
			user: {$in: [].concat(req.body.id)}
		}
	},
	{
		pointsToIncrement: req.body.points,
		msg: req.body.msg,
		updatedBy: req.user.name,
		note: req.body.note
	},
	function(err, user){
			if(err) return res.json(err, 500);
			if(!user) return res.json(401);
			res.json(user);
	})
};

