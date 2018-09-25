'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb+srv://camelucho:1234@eventosdeportivos-yl8bq.mongodb.net/eventos_deportivos',(err,res)=>{
	if(err){
		throw err;
	}else{
		console.log("La conexión a la base de datos está corriendo correctamente");

		app.listen(port,function(){
			console.log("Servidor del api rest de eventos deportivos en http://localhost:"+port);
		});
	}
});