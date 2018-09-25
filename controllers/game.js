'use strict'

var Game = require('../models/game');
var View = require('../models/view');
var jwt = require('../services/jwt');



function saveGame(req,res){

    var token = req.headers.authorization;
    var user = jwt.parseJwt(token);
    var game = new Game();
    var params = req.body;
    game.result=params.result;
    game.dateStart= new Date(params.dateStart);
    game.dateEnd= new Date(params.dateEnd);
    game.status = params.status;
    game.broadcaster=user.sub;
    game.location= params.location;
    game.category=params.category;
    //tournament:{type:Schema.ObjectId,ref: 'Tournament'},
    var find =Game.find({broadcaster:game.broadcaster,status:{$not:{$in:['Terminado','Anulado']}}});
    find.exec((err,games)=>{
        if(err){
            res.status(500).send(err);
        }else{
            if(!games){
                res.status(404).send({message: 'Error en el servidor'});
            }else{
                if(games.length==0){
                    game.save((err,gameSaved)=>{
                        if(err){
                            res.status(500).send(err);
                        }else{
                            if(!gameSaved){
                                res.status(404).send({message: 'El partido ha sido guardado'});	
                            }else{
                                res.status(200).send({game:gameSaved});
                            }
                        }
                    });
                }else{
                    res.status(404).send({message: 'No se puede crear partido porque tienes un partido sin acabar'});
                }
            }
        }
    });
}

function getGame(req,res){
    var gameId= req.params.id
    Game.findById(gameId,(err,gameFinded)=>{
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
            if(!gameFinded){
                res.status(404).send({message:'El partido no existe'});
            }else{
                res.status(200).send({game:gameFinded});
            }
        }
    }).populate({path:'category',
    populate: {
        path:'sport',
        model:'Sport'
    }});
}

function updateGame(req,res){
	var gameId = req.params.id;
	var update = req.body;

	Game.findByIdAndUpdate(gameId,update,(err,gameUpdated)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!gameUpdated){
				res.status(404).send({message: 'No se ha actualizado correctamente el partido'});	
			}else{
				res.status(200).send({game:gameUpdated});
			}
		}
	});
}

function deleteGame(req,res){
	var gameId = req.params.id;

	Game.findByIdAndRemove(gameId,(err,gameRemoved)=>{
		if(err){
			res.status(500).send({message: 'Error al eliminar el partido'});
		}else{
			if(!gameRemoved){
				res.status(404).send({message: 'No se ha borrado correctamente el partido'});	
			}else{
                View.remove({game:gameRemoved._id},(err,viewsRemoved)=>{
                    if(err){
                        res.status(500).send({message: 'Error al eliminar el partido'});
                    }else{
                        if(!viewsRemoved){
                            res.status(404).send({message: 'No se han borrado los spectadores correctamente'});
                        }else{
                            res.status(200).send({game:gameRemoved});
                        }
                    }
                });
			}
		}
    });
}

function getGamesByBroadcaster(req,res){
    var broadcasterId= req.params.id
    
    var find =Game.find({broadcaster:broadcasterId,status:{$in:['Terminado','Anulado']}});

    find.exec((err,games)=>{
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
            if(!games||games.length==0){
                res.status(404).send({message:'No tienes partidos creados'});
            }else{
                res.status(200).send({games});
            }
        }
    });
}

function getActiveGameByBroadcaster(req,res){
    var broadcasterId= req.params.id
    
    var find =Game.find({broadcaster:broadcasterId,status:{ $not: { $in:['Terminado','Anulado'] } }});

    find.exec((err,game)=>{
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
            if(!game||game.length==0){
                res.status(404).send({message:'No tienes partidos activos'});
            }else{
                res.status(200).send({game});
            }
        }
    });
}

module.exports = {
    getGamesByBroadcaster,
    getActiveGameByBroadcaster,
    deleteGame,
    updateGame,
    getGame,
    saveGame
};