'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ParticipationSchema = Schema({
    numberTeam:{type: Number, required: true},
    team:{type:Schema.ObjectId,ref: 'Team',require:true},
    game:{type:Schema.ObjectId,ref: 'Game',require:true}
});

module.exports = mongoose.model('Participation',ParticipationSchema);