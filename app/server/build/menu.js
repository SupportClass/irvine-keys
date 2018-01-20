'use strict';

var ABOUT_WIDTH = 455;
var ABOUT_HEIGHT = 230;

// Native
var path = require('path');

// Packages

var _require = require('electron'),
    app = _require.app,
    BrowserWindow = _require.BrowserWindow,
    Menu = _require.Menu,
    shell = _require.shell;

// Ours


var connectionWindow = require('./connection-window');
var recentConnections = require('./recent-connections');

var _require2 = require('./util'),
    references = _require2.references;

var aboutWindow = void 0;
regenerateMenu();
module.exports.regenerate = regenerateMenu;

function regenerateMenu() {
	var fileTemplate = {
		label: 'File',
		submenu: [{
			label: 'Open...',
			click: function click() {
				connectionWindow.open();
			}
		}, {
			label: 'Open Recent',
			submenu: recentConnections.map(function (r) {
				return {
					label: r.url,
					click: function click() {
						// nodecg.connect(r.url);
						recentConnections.touch(r.url); // Calls `menu.regenerate` automatically.
					}
				};
			})
		}]
	};

	var viewTemplate = {
		label: 'View',
		submenu: [{
			label: 'Reload',
			accelerator: 'CmdOrCtrl+R',
			click: function click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.reload();
				}
			}
		}, {
			label: 'Toggle Full Screen',
			accelerator: function () {
				if (process.platform === 'darwin') {
					return 'Ctrl+Command+F';
				}

				return 'F11';
			}(),
			click: function click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
				}
			}
		}, {
			label: 'Toggle Developer Tools',
			accelerator: function () {
				if (process.platform === 'darwin') {
					return 'Alt+Command+I';
				}

				return 'Ctrl+Shift+I';
			}(),
			click: function click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.toggleDevTools();
				}
			}
		}]
	};

	var windowTemplate = {
		label: 'Window',
		role: 'window',
		submenu: [{
			label: 'Minimize',
			accelerator: 'CmdOrCtrl+M',
			role: 'minimize'
		}, {
			label: 'Close',
			accelerator: 'CmdOrCtrl+W',
			role: 'close'
		}]
	};

	var helpTemplate = {
		label: 'Help',
		role: 'help',
		submenu: [{
			label: 'About',
			click: function click() {
				// Calculate the position of the aboutWindow.
				// It will appear in the center of the mainWindow.
				var mainWindowPosition = references.mainWindow.getPosition();
				var mainWindowSize = references.mainWindow.getSize();
				var x = Math.round(mainWindowPosition[0] + mainWindowSize[0] / 2 - ABOUT_WIDTH / 2);
				var y = Math.round(mainWindowPosition[1] + mainWindowSize[1] / 2 - ABOUT_HEIGHT / 2);

				// If the aboutWindow is already open, focus and re-center it.
				if (aboutWindow) {
					aboutWindow.focus();
					aboutWindow.setPosition(x, y);
					return;
				}

				aboutWindow = new BrowserWindow({
					x: x,
					y: y,
					width: ABOUT_WIDTH,
					height: ABOUT_HEIGHT,
					useContentSize: true,
					resizable: false,
					fullscreen: false,
					fullscreenable: false,
					frame: true,
					minimizable: false,
					maximizable: false,
					autoHideMenuBar: true,
					title: 'About Irvine Keys'
				});

				aboutWindow.on('closed', function () {
					aboutWindow = null;
				});

				// Remove the menu from the aboutWindow.
				aboutWindow.setMenu(null);

				var promptPath = path.resolve(__dirname, '../../client/about/about.html');
				aboutWindow.loadURL('file:///' + promptPath);
			}
		}, {
			label: 'Report A Bug',
			click: function click() {
				shell.openExternal('https://bitbucket.org/tespa/irvine-keys/issues/new');
			}
		}]
	};

	var template = [fileTemplate, viewTemplate, windowTemplate, helpTemplate];

	// Add Mac-specific menu items
	if (process.platform === 'darwin') {
		var name = app.getName();
		template.unshift({
			label: name,
			submenu: [{
				label: 'About ' + name,
				role: 'about'
			}, {
				type: 'separator'
			}, {
				label: 'Services',
				role: 'services',
				submenu: []
			}, {
				type: 'separator'
			}, {
				label: 'Hide ' + name,
				accelerator: 'Command+H',
				role: 'hide'
			}, {
				label: 'Hide Others',
				accelerator: 'Command+Alt+H',
				role: 'hideothers'
			}, {
				label: 'Show All',
				role: 'unhide'
			}, {
				type: 'separator'
			}, {
				label: 'Quit',
				accelerator: 'Command+Q',
				click: function click() {
					app.quit();
				}
			}]
		});

		windowTemplate.submenu.push({
			type: 'separator'
		}, {
			label: 'Bring All to Front',
			role: 'front'
		});
	}

	var menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}