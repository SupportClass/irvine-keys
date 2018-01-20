'use strict';

// Native

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = require('fs');

// Packages
var promisify = require('es6-promisify');
var semver = require('semver');

var CURRENT_VERSION = require('../util').version;
var CURRENT_MAJOR_VERSION = semver.major(CURRENT_VERSION);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);

module.exports = {
	/**
  * Saves the provided state to disk.
  * Filters the state to save only the relevant keys.
  * @param filePath {String} - The filepath to save to.
  * @param state {Object} - The Redux state to save.
  * @returns {Promise.<String>} - Resolves with the provided filePath, for reflection purposes.
  */
	save: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(filePath, state) {
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.next = 2;
							return writeFile(filePath, JSON.stringify({
								appVersion: CURRENT_VERSION,
								protocol: state.protocol,
								keyConfigs: state.keyConfigs,
								keyMerges: state.keyMerges
							}, null, 2), 'utf-8');

						case 2:
							return _context.abrupt('return', filePath);

						case 3:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		function save(_x, _x2) {
			return _ref.apply(this, arguments);
		}

		return save;
	}(),


	/**
  * Loads state from disk.
  * Filters the loaded state to only load the relevant keys.
  * Errors if the profile being loaded was made with a different major version of the app.
  * @param filePath {String} - The filepath to load from.
  * @param currentState {Object} - The current state, which the loaded state will be merged into.
  * @returns {Promise.<{filePath: String, newState: {}}>}
  */
	load: function () {
		var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(filePath, currentState) {
			var file, loadedState, compatible;
			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return readFile(filePath, 'utf-8');

						case 2:
							file = _context2.sent;
							loadedState = JSON.parse(file);

							if ({}.hasOwnProperty.call(loadedState, 'appVersion')) {
								_context2.next = 6;
								break;
							}

							throw new Error('Profile cannot be loaded, as it is missing the "appVersion" key.');

						case 6:
							if (semver.valid(loadedState.appVersion)) {
								_context2.next = 8;
								break;
							}

							throw new Error('Profile cannot be loaded, as its appVersion is not valid semver.');

						case 8:
							compatible = CURRENT_MAJOR_VERSION === semver.major(loadedState.appVersion);

							if (compatible) {
								_context2.next = 11;
								break;
							}

							throw new Error('Profile cannot be loaded, as it was made with a different major version ' + ('(profile version: ' + loadedState.appVersion + ', app version: ' + CURRENT_VERSION + '.'));

						case 11:
							return _context2.abrupt('return', {
								filePath: filePath,
								newState: _extends({}, currentState, loadedState)
							});

						case 12:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		}));

		function load(_x3, _x4) {
			return _ref2.apply(this, arguments);
		}

		return load;
	}()
};