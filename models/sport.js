'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SportSchema = Schema({
    name:{type:String,require:true},
    description:{type: String, required: true},
    maxTeams:{type: Number, required: true},
    image:{type: String}
});

module.exports = mongoose.model('Sport',SportSchema);