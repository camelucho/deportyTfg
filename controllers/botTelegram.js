'use strict'

const TelegramBot = require('node-telegram-bot-api');
// API Token Telegram
const token = '515206440:AAG_W4wbgsd1lbYcZvWYt7LCGvTa7sL-nwA';

const bot = new TelegramBot(token, {polling: true});
const request = require('request');
var TelegramData = require('../models/telegramData');
var IdAuthorized = require('../models/idAuthorized');
var User = require('../models/user');
var Game = require('../models/game');
var Rule =require('../models/rule');
var Participation = require('../models/participation');
var Category = require('../models/category');
var View = require('../models/view');

var sesion = [];

 //VAlidar numeros
 function esNumero(numero){
    if (/^([0-9])*$/.test(numero))
     return true;
 }

exports.generarTokenTelegram = function(id){
    var token=cadenaAleatoria(6,"");
    bot.sendMessage(id, "Tu token es: "+ token);
    return token;
};

function cadenaAleatoria(longitud, caracteres) {     
    longitud = longitud || 16;     
    caracteres = caracteres || "0123456789abcdefghijklmnopqrstuvwxyz";     
    var cadena = "";     var max = caracteres.length-1;     
    for (var i = 0; i<longitud; i++) {         
        cadena += caracteres[ Math.floor(Math.random() * (max+1)) ];     
    }  
    
    return cadena; 
};


bot.onText(/^\/id$/,(msg)=>{
	bot.sendMessage(msg.chat.id, msg.chat.id);
 });


bot.onText(/^\/autorizaToken$/, (msg) => {
    var idAuthorized = new IdAuthorized();
    idAuthorized.idTelegram=msg.chat.id;
    idAuthorized.authorized = true;
    idAuthorized.user=null;
    idAuthorized.save((err,idAuthorized)=>{
        if(err){
            bot.sendMessage(msg.chat.id, "No se ha podido autorizar el token, puede que ya esté autorizado");
        }else{
            if(!idAuthorized){
                bot.sendMessage(msg.chat.id, "No se ha podido autorizar el token, puede que ya esté autorizado");
            }else{
                bot.sendMessage(msg.chat.id, "Se ha autorizado el token");
            }
        }
    });
});

bot.onText(/^\/desautorizaToken$/, (msg) => {
    IdAuthorized.deleteOne({idTelegram:msg.chat.id},(err,idAuthorized)=>{
        if(err){
            bot.sendMessage(msg.chat.id, "No se ha podido autorizar el token, puede que ya esté autorizado");
        }else{
            if(!idAuthorized){
                bot.sendMessage(msg.chat.id, "No se ha podido autorizar el token, puede que ya esté autorizado");
            }else{
                bot.sendMessage(msg.chat.id, "Se ha desautorizado el token");
            }
        }
    });
});

bot.onText(/^\/reiniciarId$/, (msg) => {
    var user = new User();
    user.idTelegram = null;
    IdAuthorized.updateMany({idTelegram:msg.chat.id},{$set: {user:null}},(err,idTelegram)=>{
        if(err){
            bot.sendMessage(msg.chat.id, "No se ha podido borrar ningun id");
        }else{
            if(!idTelegram){
                bot.sendMessage(msg.chat.id, "No hay ningun usuario con ese id de telegram");
            }else{
                User.updateMany({_id:idTelegram.user},{$set: {idTelegram:user.idTelegram,role:'ROLE_USER'}},(err,userUpdated)=>{
                    if(err){
                        bot.sendMessage(msg.chat.id, "No se ha podido borrar ningun id");
                    }else{
                        if(!userUpdated){
                            bot.sendMessage(msg.chat.id, "No hay ningun usuario con ese id de telegram");
                        }else{
                            bot.sendMessage(msg.chat.id, "Se han eliminado los ids de telegram con tu id");
                        }
                    }
                })
            }
        }
    })
   
});

//Espectadores

bot.onText(/^\/partidosCercanos$/, (msg) => {
   
        const opts = {
          reply_markup: JSON.stringify({
            keyboard: [
              [{text: 'Enviar Localización', request_location: true}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          }),
        };
        bot.sendMessage(msg.chat.id, '¿Quieres enviar tu localización?', opts);
});

  bot.on('location', (msg) => {
    var sesionUsuario
    for(var x = 0;x<sesion.length;x++){
        if(sesion[x].idTelegram==msg.chat.id){
            sesionUsuario =sesion[x];
            sesionUsuario.games=[];
            sesion.splice(x);
        }
    }
    var day = new Date();
    day.setDate(day.getDate()-1);
    day.setHours(0);
    day.setMinutes(0);
    day.setSeconds(0);
    Game.find({location:
        { $nearSphere:
           {
             $geometry: { type: "Point",  coordinates: [ msg.location.latitude, msg.location.longitude ] },
             $minDistance: 0,
             $maxDistance: 1000
           }
        },status:{$not:{$in:['Terminado','Anulado']}},dateStart:{$gt:day}},(err,res)=>{
        if(err){
            bot.sendMessage(msg.chat.id, "Error en el servidor");
        }else{
            if(!res||res.length==0){
                bot.sendMessage(msg.chat.id, "No hay partidos por la zona");
            }else{
                var participationIndex=0;
                var sesionUsuario2 = sesionUsuario
                if(sesionUsuario2==null){
                    var sesionUsuario2 = new Object;
                }
                
                if(sesionUsuario2.games==null){
                    sesionUsuario2.games=[];
                }
                sesionUsuario2.idTelegram=msg.chat.id
                for(var i =0;i<res.length;i++){
                    Participation.find({game:res[i]._id},(err,res2)=>{
                        if(err){

                        }else{
                            if(res2&&res2!=null&&res2.length>1){
                                sesionUsuario2.games.push(res[participationIndex]);
                                var respuesta= participationIndex+1+". ";
                                for(var j =0;j<res2.length;j++){
                                    respuesta += res2[j].team.name;
                                    if(j+1!=res2.length){
                                        respuesta += "-"
                                    }else{
                                        respuesta += " Deporte: "+res[participationIndex].category.sport.name +" Resultado: "+res[participationIndex].result+ " Fecha de inicio: "+res[participationIndex].dateStart+ " Estado: "+ res[participationIndex].status;
                                    }
                                }
                            }
                            if(participationIndex+1==res.length){
                                sesion.push(sesionUsuario2);
                            }
                        }
                        bot.sendMessage(msg.chat.id,respuesta);
                        participationIndex++;
                    }).populate({path:'team'});
                }
            }
        }
    }).populate({
		path: 'category',
		populate: {
			path:'sport',
			model:'Sport'
		}
    });
  });

  bot.onText(/^\/presenciarPartido /, (msg) => {
    var numero = msg.text.replace(/\/presenciarPartido /, "").trim();
    if(numero!==null&&esNumero(numero)){
        numero--;
        var tieneSession = false;
        var index=0;
        for(var i=0; i<sesion.length;i++){
            if(sesion[i].idTelegram==msg.chat.id){
                index=i;
                tieneSession=true;
                if(numero<sesion[i].games.length){
                    IdAuthorized.find({idTelegram:msg.chat.id},(err,res)=>{
                        if(err){

                        }else{
                            if(res && res.length!=0){
                                
                                var view= new View();
                                view.idEspectador=res[0]._id;
                                view.game=sesion[index].games[numero]._id;
                                view.save((err,response)=>{
                                    if(err){
                                        bot.sendMessage(msg.chat.id,"No se ha podido presenciar partido, es posible que ya lo estes espectando");
                                    }else{
                                        if(!response){
                                            bot.sendMessage(msg.chat.id,"No se ha podido presenciar partido");
                                        }else{
                                            bot.sendMessage(msg.chat.id,"Se ha presenciado el partido");
                                        }
                                    }
                                });
                            }else{
                                var idAuthorized = new IdAuthorized();
                                idAuthorized.idTelegram=msg.chat.id;
                                idAuthorized.authorized=false;
                                idAuthorized.user=null;
                                idAuthorized.save((err,response)=>{
                                    if(err){
                                        bot.sendMessage(msg.chat.id,"No se ha podido presenciar el partido, es posible que ya lo estes espectando");
                                    }else{
                                        if(!response){
                                            bot.sendMessage(msg.chat.id,"No se ha podido presenciar partido");
                                        }else{
                                            var view= new View();
                                            view.idEspectador=response._id;
                                            view.game=sesion[index].games[numero]._id;
                                            view.save((err,response2)=>{
                                                if(err){
                                                    bot.sendMessage(msg.chat.id,"No se ha podido presenciar partido");
                                                }else{
                                                    if(!response2){
                                                        bot.sendMessage(msg.chat.id,"No se ha podido presenciar partido");
                                                    }else{
                                                        bot.sendMessage(msg.chat.id,"Se ha presenciado al partido");
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }else{
                    bot.sendMessage(msg.chat.id,"No puedes poner números mas grande que los partidos que has encontrado");
                }
            }
        }
        if(!tieneSession){
            bot.sendMessage(msg.chat.id,"Tienes que buscar partidos primero con el comando: /partidosCercanos");
        }
    }else{
        bot.sendMessage(msg.chat.id,"Tienes que introducir un número");
    }
  });

  bot.onText(/^\/partidosQueSigo$/, (msg) => {
    var sesionUsuario;
    for(var x = 0;x<sesion.length;x++){
        if(sesion[x].idTelegram==msg.chat.id){
            sesionUsuario =sesion[x];
            sesionUsuario.gamesEspecto=[];
            sesion.splice(x);
        }
    }
    IdAuthorized.find({idTelegram:msg.chat.id},(err,respTelegram)=>{
        if(err){
            bot.sendMessage(msg.chat.id,"Error en el servidor");
        }else{
            if(!respTelegram){
                bot.sendMessage(msg.chat.id,"No estas presenciando ningun partido actualmente");
            }else{
                var sesionUsuario2 = sesionUsuario;
                View.find({idEspectador:respTelegram[0]._id},(err,res1)=>{
                    if(err){
                        bot.sendMessage(msg.chat.id,"Error en el servidor");
                    }else{
                        if(!res1||res1.length==0){
                            bot.sendMessage(msg.chat.id,"No estas presenciando ningun partido actualmente");
                        }else{
                            for(var i = 0;i<res1.length;i++){
                                var game=res1[i].game._id;
                                var sesionUsuario3 = sesionUsuario2;
                                if(sesionUsuario3==null){
                                    var sesionUsuario3 = new Object;
                                }
                                if(sesionUsuario3.gamesEspecto==null){
                                    sesionUsuario3.gamesEspecto=[];
                                }
                                var viewer = 0;
                                Game.find({_id:game._id},(err,res)=>{
                                    if(err){
                                        bot.sendMessage(msg.chat.id, "Error en el servidor");
                                    }else{
                                        
                                        if(!res||res.length==0){
                                            bot.sendMessage(msg.chat.id, "No estas presenciando ningun partido actualmente");
                                        }else{
                                            var participationIndex=0;
                                            
                                            sesionUsuario3.idTelegram=msg.chat.id
                                            
                                            for(var x =0;x<res.length;x++){
                                                Participation.find({game:res[x]._id},(err,res2)=>{
                                                    var partido=participationIndex;
                                                    participationIndex++;
                                                    if(err){
                            
                                                    }else{
                                                        if(res2&&res2!=null&&res2.length>1){
                                                            var participacion = sesionUsuario3.gamesEspecto.push(res[partido]);
                                                            var respuesta= sesionUsuario3.gamesEspecto.indexOf(res[partido])+1+". ";
                                                            for(var j =0;j<res2.length;j++){
                                                                respuesta += res2[j].team.name;
                                                                if(j+1!=res2.length){
                                                                    respuesta += "-"
                                                                }else{
                                                                    respuesta += " Deporte: "+res[partido].category.sport.name +" Resultado: "+res[partido].result+ " Fecha de inicio: "+res[partido].dateStart+ " Estado: "+ res[partido].status;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    bot.sendMessage(msg.chat.id,respuesta);
                                                }).populate({path:'team'});
                                            }
                                            
                                        }
                                        
                                        viewer++;
                                        if(viewer==res1.length){
                                            sesion.push(sesionUsuario3);
                                        }
                                    }
                                }).populate({
                                    path: 'category',
                                    populate: {
                                        path:'sport',
                                        model:'Sport'
                                    }
                                });
                                
                            }
                        }
                            
                    }
                }).populate({path:'game'});
            }
        }
    });
  });

  bot.onText(/^\/dejarDeSeguirPartido /, (msg) => {
    var numero = msg.text.replace(/\/dejarDeSeguirPartido /, "").trim();
    if(numero!==null&&esNumero(numero)){
        numero--;
        var tieneSession = false;
        var index=0;
        for(var i=0; i<sesion.length;i++){
            if(sesion[i].idTelegram==msg.chat.id){
                index=i;
                tieneSession=true;
                if(numero<sesion[i].gamesEspecto.length){
                    IdAuthorized.find({idTelegram:msg.chat.id},(err,res)=>{
                        if(err){

                        }else{
                            if(res && res.length!=0){
                                View.deleteOne({idEspectador:res[0]._id,game:sesion[index].gamesEspecto[numero]._id},(err,response)=>{
                                    if(err){
                                        bot.sendMessage(msg.chat.id,"No se ha podido dejar de seguir el partido");
                                    }else{
                                        if(!response){
                                            bot.sendMessage(msg.chat.id,"No se ha podido dejar de seguir el partido");
                                        }else{
                                            bot.sendMessage(msg.chat.id,"Se ha dejado de seguir el partido");
                                        }
                                    }
                                });
                            }else{
                                bot.sendMessage(msg.chat.id,"No estas presenciando ningún partido, para hacerlo utiliza el comando /espectarPartido con un número despues de un espacio en blanco");
                            }
                        }
                    });
                }else{
                    bot.sendMessage(msg.chat.id,"No puedes poner números mas grande que los partidos que has encontrado");
                }
            }
        }
        if(!tieneSession){
            bot.sendMessage(msg.chat.id,"Tienes que buscar los partidos que estas presenciado primero con el comando: /partidosQueEspecto");
        }
    }else{
        bot.sendMessage(msg.chat.id,"Tienes que introducir un número");
    }
  });

  bot.onText(/^\/ubicacionPartido /, (msg) => {
    var numero = msg.text.replace(/\/ubicacionPartido /, "").trim();
    if(numero!==null&&esNumero(numero)){
        numero--;
        var tieneSession = false;
        var index=0;
        for(var i=0; i<sesion.length;i++){
            if(sesion[i].idTelegram==msg.chat.id){
                index=i;
                tieneSession=true;
                if(numero<sesion[i].games.length){
                    var game = sesion[i].games[numero];
                    sendLocationGame(msg,game);
                }else{
                    bot.sendMessage(msg.chat.id,"No puedes poner números mas grande que los partidos que has encontrado");
                }
            }
        }
        if(!tieneSession){
            bot.sendMessage(msg.chat.id,"Tienes que buscar partidos primero con el comando: /partidosCercanos");
        }
    }else{
        bot.sendMessage(msg.chat.id,"Tienes que introducir un número");
    }
  });

  

  bot.onText(/^\/ubicacionPartidoQueSigo /, (msg) => {
    var numero = msg.text.replace(/\/ubicacionPartidoQueSigo /, "").trim();
    if(numero!==null&&esNumero(numero)){
        numero--;
        var tieneSession = false;
        var index=0;
        for(var i=0; i<sesion.length;i++){
            if(sesion[i].idTelegram==msg.chat.id){
                index=i;
                tieneSession=true;
                if(numero<sesion[i].gamesEspecto.length){
                    var game = sesion[i].gamesEspecto[numero];
                    sendLocationGame(msg,game);
                }else{
                    bot.sendMessage(msg.chat.id,"No puedes poner números mas grande que los partidos que has encontrado");
                }
            }
        }
        if(!tieneSession){
            bot.sendMessage(msg.chat.id,"Tienes que buscar los partidos que espectas primero con el comando: /partidosQueEspecto");
        }
    }else{
        bot.sendMessage(msg.chat.id,"Tienes que introducir un número");
    }
  });

  bot.onText(/^\/reglasPartido /, (msg) => {
    var numero = msg.text.replace(/\/reglasPartido /, "").trim();
    if(numero!==null&&esNumero(numero)){
        numero--;
        var tieneSession = false;
        var index=0;
        for(var i=0; i<sesion.length;i++){
            if(sesion[i].idTelegram==msg.chat.id){
                index=i;
                tieneSession=true;
                if(numero<sesion[i].games.length){
                    var game = sesion[i].games[numero];
                    Category.findById(game.category,(err,categoryFinded)=>{
                        if(err){
                            bot.sendMessage(msg.chat.id,"Error al buscar la categoría del deporte");
                        }else{
                            if(!categoryFinded){
                                bot.sendMessage(msg.chat.id,"Error al buscar la categoría del deporte");
                            }else{
                                Rule.find({sport:categoryFinded.sport},(err,rules)=>{
                                    var respuesta = "Reglas del partido: \n"
                                    for(var i=0;i<rules.length;i++){
                                        respuesta+= (i+1)+". "+rules[i].description+"\n";
                                    }
                                    bot.sendMessage(msg.chat.id,respuesta);
                                });
                            }
                        }
                    });
                   
                }else{
                    bot.sendMessage(msg.chat.id,"No puedes poner números mas grande que los partidos que has encontrado");
                }
            }
        }
        if(!tieneSession){
            bot.sendMessage(msg.chat.id,"Tienes que buscar partidos primero con el comando: /partidosCercanos");
        }
    }else{
        bot.sendMessage(msg.chat.id,"Tienes que introducir un número");
    }
  });

  bot.onText(/^\/reglasPartidoQueSigo /, (msg) => {
    var numero = msg.text.replace(/\/reglasPartidoQueSigo /, "").trim();
    if(numero!==null&&esNumero(numero)){
        numero--;
        var tieneSession = false;
        var index=0;
        for(var i=0; i<sesion.length;i++){
            if(sesion[i].idTelegram==msg.chat.id){
                index=i;
                tieneSession=true;
                if(numero<sesion[i].gamesEspecto.length){
                    var game = sesion[i].gamesEspecto[numero];
                    Category.findById(game.category,(err,categoryFinded)=>{
                        if(err){
                            bot.sendMessage(msg.chat.id,"Error al buscar la categoría del deporte");
                        }else{
                            if(!categoryFinded){
                                bot.sendMessage(msg.chat.id,"Error al buscar la categoría del deporte");
                            }else{
                                Rule.find({sport:categoryFinded.sport},(err,rules)=>{
                                    var respuesta = "Reglas del partido: \n"
                                    for(var i=0;i<rules.length;i++){
                                        respuesta+= (i+1)+". "+rules[i].description+"\n";
                                    }
                                    bot.sendMessage(msg.chat.id,respuesta);
                                });
                            }
                        }
                    });
                   
                }else{
                    bot.sendMessage(msg.chat.id,"No puedes poner números mas grande que los partidos que has encontrado");
                }
            }
        }
        if(!tieneSession){
            bot.sendMessage(msg.chat.id,"Tienes que buscar partidos primero con el comando: /partidosCercanos");
        }
    }else{
        bot.sendMessage(msg.chat.id,"Tienes que introducir un número");
    }
  });

  //Locutores
  bot.onText(/^\/empezarPartido$/, (msg) => {
      IdAuthorized.find({idTelegram:msg.chat.id},(err,resIdAuthorized)=>{
        if(err){

        }else{
            if(resIdAuthorized && resIdAuthorized.length!=0){
                Game.findOneAndUpdate({broadcaster:resIdAuthorized[0].user,status:{ $eq: 'Sin empezar' }},{status:'En curso'},(err,respGame)=>{
                    if(err){
                        bot.sendMessage(msg.chat.id,"No tienes ningun partido sin empezar");
                    }else{
                        if(!respGame){
                            bot.sendMessage(msg.chat.id,"No tienes ningun partido sin empezar");
                        }else{
                            bot.sendMessage(msg.chat.id,"Se ha actualizado el partido a: En curso");
                            sendGameData(respGame,respGame.result,'Ha empezado el partido: ');
                        }
                    }
                }).populate({
                    path: 'category',
                    populate: {
                        path:'sport',
                        model:'Sport'
                    }
                });
            }else{
                bot.sendMessage(msg.chat.id,"No tienes una cuenta de locutor, para ello accede al servicio web");
            }
        }
      });
  });

  bot.onText(/^\/cambiarResultado /, (msg) => {
    var resultado = msg.text.replace(/\/cambiarResultado /, "").trim();
    if(resultado!==null&&resultado.replace(" ","")!==""){
        IdAuthorized.find({idTelegram:msg.chat.id},(err,resIdAuthorized)=>{
            if(err){

            }else{
                if(resIdAuthorized && resIdAuthorized.length!=0){
                    Game.findOneAndUpdate({broadcaster:resIdAuthorized[0].user,status:{ $eq: 'En curso' }},{result:resultado},(err,respGame)=>{
                        if(err){
                            bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                        }else{
                            if(!respGame){
                                bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                            }else{
                                bot.sendMessage(msg.chat.id,"Se ha actualizado el resultado a: "+resultado);
                                sendGameData(respGame,resultado,'Ha cambiado el resultado: ');
                            }
                        }
                    }).populate({
                        path: 'category',
                        populate: {
                            path:'sport',
                            model:'Sport'
                        }
                    });
                }else{
                    bot.sendMessage(msg.chat.id,"No tienes una cuenta de locutor, para ello accede al servicio web");
                }
            }
        });
    }else{
        bot.sendMessage(msg.chat.id,"Tienes que introducir un resultado");
    }
});

bot.onText(/^\/terminarPartido$/, (msg) => {
    IdAuthorized.find({idTelegram:msg.chat.id},(err,resIdAuthorized)=>{
        if(err){

        }else{
            if(resIdAuthorized && resIdAuthorized.length!=0){
                var hoy = new Date();
                Game.findOneAndUpdate({broadcaster:resIdAuthorized[0].user,status:{ $eq: 'En curso' }},{status:'Terminado',dateEnd:hoy},(err,respGame)=>{
                    if(err){
                        bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                    }else{
                        if(!respGame){
                            bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                        }else{
                            bot.sendMessage(msg.chat.id,"Se ha finalizado el partido");
                            sendGameDataAndRemove(respGame,respGame.result,'Ha terminado el partido: ');
                        }
                    }
                }).populate({
                    path: 'category',
                    populate: {
                        path:'sport',
                        model:'Sport'
                    }
                });
            }else{
                bot.sendMessage(msg.chat.id,"No tienes una cuenta de locutor, para ello accede al servicio web");
            }
        }
    });
});

bot.onText(/^\/anularPartido$/, (msg) => {
    IdAuthorized.find({idTelegram:msg.chat.id},(err,resIdAuthorized)=>{
        if(err){

        }else{
            if(resIdAuthorized && resIdAuthorized.length!=0){
                var hoy = new Date();
                Game.findOneAndUpdate({broadcaster:resIdAuthorized[0].user,status:{ $not:{$in:['Terminado','Anulado']}}},{status:'Anulado',dateEnd:hoy},(err,respGame)=>{
                    if(err){
                        bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                    }else{
                        if(!respGame){
                            bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                        }else{
                            bot.sendMessage(msg.chat.id,"Se ha anulado el partido");
                            sendGameDataAndRemove(respGame,respGame.result,'Ha sido anulado el partido: ');
                        }
                    }
                }).populate({
                    path: 'category',
                    populate: {
                        path:'sport',
                        model:'Sport'
                    }
                });
            }else{
                bot.sendMessage(msg.chat.id,"No tienes una cuenta de locutor, para ello accede al servicio web");
            }
        }
    });
});


  function sendLocationGame(msg,game){
    bot.sendLocation(msg.chat.id,game.location.lat,game.location.lng);
  }

  function sendMessageViews(view,message){
    for(var i=0;i<view.length;i++){
        bot.sendMessage(view[i].idEspectador.idTelegram,message);
    }
  }

  function sendGameData(game,resultado,respuesta){
    Participation.find({game:game._id},(err,res2)=>{
        if(err){

        }else{
            for(var j =0;j<res2.length;j++){
                respuesta += res2[j].team.name;
                if(j+1!=res2.length){
                    respuesta += "-"
                }else{
                    respuesta += " Deporte: "+game.category.sport.name +" Resultado: "+resultado;
                    View.find({game:game._id},(err,respView)=>{
                        sendMessageViews(respView,respuesta);
                    }).populate({path:'idEspectador'});
                }
            }
        }
    }).populate({path:'team'});
  }

  function sendGameDataAndRemove(game,resultado,respuesta){
    Participation.find({game:game._id},(err,res2)=>{
        if(err){

        }else{
            for(var j =0;j<res2.length;j++){
                respuesta += res2[j].team.name;
                if(j+1!=res2.length){
                    respuesta += "-"
                }else{
                    respuesta += " Deporte: "+game.category.sport.name +" Resultado: "+resultado;
                    View.find({game:game._id},(err,respView)=>{
                        sendMessageViews(respView,respuesta);
                        View.remove({game:game._id},(err,respView)=>{
                            if(err){
                                console.log(err);
                            }
                        });
                    }).populate({path:'idEspectador'});
                }
            }
        }
    }).populate({path:'team'});
  }

  bot.onText(/^\/espectadoresPartido$/, (msg) => {
    IdAuthorized.find({idTelegram:msg.chat.id},(err,resIdAuthorized)=>{
        if(err){

        }else{
            if(resIdAuthorized && resIdAuthorized.length!=0){
                Game.find({broadcaster:resIdAuthorized[0].user,status:{ $eq: 'En curso' }},(err,respGame)=>{
                    if(err){
                        bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                    }else{
                        if(!respGame||!respGame[0]){
                            bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                        }else{
                            View.find({game:respGame[0]._id},(err,respView)=>{
                                if(err){
                                    bot.sendMessage(msg.chat.id,"No tienes ningun partido en curso");
                                }else{
                                    if(!respView){
                                        bot.sendMessage(msg.chat.id,"No hay espectadores para el partido");
                                    }else{
                                        var persona="persona";
                                        if(respView.length!=1){
                                            persona="personas"
                                        }
                                        bot.sendMessage(msg.chat.id,"Hay "+respView.length+" "+persona+" viendo tu partido");
                                    }
                                }
                            });
                        }
                    }
                });
            }else{
                bot.sendMessage(msg.chat.id,"No tienes una cuenta de locutor, para ello accede al servicio web");
            }
        }
    });
});

  bot.on('polling_error', (error) => {
    console.log(error);  // => 'EFATAL'
  });





    
