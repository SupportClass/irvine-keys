'use strict';

// Native
const path = require('path');

// Packages
const isDev = require('electron-is-dev');

const references = Object.seal({
	mainWindow: undefined,
	xkeys: undefined,
	menu: undefined,
	activeRpcClient: undefined
});

module.exports = {
	references,
	isDev,
	version: (function () {
		const packagePath = path.resolve(__dirname, '../package.json');
		return require(packagePath).version;
	})(),
	sendToMainWindow(...args) {
		if (!references.mainWindow || references.mainWindow.isDestroyed()) {
			return;
		}

		references.mainWindow.webContents.send(...args);
	},
	performRpc(...args) {
		if (!references.activeRpcClient) {
			throw new Error('There is no active RPC client.');
		}

		return references.activeRpcClient.callProcedure(...args);
	},
	sleep(ms) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}
};
