'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var path = require('path');
//cargar rutas
var user_routes = require('./routes/user');
var sport_routes = require('./routes/sport');
var rule_routes = require('./routes/rule');
var category_routes = require('./routes/category');
var team_routes = require('./routes/team');
var game_routes = require('./routes/game');
var paricipation_routes = require('./routes/participation');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//configurar cabeceras http
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');

    next();
});

//rutas base
app.use('/',express.static('client',{redirect:false}));
app.use('/api',user_routes);
app.use('/api',sport_routes);
app.use('/api',rule_routes);
app.use('/api',category_routes);
app.use('/api',team_routes);
app.use('/api',game_routes);
app.use('/api',paricipation_routes);

app.get('*',function(req,res,next){
   res.sendFile(path.resolve('client/index.html')); 
});

module.exports = app;