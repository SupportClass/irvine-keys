'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var KEY_COOLDOWN_DURATION = 50; // Duration (in ms) before a key can be used again after being pressed.

// Packages
var BB = require('bluebird'); // TODO: Remove once Electron uses V8 v6.3.165+, which natively adds Promise.finally()
var debounce = require('lodash.debounce');
var log = require('electron-log');

// Ours
var appActions = require('./store/app-reducer').actions;
var Device = require('./classes/device');
var keyStatesActions = require('./keyStates/keyStates-reducer').actions;
var store = require('./store');
var StreamDeckInterface = require('./classes/device-interfaces/stream-deck');
var XkeysInterface = require('./classes/device-interfaces/xkeys');

var _require = require('./util'),
    sendToMainWindow = _require.sendToMainWindow,
    performRpc = _require.performRpc,
    references = _require.references;

var totalCalls = 0;
var activeDevice = void 0;
var cooldownTimeouts = new Map();
var vendors = new Map([[0x5F3, {
	name: 'PI Engineering, Inc.',
	products: new Map([[0x0405, {
		name: 'X-keys XK-24',
		usage: 1,
		columns: 4,
		rows: 6,
		supportsKeyMerging: true,
		InterfaceClass: XkeysInterface
	}], [0x0441, {
		name: 'X-keys XK-80',
		usage: 1,
		InterfaceClass: XkeysInterface
	}]])
}], [0x0fd9, {
	name: 'Elgato Systems GmbH',
	products: new Map([[0x0060, {
		name: 'Stream Deck',
		usage: 1,
		InterfaceClass: StreamDeckInterface
	}]])
}]]);

var supportedDevices = [];
vendors.forEach(function (vendor, vendorId) {
	vendor.products.forEach(function (product, productId) {
		supportedDevices.push({
			vendorId: vendorId,
			vendorName: vendor.name,
			productId: productId,
			productName: product.name
		});
	});
});

store.dispatch(appActions.setSupportedDevices(supportedDevices));

var sendPressedKeysToMainWindow = debounce(function () {
	sendToMainWindow('xkeys:pressedKeys', activeDevice ? Array.from(activeDevice.interface.pressedKeys) : []);
}, 10);

function selectNewDevice(_ref) {
	var path = _ref.path,
	    vendorId = _ref.vendorId,
	    productId = _ref.productId;

	if (activeDevice) {
		activeDevice.destroy();
		activeDevice = null;
	}

	var selectedDeviceMetadata = lookupDeviceMetadata({ vendorId: vendorId, productId: productId });
	activeDevice = new Device(path, selectedDeviceMetadata);
	store.dispatch(appActions.selectDevice(selectedDeviceMetadata.keys));

	var PROGRAMMING_KEY_ID = activeDevice.interface.constructor.PROGRAMMING_KEY_ID;
	activeDevice.interface.on('down', function (keyId) {
		if (keyId === PROGRAMMING_KEY_ID) {
			return;
		}

		var state = store.getState();
		var merge = state.merges.find(function (merge) {
			return merge.keyIds.includes(keyId);
		});
		if (merge) {
			log.debug('Key #' + keyId + ' pressed, and is part of a merge:', merge);
			keyId = merge.rootKeyId;
		}

		sendPressedKeysToMainWindow(); // TODO: This doesn't handle merges right.

		var keyConfig = state.keyConfigs.find(function (kc) {
			return kc.id === keyId;
		});
		if (!keyConfig) {
			log.debug('Key #' + keyId + ' has no config, ignoring procedure invocation request.');
			return;
		}

		if (keyConfig.disabled) {
			log.debug('Key #' + keyId + ' is disabled, ignoring procedure invocation request.');
			return;
		}

		if (!keyConfig.procedureName) {
			log.debug('Key #' + keyId + ' has no procedure, ignoring procedure invocation request.');
			return;
		}

		if (keyIsOnCooldown(keyId)) {
			log.debug('Key #' + keyId + ' is on cooldown, ignoring procedure invocation request.');
			return;
		}

		blockKey(keyId); // Block the key entirely until we know how this RPC attempt went.

		/* eslint-disable function-paren-newline */
		/* Ideally, we would use Promise.finally() to call `putKeyOnCooldown`.
   * However, .finally just recently landed in V8, and is not available in Electron just yet.
   * Once it is, we can remove this bluebird dependency and simplify this code.
   * Until then, we use bluebird.resolve to roughly approximate the behavior of .finally. */
		BB.resolve(invokeKeyProcedure(keyId, keyConfig)).then(function () {
			putKeyOnCooldown(keyId);
		}).catch(function () {/* Ignore, logging is handled within invokeKeyProcedure */});
		/* eslint-enable function-paren-newline */
	});

	activeDevice.interface.on('up', function (keyIndex) {
		if (keyIndex === PROGRAMMING_KEY_ID) {
			references.mainWindow.focus();
			return;
		}

		sendPressedKeysToMainWindow();
	});

	return activeDevice;
}

function lookupDeviceMetadata(_ref2) {
	var vendorId = _ref2.vendorId,
	    productId = _ref2.productId;

	var vendor = vendors.get(vendorId);
	if (!vendor) {
		return;
	}

	var product = vendor.get(productId);
	if (!product) {
		return;
	}

	return _extends({
		vendorName: vendor.name
	}, product);
}

/**
 * Invokes the RPC associated with a given keyIndex.
 * @param keyId {Number}
 * @param keyConfig {Object} - An object which defines the procedureName and procedureArguments for this key's RPC.
 * @returns {Promise}
 */
function invokeKeyProcedure(keyId, keyConfig) {
	var callNumber = totalCalls++;
	log.debug('Invoking key #' + keyId + ' procedure "' + keyConfig.procedureName + '" with arguments "' + keyConfig.procedureArguments + '" (call #' + callNumber + ').');

	return new Promise(function (resolve, reject) {
		try {
			performRpc(keyConfig.procedureName, keyConfig.procedureArguments).then(function () {
				for (var _len = arguments.length, responseArgs = Array(_len), _key = 0; _key < _len; _key++) {
					responseArgs[_key] = arguments[_key];
				}

				log.debug('Call #' + callNumber + ' succeeded, response:', responseArgs);
				resolve.apply(undefined, responseArgs);
			}).catch(function (error) {
				log.error('Call #' + callNumber + ' failed, error:', error);
				reject(error);
			});
		} catch (error) {
			log.error('Failed to invoke RPC #' + callNumber + ':', error);
			reject(error);
		}
	});
}

/**
 * Puts a key on cooldown, preventing it from being used until the cooldown expires.
 * @param keyId {Number} - The index of the key to put on cooldown.
 */
function putKeyOnCooldown(keyId) {
	clearTimeout(cooldownTimeouts.get(keyId));
	var expirationTimestamp = Date.now() + KEY_COOLDOWN_DURATION;
	store.dispatch(keyStatesActions.putKeyOnCooldown(keyId, expirationTimestamp));
	cooldownTimeouts.set(keyId, setTimeout(function () {
		clearKeyCooldown(keyId);
	}, KEY_COOLDOWN_DURATION));
}

/**
 * Blocks a key, preventing it from being used until the block is removed.
 * @param keyId {Number} - The index of the key to block.
 */
function blockKey(keyId) {
	store.dispatch(keyStatesActions.blockKey(keyId));
}

/**
 * Clears a key's cooldown, allowing it to be immediately used.
 * @param keyId {Number} - The index of the key to re-enable.
 */
function clearKeyCooldown(keyId) {
	clearTimeout(cooldownTimeouts.get(keyId));
	cooldownTimeouts.delete(keyId);
	store.dispatch(keyStatesActions.clearKeyCooldown(keyId));
}

/**
 * Returns a boolean indicating if a key is on cooldown (or blocked).
 * @param keyId
 * @returns {Boolean} - True if the key is either blocked or on cooldown. False otherwise.
 */
function keyIsOnCooldown(keyId) {
	var keyState = store.getState().keyStates.find(function (_ref3) {
		var id = _ref3.id;
		return id === keyId;
	});
	if (!keyState) {
		return false;
	}
	return keyState.blocked || keyState.coolingDown;
}

module.exports = {
	selectNewDevice: selectNewDevice,
	lookupDeviceMetadata: lookupDeviceMetadata
};