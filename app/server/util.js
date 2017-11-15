'use strict';

// Native
const path = require('path');

// Packages
const isDev = require('electron-is-dev');

const references = Object.seal({
	mainWindow: undefined,
	xkeys: undefined,
	menu: undefined
});

module.exports = {
	references,
	isDev,
	version: (function () {
		const packagePath = path.resolve(__dirname, '../package.json');
		return require(packagePath).version;
	})(),
	sendToMainWindow(...args) {
		if (references.mainWindow.isDestroyed()) {
			return;
		}

		references.mainWindow.webContents.send(...args);
	}
};
