'use strict';

var CONNECTION_PROMPT_WIDTH = 402;
var connectionWindow = void 0;

// Native
var path = require('path');

// Packages

var _require = require('electron'),
    BrowserWindow = _require.BrowserWindow,
    ipcMain = _require.ipcMain;

// Ours


var menu = require('./menu');
var recentConnections = require('./recent-connections');

var _require2 = require('./util'),
    references = _require2.references;

module.exports.open = function () {
	var height = calcConnectionWindowHeight(recentConnections);

	// Calculate the position of the urlPromptWindow.
	// It will appear in the center of the mainWindow.
	var mainWindowPosition = references.mainWindow.getPosition();
	var mainWindowSize = references.mainWindow.getSize();
	var x = Math.round(mainWindowPosition[0] + mainWindowSize[0] / 2 - CONNECTION_PROMPT_WIDTH / 2);
	var y = Math.round(mainWindowPosition[1] + mainWindowSize[1] / 2 - height / 2);

	// If the urlPromptWindow is already open, focus and re-center it.
	if (connectionWindow) {
		connectionWindow.focus();
		connectionWindow.setPosition(x, y);
		return;
	}

	connectionWindow = new BrowserWindow({
		x: x,
		y: y,
		width: CONNECTION_PROMPT_WIDTH,
		height: height,
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

	connectionWindow.on('closed', function () {
		connectionWindow = null;
	});

	// Remove the menu from the urlPromptWindow.
	connectionWindow.setMenu(null);

	var promptPath = path.resolve(__dirname, '../client/connection.html');
	connectionWindow.loadURL('file:///' + promptPath);
};

module.exports.close = function () {
	if (connectionWindow) {
		connectionWindow.close();
	}
};

ipcMain.on('connectionWindow:open', function () {
	module.exports.open();
});

ipcMain.on('connectionWindow:close', function () {
	module.exports.close();
});

ipcMain.on('connectionWindow:submit', function (event, url) {
	recentConnections.touch(url);
	nodecg.connect(url);
	module.exports.close();
	menu.regenerate();
});

function calcConnectionWindowHeight(recentConnections) {
	var BASE_HEIGHT = 80;
	var RECENT_LIST_OVERHEAD = 26;
	var HEIGHT_PER_RECENT = 18;

	var height = BASE_HEIGHT;
	if (recentConnections && recentConnections.length > 0) {
		height += RECENT_LIST_OVERHEAD;
		height += HEIGHT_PER_RECENT * Math.min(recentConnections.length, 5);
	}

	return height;
}