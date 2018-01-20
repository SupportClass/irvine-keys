'use strict';

// Packages

var HID = require('node-hid');
var usbDetect = require('usb-detection');

// Ours
var appReducer = require('./store/app-reducer');

usbDetect.on('change', enumerateDevices);

function enumerateDevices() {
	console.log(HID.products());
	console.log(Date.now());
}