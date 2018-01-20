'use strict';

// Native

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var path = require('path');

// Packages
var isDev = require('electron-is-dev');

var references = Object.seal({
	mainWindow: undefined,
	hid: undefined,
	menu: undefined,
	activeRpcClient: undefined,
	activeRpcService: undefined
});

module.exports = {
	references: references,
	isDev: isDev,
	version: function () {
		var packagePath = path.resolve(__dirname, '../../package.json');
		return require(packagePath).version;
	}(),
	sendToMainWindow: function sendToMainWindow() {
		var _references$mainWindo;

		if (!references.mainWindow || references.mainWindow.isDestroyed()) {
			return;
		}

		(_references$mainWindo = references.mainWindow.webContents).send.apply(_references$mainWindo, arguments);
	},
	performRpc: function performRpc() {
		var _references$activeRpc;

		if (!references.activeRpcClient) {
			throw new Error('There is no active RPC client.');
		}

		return (_references$activeRpc = references.activeRpcClient).callProcedure.apply(_references$activeRpc, arguments);
	},
	sleep: function sleep(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms);
		});
	},
	updateObjectInArray: function updateObjectInArray(array, _ref) {
		var _ref$idField = _ref.idField,
		    idField = _ref$idField === undefined ? 'id' : _ref$idField,
		    id = _ref.id,
		    newProps = _ref.newProps;

		var valueIndex = array.findIndex(function (value) {
			return value[idField] === id;
		});
		if (valueIndex < 0) {
			return array;
		}

		var newArray = array.slice(0);
		newArray[valueIndex] = _extends({}, array[valueIndex], newProps);

		return newArray;
	},
	removeObjectFromArray: function removeObjectFromArray(array, _ref2) {
		var _ref2$idField = _ref2.idField,
		    idField = _ref2$idField === undefined ? 'id' : _ref2$idField,
		    id = _ref2.id;

		return array.filter(function (item) {
			return item[idField] !== id;
		});
	}
};