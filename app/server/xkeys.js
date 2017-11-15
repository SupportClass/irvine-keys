'use strict';

// Packages
const XKeys = require('xkeys');
const debounce = require('lodash.debounce');

// Ours
const {sendToMainWindow, references} = require('./util');

const pressedKeys = new Set();
const myXkeysPanel = new XKeys();
const sendPressedKeysToMainWindow = debounce(() => {
	sendToMainWindow('xkeys:pressedKeys', Array.from(pressedKeys));
}, 10);

myXkeysPanel.on('down', keyIndex => {
	if (keyIndex === 'PS') {
		// This is the programming key.
		return;
	}

	pressedKeys.add(parseInt(keyIndex, 10));
	myXkeysPanel.setBacklight(keyIndex, true);
	sendPressedKeysToMainWindow();
});

myXkeysPanel.on('up', keyIndex => {
	if (keyIndex === 'PS') {
		// This is the programming key.
		references.mainWindow.focus();
		return;
	}

	pressedKeys.delete(parseInt(keyIndex, 10));
	myXkeysPanel.setBacklight(keyIndex, false);
	sendPressedKeysToMainWindow();
});
