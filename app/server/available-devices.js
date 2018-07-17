'use strict';

// Packages
const HID = require('node-hid');
const usbDetect = require('usb-detection');

// Ours
const appReducer = require('./store/app-reducer');

usbDetect.on('change', enumerateDevices);

function enumerateDevices() {
	console.log(HID.products());
	console.log(Date.now());
}

