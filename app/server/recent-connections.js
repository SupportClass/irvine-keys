'use strict';

// Native
const fs = require('fs');
const path = require('path');

// Packages
const {app, ipcMain} = require('electron');
const log = require('electron-log');
const Joi = require('joi');

// Ours
const menu = require('./menu');
const RpcClient = require('./classes/rpc-client');
const {references} = require('./util');

const userDataPath = app.getPath('userData');
const savedRecentPath = path.join(userDataPath, 'recentConnections.json');
const recentConnectionSchema = Joi.object().keys({
	ip: Joi.string().hostname().required(),
	port: Joi.number().min(1).max(65535).required(),
	lastOpened: Joi.date().timestamp('javascript').required(),
	protoPath: Joi.string()
});

const recentConnections = loadRecentConnections(savedRecentPath);

if (recentConnections.length > 0) {
	const mostRecentConnection = recentConnections[0];
	if (mostRecentConnection) {
		const uri = `${mostRecentConnection.ip}:${mostRecentConnection.port}`;
		log.info(`Restoring connection to ${uri}`);
		module.exports.touch(mostRecentConnection);
		references.activeRpcClient = new RpcClient({
			serverAddress: uri,
			protoPath: '',
			packageName: '',
			serviceName: ''
		});
	}
}

ipcMain.on('recentConnections:getSync', event => {
	event.returnValue = recentConnections;
});

const originalSort = recentConnections.sort.bind(recentConnections);
module.exports = recentConnections;
module.exports.touch = function (ipOrRecentConnectionObj, port) {
	let ip;
	let recent;
	if (typeof ipOrRecentConnectionObj === 'string') {
		ip = ipOrRecentConnectionObj;
		recent = recentConnections.find(r => r.ip === ip && r.port === port);
		if (!recent) {
			recent = {ip, port, lastOpened: Date.now()};
			recentConnections.push(recent);
		}
	} else if (typeof ipOrRecentConnectionObj === 'object') {
		recent = ipOrRecentConnectionObj;
		ip = recent.ip;
	} else {
		throw new TypeError(`First argument must be either a string or object (got a ${typeof ipOrRecentConnectionObj}`);
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
	originalSort((a, b) => {
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
			return JSON.parse(fs.readFileSync(filePath, 'utf-8')).filter(recentConnection => {
				const {error} = Joi.validate(recentConnection, recentConnectionSchema);
				return !error;
			});
		} catch (e) {
			log.error(e);
			return [];
		}
	}

	return [];
}
