'use strict'

var jwt = require('jwt-simple');
var jwt_decode = require('jwt-decode');
var moment = require('moment');
var secret = 'clave_secreta_curso'

exports.parseJwt = function(token) {
	return jwt_decode(token);
};

exports.createToken = function(user){
	var payload = {
		sub: user._id,
		name: user.name,
		idTelegram: user.idTelegram,
		email: user.email,
		role: user.role,
		image: user.image,
		iat: moment().unix(),
		exp: moment().add(1,'days').unix()
	};

	return jwt.encode(payload,secret);
};