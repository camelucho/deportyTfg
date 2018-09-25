'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamSchema = Schema({
    name:{type: String, required: true},
    tag:{type: String, required: true},
    description:{type: String, required: true},
    image:String,
    sport:{type:Schema.ObjectId,ref: 'Sport',require:true}
    //creador:{type:Schema.ObjectId,ref: 'User'},
    //tournament:{type:Schema.ObjectId,ref: 'Tournament'},
});

module.exports = mongoose.model('Team',TeamSchema);