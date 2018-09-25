'use strict'

var express = require('express');
var RuleController = require('../controllers/rule');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/regla',md_auth.ensureAuth,RuleController.saveRule);
api.get('/reglas/:sport',md_auth.ensureAuth,RuleController.getRules);
api.put('/regla/:id',md_auth.ensureAuth,RuleController.updateRule);
api.delete('/regla/:id',md_auth.ensureAuth,RuleController.deleteRule);

module.exports = api;