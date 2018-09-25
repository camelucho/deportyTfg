'use strict'

var Category = require('../models/category');

function saveCategory(req,res){
    var category = new Category();
    var params = req.body;
    category.categoryType=params.categoryType;
    category.pro=params.pro;
    category.sport=params.sport;

    category.save((err,categorySaved)=>{
        if(err){
            res.status(500).send({message: 'Error al guardar la categoría'});
        }else{
            if(!categorySaved){
                res.status(404).send({message: 'La caegoría no ha sido guardada'});	
            }else{
                res.status(200).send({category:categorySaved});
            }
        }
    });
}

function updateCategory(req,res){
	var categoryId = req.params.id;
	var update = req.body;

	Category.findByIdAndUpdate(categoryId,update,(err,categoryUpdated)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!categoryUpdated){
				res.status(404).send({message: 'No se ha actualizado correctamente la categoría'});	
			}else{
				res.status(200).send({category:categoryUpdated});
			}
		}
	});
}

function deleteCategory(req,res){
	var categoryId = req.params.id;

	Category.findByIdAndRemove(categoryId,(err,categoryRemoved)=>{
		if(err){
			res.status(500).send({message: 'Error al eliminar la categoría'});
		}else{
			if(!categoryRemoved){
				res.status(404).send({message: 'No se ha borrado correctamente la categoría'});	
			}else{
				res.status(200).send({category:categoryRemoved});
			}
		}
    });
}


function getCategorias(req,res){
    var sportId = req.params.sport;

	if(sportId){
        var find = Category.find({sport:sportId});
        find.populate({path:'sport'}).exec((err,categories)=>{
            if(err){
                res.status(500).send({message: 'Error en la petición'});
            }else{
                if(!categories){
                    res.status(404).send({message: 'No hay Categorías'});
                }else{
                    res.status(200).send({categories});
                }	
            }
        });
	}else{
		res.status(404).send({message: 'No se ha encontrado el deporte'});
	}
}

function getCategory(req,res){
    var categoryId= req.params.id
    Category.findById(categoryId,(err,categoryFinded)=>{
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
            if(!categoryFinded){
                res.status(404).send({message:'El equipo no existe'});
            }else{
                res.status(200).send({category:categoryFinded});
            }
        }
    });
}


module.exports = {
    getCategory,
    deleteCategory,
    updateCategory,
    getCategorias,
    saveCategory
};