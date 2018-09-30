'use strict'

var jwt = require('../services/jwt');
var User = require('../models/user');
var TelegramData = require('../models/telegramData');
var IdAuthorized = require('../models/idAuthorized');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var botTelegram = require('../controllers/botTelegram');
const minutosToken = 10;
const minutosAMilisegundos=60000;

function pruebas(req,res){
	res.status(200).send({
		message: 'Probando el una accion del controlador de usuarios del api rest con Node y Mongo'
	});
}

function saveUser(req,res){
    var user = new User();

    var params = req.body;
    user.name = params.name;
    user.email = params.email;
    user.role = 'ROLE_USER'
    user.image=null;

    if(params.password){
        //Encriptar contraseña
        bcrypt.hash(params.password,null,null,function(err,hash){
           user.password = hash; 
            if(user.name != null && user.email!=null){
                //guardar el usuario
                user.save((err,userStored)=>{
                    if(err){
                        res.status(500).send({message: 'Error al guardar el usuario'});
                    }else{
                        if(!userStored){
                            res.status(404).send({message: 'No se ha registrado el usuario'});
                        }else{
                            res.status(200).send({user: userStored});
                        }
                    }
                });
            }else{
                res.status(200).send({message: 'Rellena la todos los campos'});
            }
        });
    }else{
        res.status(500).send({message: 'Introduce la contraseña'});
    }

}

function loginUser(req,res){
	var params = req.body;

	var email = params.email;
	var password = params.password

	User.findOne({email: email.toLowerCase()},(err,user)=>{
		if(err){
			res.status(500).send({message:'Error en la petición'});
		}else{
			if(!user){
				res.status(404).send({message:'Usuario y/o contraseña incorrectos'});
			}else{
				//comprobar la contraseña
				bcrypt.compare(password,user.password, function(err,check){
					if(check){
						//Devolver datos del usuario logueado
						if(params.gethash){
							//devolver un token de jwt
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else{
							res.status(200).send({user});
						}
					}else{
						res.status(404).send({message:'El usuario no ha podido loguearse'});
					}
				});
			}
		}
	});
}

function updateUser(req,res){
	var userId=req.params.id;
	var update = req.body;

	if(userId!=req.user.sub){
		return res.status(500).send({message:'No tienes permisos para actualizar este usuario'});
	}

	User.findByIdAndUpdate(userId,update,(err,userUpdated)=>{
		if(err){
			res.status(500).send({message:'Error al actualizar el usuario'});
		}else{
			if(!userUpdated){
				res.status(404).send({message:'No se ha podido actualizar el usuario'});
			}else{
				res.status(200).send({user:userUpdated});
			}
		}
	});
}

function uploadImage(req,res){
	var userId = req.params.id;
	var file_name = 'No subido...'

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];

		var exp_split = file_name.split('\.');
		var file_ext = exp_split[1];
		
		if(file_ext=='png'||file_ext=='jpg'||file_ext=='gif'){

			User.findByIdAndUpdate(userId,{image:file_name},(err,userUpdated)=>{
				if(err){
					res.status(500).send({message:'Error al actualizar el usuario'});
				}else{
					if(!userUpdated){
						res.status(404).send({message:'No se ha podido actualizar el usuario'});
					}else{
						res.status(200).send({image:file_name, user:userUpdated});
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
	var path_file = './uploads/users/'+imageFile
	fs.exists(path_file,function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message:'No existe la imagen...'});
		}
	});
}

function generarTokenTelegram(req,res){
    var id = req.params.id;
    var update=req.body;
	var idTelegram=req.body.idTelegram;
	if(idTelegram){
		IdAuthorized.find({idTelegram:idTelegram},(err,idAuthorizedFind)=>{
			if(err){
				res.status(500).send({message:'Error en el servidor'});
			}else{
				if(!idAuthorizedFind[0]){
					res.status(404).send({message:'Error al crear el token porque el id no esta autorizado o es incorrecto'});
				}else{
					var telegramData= new TelegramData();
					telegramData.idTelegram=idTelegram;
					var tokenTelegram=botTelegram.generarTokenTelegram(idTelegram);
					telegramData.generationDate= new Date();
					telegramData.token=tokenTelegram;
					telegramData.user=id;
					telegramData.save((err,telegramDataUpdated)=>{
						if(err){
							res.status(500).send({message:'Error al crear el token porque el id no esta autorizado'});
						}else{
							if(!telegramDataUpdated){
								res.status(404).send({message:'No se ha podido crear el token'});
							}else{
								res.status(200).send({telegramData:telegramDataUpdated});
							}
						}
					});
				}
			}
		});
	}
}

function confirmarTokenTelegram(req,res){
	var userId = req.params.id;
	var token= req.body.token;
	
	var update = new Object();
	TelegramData.find({user:userId,token:token},(err,telegramDataFinded)=>{
		if(err){
			res.status(500).send({message:'Error en el servidor'});
		}else{
			if(!telegramDataFinded[0]){
				res.status(404).send({message:'Error al actualizar el token del usuario'});
			}else{
				var day = new Date();
				if(telegramDataFinded[0].generationDate.getTime()+minutosToken*minutosAMilisegundos> day.getTime()){
					IdAuthorized.findOneAndUpdate({idTelegram:telegramDataFinded[0].idTelegram},{$set: {user:userId}},(err,idAuthorizedUpdated)=>{
						if(err){
							res.status(500).send({message:'Error en el servidor, otro usuario ya tiene ese id. Para poder asignarselo a esta cuenta tienes que ir a telegram y poner el comando: /reiniciarId'});
						}else{
							if(!idAuthorizedUpdated){
								res.status(404).send({message:'Error al actualizar el token del usuario'});
							}else{
								User.updateMany({_id:userId},{$set: {role:'ROLE_LOCUTOR'}},(err,userUpdated)=>{
									if(err){
										res.status(404).send({message:'No se ha podido actualizar el rol'});
									}else{
										if(!userUpdated){
											res.status(404).send({message:'No se ha introducido el token correctamente'});
										}else{
											res.status(200).send({idAuthorizedUpdated:idAuthorizedUpdated});
										}
									}
								})
							}
						}
					})
				}else{
					res.status(404).send({message:'Token expirado'});
				}
			}
		}
	}).sort({generationDate:-1});
}

function getIdAuthorized(req,res){
	var userId = req.params.id;
	IdAuthorized.find({user:userId},(err,idAuthorizedFind)=>{
		
		if(err){
			res.status(500).send({message:'Error en el servidor'});
		}else{
			if(!idAuthorizedFind[0]){
				res.status(404).send({message:'Error al obtener la info del usuario del usuario'});
			}else{
				var day = new Date();
				res.status(200).send({idAuthorizedFind,idAuthorizedFind})
			}
		}
		
	})
}



module.exports = {
	confirmarTokenTelegram,
	generarTokenTelegram,
	getIdAuthorized,
    getImageFile,
    uploadImage,
    updateUser,
    loginUser,
    saveUser,
    pruebas
};