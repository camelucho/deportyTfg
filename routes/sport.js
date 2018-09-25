'use strict'

var express = require('express');
var SportController = require('../controllers/sport');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/sports'});

api.get('/deporte/:id',md_auth.ensureAuth,SportController.getSport);
api.get('/deportes/:page?',md_auth.ensureAuth,SportController.getSports);
api.post('/deporte',[md_auth.ensureAuth,md_upload],SportController.saveSport);
api.get('/get-image-sport/:imageFile',SportController.getImageFile);
api.post('/upload-image-sport/:id',[md_auth.ensureAuth,md_upload],SportController.uploadImage);
api.put('/deporte/:id',md_auth.ensureAuth,SportController.updateSport);
api.get('/todos-deportes',md_auth.ensureAuth,SportController.getAllSports);
api.delete('/deporte/:id',md_auth.ensureAuth,SportController.deleteSport);

module.exports = api;