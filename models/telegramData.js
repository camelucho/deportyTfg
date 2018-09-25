'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TelegramDataSchema = Schema({
    idTelegram:Number,
    token: String,
    generationDate:Date,
    user:{type:Schema.ObjectId,ref: 'User'}
});

module.exports = mongoose.model('TelegramData',TelegramDataSchema);