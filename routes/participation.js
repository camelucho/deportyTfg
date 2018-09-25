'use strict'

var express = require('express');
var ParticipationController = require('../controllers/participation');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/participa',md_auth.ensureAuth,ParticipationController.saveParticipation);
api.delete('/participa/:id',md_auth.ensureAuth,ParticipationController.deleteParticipation);
api.put('/participa/:id',md_auth.ensureAuth,ParticipationController.updateParticipation);
api.get('/participantes-partido/:id',md_auth.ensureAuth,ParticipationController.getParticipationsByGame);


module.exports = api;