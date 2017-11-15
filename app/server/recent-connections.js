'use strict';

// Native
const fs = require('fs');
const path = require('path');

// Packages
const {app, ipcMain} = require('electron');
const log = require('electron-log');

// Ours
const menu = require('./menu');
const nodecg = require('./nodecg');

const userDataPath = app.getPath('userData');
const recentPath = path.join(userDataPath, 'recentConnections.json');

const recentConnections = (function () {
	if (fs.existsSync(recentPath)) {
		try {
			return JSON.parse(fs.readFileSync(recentPath, 'utf-8'));
		} catch (e) {
			log.error(e);
			return [];
		}
	}

	return [];
})();

if (recentConnections.length > 0) {
	const mostRecentconnection = recentConnections[0];
	if (mostRecentconnection && mostRecentconnection.url) {
		log.info(`Restoring connection to ${mostRecentconnection.url}`);
		mostRecentconnection.lastOpened = Date.now();
		nodecg.connect(mostRecentconnection.url);
	}
}

ipcMain.on('recentConnections:getSync', event => {
	event.returnValue = recentConnections;
});

const originalSort = recentConnections.sort.bind(recentConnections);
module.exports = recentConnections;
module.exports.touch = function (url) {
	let recent = recentConnections.find(r => r.url === url);
	if (!recent) {
		recent = {url};
		recentConnections.push(recent);
		if (recentConnections.length > 10) {
			recentConnections.length = 10;
		}
	}

	recent.lastOpened = Date.now();
	module.exports.sort();

	try {
		fs.writeFileSync(recentPath, JSON.stringify(recentConnections), 'utf-8');
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
