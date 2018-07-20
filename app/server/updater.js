'use strict';

// Packages
const autoUpdater = require('electron-updater').autoUpdater;
const {ipcMain} = require('electron');
const log = require('electron-log');

// Ours
const {isDev, references} = require('./util');

autoUpdater.logger = log;

if (isDev) {
	log.debug('Detected dev environment, autoupdate disabled.');
} else {
	autoUpdater.on('update-downloaded', info => {
		references.mainWindow.webContents.send('updateDownloaded', info);
	});

	log.debug('Checking for updates...');
	autoUpdater.checkForUpdates();

	ipcMain.on('updater:installNow', () => {
		autoUpdater.quitAndInstall();
	});
}

