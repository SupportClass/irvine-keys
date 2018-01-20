'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('babel-polyfill');

process.on('unhandledRejection', function (error) {
	// Will print "unhandledRejection err is not defined"
	console.log('unhandledRejection', error);
});

// Native
var path = require('path');

// Packages
var windowStateKeeper = require('electron-window-state');

var _require = require('electron'),
    app = _require.app,
    BrowserWindow = _require.BrowserWindow;

var log = require('electron-log');

// Ours

var _require2 = require('./util'),
    version = _require2.version,
    references = _require2.references;

log.transports.file.level = 'debug';
log.transports.console.level = 'debug';
require('electron-debug')({ showDevTools: false });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = void 0;

var isSecondInstance = app.makeSingleInstance(function () {
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
app.on('ready', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	var mainWindowState, webviewPath;
	return regeneratorRuntime.wrap(function _callee$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					// Load the previous state with fallback to defaults
					mainWindowState = windowStateKeeper();

					// Create the browser window using the state information.

					mainWindow = new BrowserWindow({
						x: mainWindowState.x,
						y: mainWindowState.y,
						width: 1240,
						height: 712,
						useContentSize: true,
						resizable: false,
						frame: true,
						title: 'Irvine Keys v' + version
					});

					// Quit when main window is closed.
					// TODO: Support minimizing to systray.
					mainWindow.on('closed', function () {
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
					webviewPath = path.resolve(__dirname, '../../client/main.html');

					mainWindow.loadURL('file:///' + webviewPath);

				case 11:
				case 'end':
					return _context.stop();
			}
		}
	}, _callee, undefined);
})));