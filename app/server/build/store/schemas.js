'use strict';

// Packages

var Joi = require('joi');

var SCHEMAS = {
	DEVICE: Joi.object().keys({
		vendorId: Joi.number().required(),
		vendorName: Joi.string().required(),
		productId: Joi.number().required(),
		productName: Joi.string().required(),
		path: Joi.string(),
		keyIds: Joi.array()
	})
};

Object.freeze(SCHEMAS);
module.exports = SCHEMAS;