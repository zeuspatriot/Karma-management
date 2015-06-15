'use strict';

var express = require('express');
var controller = require('./rules.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.post('/team', controller.getRulesByTeam);
router.post('/user', controller.getRulesByUserId);
router.put('/add', auth.isAuthenticated(), controller.addRules);
router.put('/assign', controller.createAndAssign);
router.put('/delete', auth.hasRole('admin'), controller.deleteRule);

module.exports = router;