'use strict';

// Packages
const HID = require('node-hid');
const Joi = require('joi');
const usbDetect = require('usb-detection');

// Ours
const store = require('./store');
const appReducer = require('./store/app-reducer');
const SCHEMAS = require('./store/schemas');

usbDetect.on('change', enumerateDevices);
enumerateDevices();
usbDetect.startMonitoring();

function enumerateDevices() {
	const remapped = HID.devices().map(device => {
		return {
			vendorId: device.vendorId,
			vendorName: device.manufacturer,
			productId: device.productId,
			productName: device.product,
			path: device.path,
			usage: device.usage
		};
	}).filter(device => {
		const {error: validationError} = Joi.validate(device, SCHEMAS.DEVICE);
		return !validationError;
	});
	store.dispatch(appReducer.actions.updateDetectedDevices(remapped));
}
