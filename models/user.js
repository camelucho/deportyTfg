'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name:{type: String, required: true},
    email:{type: String, required: true},
    password:{type: String, required: true},
    role:{type: String, required: true},
    image:String
});

module.exports = mongoose.model('User',UserSchema);