'use strict'

var express = require('express');
var GameController = require('../controllers/game');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/partido',md_auth.ensureAuth,GameController.saveGame);
api.get('/partido/:id',md_auth.ensureAuth,GameController.getGame);
api.put('/partido/:id',md_auth.ensureAuth,GameController.updateGame);
api.delete('/partido/:id',md_auth.ensureAuth,GameController.deleteGame);
api.get('/partido-usuario/:id',md_auth.ensureAuth,GameController.getGamesByBroadcaster);
api.get('/partido-activo/:id',md_auth.ensureAuth,GameController.getActiveGameByBroadcaster);

module.exports = api;