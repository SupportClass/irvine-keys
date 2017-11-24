'use strict';

const KEY_COOLDOWN_DURATION = 50; // Duration (in ms) before a key can be used again after being pressed.

// Packages
const debounce = require('lodash.debounce');
const log = require('electron-log');
const BB = require('bluebird'); // TODO: Remove once Electron uses V8 v6.3.165+, which adds Promise.finally natively.

// Ours
const actions = require('./store/actions');
const Device = require('./classes/device');
const store = require('./store');
const StreamDeckInterface = require('./classes/device-interfaces/stream-deck');
const XkeysInterface = require('./classes/device-interfaces/xkeys');
const {sendToMainWindow, performRpc, references} = require('./util');

let totalCalls = 0;
let activeDevice;
const cooldownTimeouts = new Map();
const vendors = new Map([
	[0x5F3, {
		name: 'PI Engineering, Inc.',
		devices: new Map([
			[0x0405, {
				name: 'X-keys XK-24',
				usage: 1,
				InterfaceClass: XkeysInterface
			}],
			[0x0441, {
				name: 'X-keys XK-80',
				usage: 1,
				InterfaceClass: XkeysInterface
			}]
		])
	}],
	[0x0fd9, {
		name: 'Elgato Systems GmbH',
		devices: new Map([
			[0x0060, {
				name: 'Stream Deck',
				usage: 1,
				InterfaceClass: StreamDeckInterface
			}]
		])
	}]
]);

const sendPressedKeysToMainWindow = debounce(() => {
	sendToMainWindow(
		'xkeys:pressedKeys',
		activeDevice ?
			Array.from(activeDevice.interface.pressedKeys) :
			[]
	);
}, 10);

function selectNewDevice({path, vendorId, productId}) {
	if (activeDevice) {
		activeDevice.destroy();
		activeDevice = null;
	}

	const selectedDeviceMetadata = lookupDeviceMetadata({vendorId, productId});
	activeDevice = new Device(path, selectedDeviceMetadata);

	const PROGRAMMING_KEY_INDEX = activeDevice.interface.constructor.PROGRAMMING_KEY_INDEX;
	activeDevice.interface.on('down', keyIndex => {
		if (keyIndex === PROGRAMMING_KEY_INDEX) {
			return;
		}

		sendPressedKeysToMainWindow();

		const keyConfigs = store.getState().keyConfigs;
		if (!keyConfigs.has(keyIndex)) {
			log.debug(`Key #${keyIndex} has no config, ignoring procedure invocation request.`);
			return;
		}

		const keyConfig = keyConfigs.get(keyIndex);
		if (!keyConfig.procedureName) {
			log.debug(`Key #${keyIndex} has no procedure, ignoring procedure invocation request.`);
			return;
		}

		if (keyIsOnCooldown(keyIndex)) {
			log.debug(`Key #${keyIndex} is on cooldown, ignoring procedure invocation request.`);
			return;
		}

		blockKey(keyIndex); // Block the key entirely until we know how this RPC attempt went.

		/* eslint-disable function-paren-newline */
		/* Ideally, we would use Promise.finally() to call `putKeyOnCooldown`.
		 * However, .finally just recently landed in V8, and is not available in Electron just yet.
		 * Once it is, we can remove this bluebird dependency and simplify this code.
		 * Until then, we use bluebird.resolve to roughly approximate the behavior of .finally. */
		BB.resolve(
			invokeKeyProcedure(keyIndex, keyConfig)
		).then(() => {
			putKeyOnCooldown(keyIndex);
		}).catch(() => {/* Ignore, logging is handled within invokeKeyProcedure */});
		/* eslint-enable function-paren-newline */
	});

	activeDevice.interface.on('up', keyIndex => {
		if (keyIndex === PROGRAMMING_KEY_INDEX) {
			references.mainWindow.focus();
			return;
		}

		sendPressedKeysToMainWindow();
	});

	return activeDevice;
}

function lookupDeviceMetadata({vendorId, productId}) {
	const vendor = vendors.get(vendorId);
	if (!vendor) {
		return;
	}

	return vendor.get(productId);
}

/**
 * Invokes the RPC associated with a given keyIndex.
 * @param keyId {Number}
 * @param keyConfig {Object} - An object which defines the procedureName and procedureArguments for this key's RPC.
 * @returns {Promise}
 */
function invokeKeyProcedure(keyId, keyConfig) {
	const callNumber = totalCalls++;
	log.debug(`Invoking key #${keyId} procedure "${keyConfig.procedureName}" with arguments "${keyConfig.procedureArguments}" (call #${callNumber}).`);

	return new Promise((resolve, reject) => {
		try {
			performRpc(keyConfig.procedureName, keyConfig.procedureArguments)
				.then((...responseArgs) => {
					log.debug(`Call #${callNumber} succeeded, response:`, responseArgs);
					resolve(...responseArgs);
				})
				.catch(error => {
					log.error(`Call #${callNumber} failed, error:`, error);
					reject(error);
				});
		} catch (error) {
			log.error(`Failed to invoke RPC #${callNumber}:`, error);
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
	const expirationTimestamp = Date.now() + KEY_COOLDOWN_DURATION;
	store.dispatch(actions.putKeyOnCooldown(keyId, expirationTimestamp));
	cooldownTimeouts.set(keyId, setTimeout(() => {
		clearKeyCooldown(keyId);
	}, KEY_COOLDOWN_DURATION));
}

/**
 * Blocks a key, preventing it from being used until the block is removed.
 * @param keyId {Number} - The index of the key to block.
 */
function blockKey(keyId) {
	store.dispatch(actions.blockKey(keyId));
}

/**
 * Clears a key's cooldown, allowing it to be immediately used.
 * @param keyId {Number} - The index of the key to re-enable.
 */
function clearKeyCooldown(keyId) {
	clearTimeout(cooldownTimeouts.get(keyId));
	cooldownTimeouts.delete(keyId);
	store.dispatch(actions.clearKeyCooldown(keyId));
}

/**
 * Returns a boolean indicating if a key is on cooldown (or blocked).
 * @param keyId
 * @returns {Boolean} - True if the key is either blocked or on cooldown. False otherwise.
 */
function keyIsOnCooldown(keyId) {
	const keyState = store.getState().keyStates.find(({id}) => id === keyId);
	if (!keyState) {
		return false;
	}
	return keyState.blocked || keyState.coolingDown;
}

module.exports = {
	selectNewDevice,
	lookupDeviceMetadata
};
