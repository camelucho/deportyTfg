'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

api.get('/probando-controlador',md_auth.ensureAuth,UserController.pruebas);
api.post('/register',UserController.saveUser);
api.post('/login',UserController.loginUser);
api.put('/update-user/:id',md_auth.ensureAuth,UserController.updateUser);
api.post('/update-image-user/:id',[md_auth.ensureAuth,md_upload],UserController.uploadImage);
api.post('/generar-token-telegram/:id',md_auth.ensureAuth,UserController.generarTokenTelegram);
api.post('/confirmar-token-telegram/:id',md_auth.ensureAuth,UserController.confirmarTokenTelegram);
api.get('/id-telegram-datos-usuario/:id',md_auth.ensureAuth,UserController.getIdAuthorized);
api.get('/get-image-user/:imageFile',UserController.getImageFile);

module.exports = api;