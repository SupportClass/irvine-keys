'use strict';

// Native
const path = require('path');

// Packages
const isDev = require('electron-is-dev');

const references = Object.seal({
	mainWindow: undefined,
	hid: undefined,
	menu: undefined,
	activeRpcClient: undefined,
	activeRpcService: undefined
});

module.exports = {
	references,
	isDev,
	version: (function () {
		const packagePath = path.resolve(__dirname, '../../package.json');
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
	},
	updateObjectInArray(array, {
		idField = 'id',
		id,
		newProps
	}) {
		const valueIndex = array.findIndex(value => value[idField] === id);
		if (valueIndex < 0) {
			return array;
		}

		const newArray = array.slice(0);
		newArray[valueIndex] = {
			...array[valueIndex],
			...newProps
		};

		return newArray;
	},
	removeObjectFromArray(array, {
		idField = 'id',
		id
	}) {
		return array.filter(item => item[idField] !== id);
	}
};
