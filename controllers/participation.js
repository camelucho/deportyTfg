'use strict'

var Participation = require('../models/participation');

function saveParticipation(req,res){
    var participation = new Participation();
    var params = req.body;
    participation.numberTeam = params.numberTeam;
    participation.team = params.team;
    participation.game = params.game;

    participation.save((err,participationSaved)=>{
        if(err){
            res.status(500).send({message: 'Error al apuntar al equipo'});
        }else{
            if(!participationSaved){
                res.status(404).send({message: 'El equipo no se ha podido apuntar'});	
            }else{
                res.status(200).send({participation:participationSaved});
            }
        }
    });
}

function deleteParticipation(req,res){
	var participationId = req.params.id;

	Participation.findByIdAndRemove(participationId,(err,participationRemoved)=>{
		if(err){
			res.status(500).send({message: 'Error al eliminar la participacion'});
		}else{
			if(!participationRemoved){
				res.status(404).send({message: 'No se ha borrado correctamente la participación'});	
			}else{
				res.status(200).send({participation:participationRemoved});
			}
		}
    });
}

function updateParticipation(req,res){
	var participacionId = req.params.id;
	var update = req.body;

	Participation.findByIdAndUpdate(participacionId,update,(err,participacionUpdated)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!participacionUpdated){
				res.status(404).send({message: 'No se ha actualizado correctamente la inscripcion'});	
			}else{
				res.status(200).send({participacion:participacionUpdated});
			}
		}
	});
}

function getParticipationsByGame(req,res){
    var idGame = req.params.id;
    var find =Participation.find({game:idGame}).sort('numberTeam');
    find.populate({path:'team'}).exec((err,participations)=>{
        if(err){
            res.status(500).send(err);
        }else{
            if(!participations){
                res.status(404).send({message: 'Error al obtener los participantes'});	
            }else{
                if(participations.length!=0){
                    res.status(200).send({participations:participations});
                }else{
                    res.status(404).send({message: 'No hay participantes para ese partido'});
                }
            }
        }
    });
}


module.exports = {
    getParticipationsByGame,
    updateParticipation,
    deleteParticipation,
    saveParticipation
};