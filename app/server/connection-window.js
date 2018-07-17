'use strict';

const CONNECTION_PROMPT_WIDTH = 402;
let connectionWindow;

// Native
const path = require('path');

// Packages
const {BrowserWindow, ipcMain} = require('electron');

// Ours
const menu = require('./menu');
const recentConnections = require('./recent-connections');
const {references} = require('./util');

module.exports.open = function () {
	const height = calcConnectionWindowHeight(recentConnections);

	// Calculate the position of the urlPromptWindow.
	// It will appear in the center of the mainWindow.
	const mainWindowPosition = references.mainWindow.getPosition();
	const mainWindowSize = references.mainWindow.getSize();
	const x = Math.round(mainWindowPosition[0] + (mainWindowSize[0] / 2) - (CONNECTION_PROMPT_WIDTH / 2));
	const y = Math.round(mainWindowPosition[1] + (mainWindowSize[1] / 2) - (height / 2));

	// If the urlPromptWindow is already open, focus and re-center it.
	if (connectionWindow) {
		connectionWindow.focus();
		connectionWindow.setPosition(x, y);
		return;
	}

	connectionWindow = new BrowserWindow({
		x,
		y,
		width: CONNECTION_PROMPT_WIDTH,
		height,
		useContentSize: true,
		resizable: false,
		fullscreen: false,
		fullscreenable: false,
		frame: true,
		minimizable: false,
		maximizable: false,
		autoHideMenuBar: true,
		title: 'Connect'
	});

	connectionWindow.on('closed', () => {
		connectionWindow = null;
	});

	// Remove the menu from the urlPromptWindow.
	connectionWindow.setMenu(null);

	const promptPath = path.resolve(__dirname, '../client/connection.html');
	connectionWindow.loadURL(`file:///${promptPath}`);
};

module.exports.close = function () {
	if (connectionWindow) {
		connectionWindow.close();
	}
};

ipcMain.on('connectionWindow:open', () => {
	module.exports.open();
});

ipcMain.on('connectionWindow:close', () => {
	module.exports.close();
});

ipcMain.on('connectionWindow:submit', (event, url) => {
	recentConnections.touch(url);
	nodecg.connect(url);
	module.exports.close();
	menu.regenerate();
});

function calcConnectionWindowHeight(recentConnections) {
	const BASE_HEIGHT = 80;
	const RECENT_LIST_OVERHEAD = 26;
	const HEIGHT_PER_RECENT = 18;

	let height = BASE_HEIGHT;
	if (recentConnections && recentConnections.length > 0) {
		height += RECENT_LIST_OVERHEAD;
		height += HEIGHT_PER_RECENT * Math.min(recentConnections.length, 5);
	}

	return height;
}
