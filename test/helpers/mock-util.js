'use strict';

// Native
const path = require('path');

// Packages
const sinon = require('sinon');

const references = Object.seal({
	mainWindow: undefined,
	xkeys: undefined,
	menu: undefined
});

module.exports = {
	references,
	isDev: false,
	version: (function () {
		const packagePath = path.resolve(__dirname, '../../app/package.json');
		return require(packagePath).version;
	})(),
	sendToMainWindow: sinon.stub()
};
