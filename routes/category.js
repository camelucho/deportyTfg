'use strict'

var express = require('express');
var CategoryController = require('../controllers/category');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/categoria',md_auth.ensureAuth,CategoryController.saveCategory);
api.get('/categoria/:id',md_auth.ensureAuth,CategoryController.getCategory);
api.get('/categorias/:sport',md_auth.ensureAuth,CategoryController.getCategorias);
api.put('/categoria/:id',md_auth.ensureAuth,CategoryController.updateCategory);
api.delete('/categoria/:id',md_auth.ensureAuth,CategoryController.deleteCategory);

module.exports = api;