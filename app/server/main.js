'use strict';

process.on('unhandledRejection', error => {
	// Will print "unhandledRejection err is not defined"
	console.log('unhandledRejection', error);
});

// Native
const path = require('path');

// Packages
const windowStateKeeper = require('electron-window-state');
const {app, BrowserWindow} = require('electron');
const log = require('electron-log');

// Ours
const {version, references} = require('./util');

log.transports.file.level = 'debug';
log.transports.console.level = 'debug';
require('electron-debug')({showDevTools: false});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isSecondInstance = app.makeSingleInstance(() => {
	// Someone tried to run a second instance, we should focus our window.
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}
		mainWindow.focus();
	}
});

if (isSecondInstance) {
	app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', async () => {
	// Load the previous state with fallback to defaults
	const mainWindowState = windowStateKeeper();

	// Create the browser window using the state information.
	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: 1240,
		height: 712,
		useContentSize: true,
		resizable: false,
		frame: true,
		title: `Irvine Keys v${version}`
	});

	// Quit when main window is closed.
	// TODO: Support minimizing to systray.
	mainWindow.on('closed', () => {
		app.quit();
	});

	references.mainWindow = mainWindow;

	// Spin up the HID and menu libs.
	require('./hid');
	require('./menu');

	// Spin up the connection-window lib.
	require('./connection-window');

	// Spin up the autoupdater.
	require('./updater');

	// Let us register listeners on the window, so we can update the state
	// automatically (the listeners will be removed when the window is closed)
	// and restore the maximized or full screen state
	mainWindowState.manage(mainWindow);

	// And load the main.html of the app.
	const webviewPath = path.resolve(__dirname, '../client/main.html');
	mainWindow.loadURL(`file:///${webviewPath}`);
});
