'use strict'

var express = require('express');
var TeamController = require('../controllers/team');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/teams'});

api.post('/equipo',md_auth.ensureAuth,TeamController.saveTeam);
api.put('/equipo/:id',md_auth.ensureAuth,TeamController.updateTeam);
api.get('/equipos/:page&:sport?',md_auth.ensureAuth,TeamController.getTeams);
api.get('/equipos-deporte/:sport',md_auth.ensureAuth,TeamController.getTeamsBySport);
api.get('/equipo/:id',md_auth.ensureAuth,TeamController.getTeam);
api.delete('/equipo/:id',md_auth.ensureAuth,TeamController.deleteTeam);
api.post('/update-image-team/:id',[md_auth.ensureAuth,md_upload],TeamController.uploadImage);
api.get('/get-image-team/:imageFile',TeamController.getImageFile);

module.exports = api;