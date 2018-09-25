'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');
var Team = require('../models/team');
var itemsPerPage=8;

function saveTeam(req,res){
    var team = new Team();
    var params = req.body;
    team.name=params.name;
    team.tag=params.tag;
    team.description=params.description;
    team.image=null;
    team.sport=params.sport;

    team.save((err,teamSaved)=>{
        if(err){
            res.status(500).send({message: 'Error al guardar el equipo'});
        }else{
            if(!teamSaved){
                res.status(404).send({message: 'El equipo no ha sido guardado'});	
            }else{
                res.status(200).send({team:teamSaved});
            }
        }
    });
}

function updateTeam(req,res){
	var teamId = req.params.id;
	var update = req.body;

	Team.findByIdAndUpdate(teamId,update,(err,teamUpdated)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!teamUpdated){
				res.status(404).send({message: 'No se ha actualizado correctamente el equipo'});	
			}else{
				res.status(200).send({team:teamUpdated});
			}
		}
	});
}


function getTeams(req,res){
    var sportId = req.params.sport;
	
	if(req.params.page){
		var page = req.params.page;
	}else{
		var page =1;
	}

	if(sportId){
		var find = Team.find({sport:sportId});
	}else{
		var find = Team.find(); 
	}
	find.populate({path:'sport'}).sort('name').paginate(page,itemsPerPage,function(err,teams,total){
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!teams){
				res.status(404).send({message: 'No hay equipos'});
			}else{
				res.status(200).send({
					totalItems:total,
					teams:teams
				});
			}	
		}
	});
}

function getTeamsBySport(req,res){
	var sportId = req.params.sport;
	Team.find({sport:sportId}).populate({path:'sport'}).sort('name').exec((err,teams)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!teams){
				res.status(404).send({message: 'No hay equipos'});
			}else{
				res.status(200).send({
					teams:teams
				});
			}	
		}
	});
}


function getTeam(req,res){
	var teamId= req.params.id
    Team.findById(teamId,(err,teamFinded)=>{
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
            if(!teamFinded){
                res.status(404).send({message:'El equipo no existe'});
            }else{
                res.status(200).send({team:teamFinded});
            }
        }
    }).populate({path:'sport'});
}

function deleteTeam(req,res){
	var teamId = req.params.id;

	Team.findByIdAndRemove(teamId,(err,teamRemoved)=>{
		if(err){
			res.status(500).send({message: 'Error al eliminar el equipo'});
		}else{
			if(!teamRemoved){
				res.status(404).send({message: 'No se ha borrado correctamente el equipo'});	
			}else{
				res.status(200).send({team:teamRemoved});
			}
		}
    });
}

function uploadImage(req,res){
	var teamId = req.params.id;
	var file_name = 'No subido...'

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];

		var exp_split = file_name.split('\.');
		var file_ext = exp_split[1];
		
		if(file_ext=='png'||file_ext=='jpg'||file_ext=='gif'){

			Team.findByIdAndUpdate(teamId,{image:file_name},(err,teamUpdated)=>{
				if(err){
					res.status(500).send({message:'Error al actualizar el equipo'});
				}else{
					if(!teamUpdated){
						res.status(404).send({message:'No se ha podido actualizar el equipo'});
					}else{
						res.status(200).send({image:file_name, user:teamUpdated});
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

function getImageFile(req,res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/teams/'+imageFile
	fs.exists(path_file,function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message:'No existe la imagen...'});
		}
	});
}

module.exports = {
    uploadImage,
    getImageFile,
    deleteTeam,
    getTeam,
	getTeams,
	getTeamsBySport,
    updateTeam,
    saveTeam
};