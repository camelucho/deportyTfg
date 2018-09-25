'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = Schema({
    pro:{type: Boolean, required: true},
    categoryType:{type: String, required: true},
    sport:{type:Schema.ObjectId,ref: 'Sport',require: true}
});

module.exports = mongoose.model('Category',CategorySchema);