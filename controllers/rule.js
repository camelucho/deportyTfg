'use strict'

var Rule = require('../models/rule');

function saveRule(req,res){
    var rule = new Rule();
    var params = req.body;
    rule.description=params.description;
    rule.sport=params.sport;

    rule.save((err,ruleSaved)=>{
        if(err){
            res.status(500).send({message: 'Error al guardar la regla'});
        }else{
            if(!ruleSaved){
                res.status(404).send({message: 'La regla no ha sido guardada'});	
            }else{
                res.status(200).send({rule:ruleSaved});
            }
        }
    });
}

function updateRule(req,res){
	var ruleId = req.params.id;
	var update = req.body;

	Rule.findByIdAndUpdate(ruleId,update,(err,ruleUpdated)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!ruleUpdated){
				res.status(404).send({message: 'No se ha actualizado correctamente la regla'});	
			}else{
				res.status(200).send({rule:ruleUpdated});
			}
		}
	});
}

function deleteRule(req,res){
	var ruleId = req.params.id;

	Rule.findByIdAndRemove(ruleId,(err,ruleRemoved)=>{
		if(err){
			res.status(500).send({message: 'Error al eliminar el deporte'});
		}else{
			if(!ruleRemoved){
				res.status(404).send({message: 'No se ha borrado correctamente el deporte'});	
			}else{
				res.status(200).send({rule:ruleRemoved});
			}
		}
    });
}


function getRules(req,res){
    var sportId = req.params.sport;

	if(sportId){
        var find = Rule.find({sport:sportId});
        find.populate({path:'sport'}).exec((err,rules)=>{
            if(err){
                res.status(500).send({message: 'Error en la petición'});
            }else{
                if(!rules){
                    res.status(404).send({message: 'No hay reglas'});
                }else{
                    res.status(200).send({rules});
                }	
            }
        });
	}else{
		res.status(404).send({message: 'No se ha encontrado el deporte'});
	}
}


module.exports = {
    deleteRule,
    updateRule,
    getRules,
    saveRule
};