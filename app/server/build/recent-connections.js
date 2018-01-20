'use strict';

// Native

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var fs = require('fs');
var path = require('path');

// Packages

var _require = require('electron'),
    app = _require.app,
    ipcMain = _require.ipcMain;

var log = require('electron-log');
var Joi = require('joi');

// Ours
var menu = require('./menu');
var RpcClient = require('./classes/rpc-client');

var _require2 = require('./util'),
    references = _require2.references;

var userDataPath = app.getPath('userData');
var savedRecentPath = path.join(userDataPath, 'recentConnections.json');
var recentConnectionSchema = Joi.object().keys({
	ip: Joi.string().hostname().required(),
	port: Joi.number().min(1).max(65535).required(),
	lastOpened: Joi.date().timestamp('javascript').required(),
	protoPath: Joi.string()
});

var recentConnections = loadRecentConnections(savedRecentPath);

if (recentConnections.length > 0) {
	var mostRecentConnection = recentConnections[0];
	if (mostRecentConnection) {
		var uri = mostRecentConnection.ip + ':' + mostRecentConnection.port;
		log.info('Restoring connection to ' + uri);
		module.exports.touch(mostRecentConnection);
		references.activeRpcClient = new RpcClient({
			serverAddress: uri,
			protoPath: '',
			packageName: '',
			serviceName: ''
		});
	}
}

ipcMain.on('recentConnections:getSync', function (event) {
	event.returnValue = recentConnections;
});

var originalSort = recentConnections.sort.bind(recentConnections);
module.exports = recentConnections;
module.exports.touch = function (ipOrRecentConnectionObj, port) {
	var ip = void 0;
	var recent = void 0;
	if (typeof ipOrRecentConnectionObj === 'string') {
		ip = ipOrRecentConnectionObj;
		recent = recentConnections.find(function (r) {
			return r.ip === ip && r.port === port;
		});
		if (!recent) {
			recent = { ip: ip, port: port, lastOpened: Date.now() };
			recentConnections.push(recent);
		}
	} else if ((typeof ipOrRecentConnectionObj === 'undefined' ? 'undefined' : _typeof(ipOrRecentConnectionObj)) === 'object') {
		recent = ipOrRecentConnectionObj;
		ip = recent.ip;
	} else {
		throw new TypeError('First argument must be either a string or object (got a ' + (typeof ipOrRecentConnectionObj === 'undefined' ? 'undefined' : _typeof(ipOrRecentConnectionObj)));
	}

	recent.lastOpened = Date.now();

	if (recentConnections.length > 10) {
		recentConnections.length = 10;
	}

	module.exports.sort();

	try {
		fs.writeFileSync(savedRecentPath, JSON.stringify(recentConnections), 'utf-8');
	} catch (e) {
		log.error(e);
	}

	menu.regenerate();
};

module.exports.sort = function () {
	originalSort(function (a, b) {
		return b.lastOpened - a.lastOpened;
	});
};

/**
 * Loads recent connections from a JSON file.
 * @returns {Array} - The parsed recent connections.
 * If an error was encountered while loading or parsing the JSON file, this will just be an empty array.
 */
function loadRecentConnections(filePath) {
	if (fs.existsSync(filePath)) {
		try {
			// Filter out old entries which no longer match the schema.
			return JSON.parse(fs.readFileSync(filePath, 'utf-8')).filter(function (recentConnection) {
				var _Joi$validate = Joi.validate(recentConnection, recentConnectionSchema),
				    error = _Joi$validate.error;

				return !error;
			});
		} catch (e) {
			log.error(e);
			return [];
		}
	}

	return [];
}