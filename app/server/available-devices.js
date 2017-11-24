'use strict';

const HID = require('node-hid');
const usbDetect = require('usb-detection');

usbDetect.on('change', enumerateDevices);

function enumerateDevices() {
	console.log(HID.devices());
	console.log(Date.now());
}

