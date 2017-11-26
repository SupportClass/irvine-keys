'use strict';

const KEY_COOLDOWN_DURATION = 50; // Duration (in ms) before a key can be used again after being pressed.

// Packages
const debounce = require('lodash.debounce');
const log = require('electron-log');
const BB = require('bluebird'); // TODO: Remove once Electron uses V8 v6.3.165+, which natively adds Promise.finally()

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
		products: new Map([
			[0x0405, {
				name: 'X-keys XK-24',
				usage: 1,
				columns: 4,
				rows: 6,
				supportsKeyMerging: true,
				get keys() {
					return [];
				},
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
		products: new Map([
			[0x0060, {
				name: 'Stream Deck',
				usage: 1,
				InterfaceClass: StreamDeckInterface
			}]
		])
	}]
]);

const supportedDevices = [];
vendors.forEach((vendorId, vendor) => {
	vendor.products.forEach((productId, product) => {
		supportedDevices.push({
			vendorId,
			vendorName: vendor.name,
			productId,
			productName: product.name
		});
	});
});
store.dispatch(actions.setSupportedDevices(supportedDevices));

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
	store.dispatch(actions.selectDevice(selectedDeviceMetadata.keys));

	const PROGRAMMING_KEY_ID = activeDevice.interface.constructor.PROGRAMMING_KEY_ID;
	activeDevice.interface.on('down', keyId => {
		if (keyId === PROGRAMMING_KEY_ID) {
			return;
		}

		sendPressedKeysToMainWindow();

		const keyConfigs = store.getState().keyConfigs;
		if (!keyConfigs.has(keyId)) {
			log.debug(`Key #${keyId} has no config, ignoring procedure invocation request.`);
			return;
		}

		const keyConfig = keyConfigs.get(keyId);
		if (keyConfig.disabled) {
			log.debug(`Key #${keyId} is disabled, ignoring procedure invocation request.`);
			return;
		}

		if (!keyConfig.procedureName) {
			log.debug(`Key #${keyId} has no procedure, ignoring procedure invocation request.`);
			return;
		}

		if (keyIsOnCooldown(keyId)) {
			log.debug(`Key #${keyId} is on cooldown, ignoring procedure invocation request.`);
			return;
		}

		blockKey(keyId); // Block the key entirely until we know how this RPC attempt went.

		/* eslint-disable function-paren-newline */
		/* Ideally, we would use Promise.finally() to call `putKeyOnCooldown`.
		 * However, .finally just recently landed in V8, and is not available in Electron just yet.
		 * Once it is, we can remove this bluebird dependency and simplify this code.
		 * Until then, we use bluebird.resolve to roughly approximate the behavior of .finally. */
		BB.resolve(
			invokeKeyProcedure(keyId, keyConfig)
		).then(() => {
			putKeyOnCooldown(keyId);
		}).catch(() => {/* Ignore, logging is handled within invokeKeyProcedure */});
		/* eslint-enable function-paren-newline */
	});

	activeDevice.interface.on('up', keyIndex => {
		if (keyIndex === PROGRAMMING_KEY_ID) {
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

	const product = vendor.get(productId);
	if (!product) {
		return;
	}

	return {
		vendorName: vendor.name,
		...product
	};
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
