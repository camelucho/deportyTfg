'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ViewSchema = Schema({
    idEspectador:{type:Schema.ObjectId,ref: 'idAuthorized',require:true},
    game:{type:Schema.ObjectId,ref: 'Game',require:true}
});

module.exports = mongoose.model('View',ViewSchema);