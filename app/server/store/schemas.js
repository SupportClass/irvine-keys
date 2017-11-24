'use strict';

// Packages
const Joi = require('joi');

const SCHEMAS = {
	DEVICE: Joi.object.keys({
		path: Joi.string().required(),
		vendorId: Joi.number().required(),
		productId: Joi.number().required()
	})
};

Object.freeze(SCHEMAS);
module.exports = SCHEMAS;
