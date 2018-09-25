'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = Schema({
    result:{type: String, required: true},
    dateStart:{type: Date, required: true},
    dateEnd:{type: Date},
    status:{type: String, required: true},
    broadcaster:{type:Schema.ObjectId,ref: 'User', required: true},
    location: {type: {lat:Number,lng:Number}, required: true},
    //tournament:{type:Schema.ObjectId,ref: 'Tournament'},
    category:{type:Schema.ObjectId,ref: 'Category',required:true}
    
});

GameSchema.index({location: '2dsphere'});

module.exports = mongoose.model('Game',GameSchema);