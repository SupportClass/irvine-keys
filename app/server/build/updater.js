'use strict';

// Packages

var autoUpdater = require('electron-updater').autoUpdater;

var _require = require('electron'),
    ipcMain = _require.ipcMain;

var log = require('electron-log');

// Ours

var _require2 = require('./util'),
    isDev = _require2.isDev,
    references = _require2.references;

autoUpdater.logger = log;

if (isDev) {
	log.debug('Detected dev environment, autoupdate disabled.');
} else {
	autoUpdater.on('update-downloaded', function (info) {
		references.mainWindow.webContents.send('updateDownloaded', info);
	});

	log.debug('Checking for updates...');
	autoUpdater.checkForUpdates();

	ipcMain.on('updater:installNow', function () {
		autoUpdater.quitAndInstall();
	});
}