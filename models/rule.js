'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RuleSchema = Schema({
    description:{type: String, required: true},
    sport:{type:Schema.ObjectId,ref: 'Sport',require:true}
});

module.exports = mongoose.model('Rule',RuleSchema);