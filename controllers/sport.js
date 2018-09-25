'use strict'

var mongoosePaginate = require('mongoose-pagination');
var Sport = require('../models/sport');
var Rule = require('../models/rule');
var Category = require('../models/category');
var fs = require('fs');
var path = require('path');

function getSport(req,res){
    var sportId= req.params.id
    Sport.findById(sportId,(err,sportFinded)=>{
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
            if(!sportFinded){
                res.status(404).send({message:'El deporte no existe'});
            }else{
                res.status(200).send({sport:sportFinded});
            }
        }
    });
}

function getAllSports(req,res){
	Sport.find().sort('name').exec((err,sports)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!sports){
				res.status(404).send({message: 'No hay deportes'});
			}else{
				res.status(200).send({sports});
			}	
		}
	});
}

function getSports(req,res){
	if(req.params.page){
		var page = req.params.page;
	}else{
		var page =1;
	}
	
	var itemsPerPage = 8;

	Sport.find().sort('name').paginate(page,itemsPerPage,function(err,sports,total){
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!sports){
				res.status(404).send({message: 'No hay deportes'});	
			}else{
				return res.status(200).send({
					totalItems:total,
					sports:sports
				});
			}
		}
	});
}

function saveSport(req,res){
    var sport = new Sport();
	var params = req.body;
	sport.name=params.name;
	sport.description = params.description;
	sport.maxTeams = params.maxTeams;
	sport.image = null;

	sport.save((err,sportSaved)=>{
		if(err){
			console.log(err);
			res.status(500).send({message: 'Error al guardar el deporte'});
		}else{
			if(!sportSaved){
				res.status(404).send({message: 'El deporte no ha sido guardado'});	
			}else{
				res.status(200).send({sport:sportSaved});
			}
		}
	});
}

function updateSport(req,res){
	var sportId = req.params.id;
	var update = req.body;

	Sport.findByIdAndUpdate(sportId,update,(err,sportUpdated)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!sportUpdated){
				res.status(404).send({message: 'No se ha actualizado correctamente el deporte'});	
			}else{
				res.status(200).send({sport:sportUpdated});
			}
		}
	});
}

function deleteSport(req,res){
	var sportId = req.params.id;

	Sport.findByIdAndRemove(sportId,(err,sportRemoved)=>{
		if(err){
			res.status(500).send({message: 'Error al eliminar el deporte'});
		}else{
			if(!sportRemoved){
				res.status(404).send({message: 'No se ha borrado correctamente el deporte'});	
			}else{
				Rule.find({sport:sportRemoved._id}).remove((err,ruleRemoved)=>{
					if(err){
						res.status(500).send({message: 'Error al eliminar la regla'});
					}else{
						if(!ruleRemoved){
							res.status(404).send({message: 'No se ha borrado correctamente la regla'});	
						}else{

						}
					}
                });
                Category.find({sport:sportRemoved._id}).remove((err,categoryRemoved)=>{
					if(err){
						res.status(500).send({message: 'Error al eliminar la categoria'});
					}else{
						if(!categoryRemoved){
							res.status(404).send({message: 'No se ha borrado correctamente la categoria'});	
						}else{
                            res.status(200).send({sport:sportRemoved});
						}
					}
				});
			}
		}
	});
}

function getImageFile(req,res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/sports/'+imageFile
	fs.exists(path_file,function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message:'No existe la imagen...'});
		}
	});
}


function uploadImage(req,res){
	var sportId = req.params.id;
	var file_name = 'No subido...'

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];

		var exp_split = file_name.split('\.');
		var file_ext = exp_split[1];
		
		if(file_ext=='png'||file_ext=='jpg'||file_ext=='gif'){

			Sport.findByIdAndUpdate(sportId,{image:file_name},(err,sportUpdated)=>{
				if(err){
					res.status(500).send({message:'Error al actualizar el usuario'});
				}else{
					if(!sportUpdated){
						res.status(404).send({message:'No se ha podido actualizar el usuario'});
					}else{
						res.status(200).send({sport:sportUpdated});
					}
				}
			});

		}else{
			res.status(200).send({message:'Extensión del archivo no válida'});
		}

	}else{
		res.status(200).send({message:'No has subido ninguna imagen'});
	}
}

module.exports = {
    deleteSport,
    uploadImage,
    updateSport,
    getSports,
    getImageFile,
	saveSport,
	getAllSports,
	getSport
};
