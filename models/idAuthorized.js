'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var idAuthorizedDataSchema = Schema({
    idTelegram:{type: Number, required: true},
    authorized:{type: Boolean, required: true},
    user:{type:Schema.ObjectId,ref: 'User',require:true}
});

module.exports = mongoose.model('idAuthorized',idAuthorizedDataSchema);