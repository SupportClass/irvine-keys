'use strict';

const KEY_COOLDOWN_DURATION = 50; // Duration (in ms) before a key can be used again after being pressed.

// Packages
const BB = require('bluebird'); // TODO: Remove once Electron uses V8 v6.3.165+, which natively adds Promise.finally()
const debounce = require('lodash.debounce');
const log = require('electron-log');

// Ours
const appActions = require('./store/app-reducer').actions;
const Device = require('./classes/device');
const keyStatesActions = require('./keyStates/keyStates-reducer').actions;
const store = require('./store');
const StreamDeckInterface = require('./classes/device-interfaces/stream-deck');
const XkeysInterface = require('./classes/device-interfaces/xkeys');
const {sendToMainWindow, performRpc, references} = require('./util');
require('./available-devices');

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
				keyIds: [
					'0', '8', '16', '24',
					'1', '9', '17', '25',
					'2', '10', '18', '26',
					'3', '11', '19', '27',
					'4', '12', '20', '28',
					'5', '13', '21', '29'
				],
				supportsKeyMerging: true,
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
vendors.forEach((vendor, vendorId) => {
	vendor.products.forEach((product, productId) => {
		supportedDevices.push({
			vendorId,
			vendorName: vendor.name,
			productId,
			productName: product.name,
			usage: product.usage
		});
	});
});

store.dispatch(appActions.setSupportedDevices(supportedDevices));

store.subscribe(handleChange);

function select(state) {
	return state.desiredDeviceType;
}

let currentValue;
function handleChange() {
	const previousValue = currentValue;
	currentValue = select(store.getState());

	if (previousValue !== currentValue) {
		selectNewDesiredDevice(currentValue);
	}
}

const sendPressedKeysToMainWindow = debounce(() => {
	sendToMainWindow(
		'xkeys:pressedKeys',
		activeDevice ?
			activeDevice.interface.getPressedKeys() :
			[]
	);
}, 10);

function selectNewDesiredDevice({vendorId, productId, usage}) {
	if (!vendorId || !productId || !usage) {
		return;
	}

	const device = store.getState().detectedDevices.find(device => {
		return device.vendorId === vendorId &&
			device.productId === productId &&
			device.usage === usage;
	});
	if (!device) {
		return;
	}

	const devicePath = device.path;
	if (!devicePath) {
		return;
	}

	selectNewDevice({devicePath, vendorId, productId});
}

function selectNewDevice({devicePath, vendorId, productId}) {
	if (activeDevice) {
		activeDevice.destroy();
		activeDevice = null;
	}

	const selectedDeviceMetadata = lookupDeviceMetadata({vendorId, productId});
	try {
		activeDevice = new Device(devicePath, selectedDeviceMetadata);
		store.dispatch(appActions.selectDevice(selectedDeviceMetadata));
	} catch (error) {
		log.error(error);
		store.dispatch(appActions.openDeviceError(error));
		return;
	}

	const PROGRAMMING_KEY_ID = activeDevice.interface.constructor.PROGRAMMING_KEY_ID;
	activeDevice.interface.on('keyPressed', keyId => {
		if (keyId === PROGRAMMING_KEY_ID) {
			references.mainWindow.focus();
			return;
		}

		const state = store.getState();
		const merge = state.keyMerges.find(merge => merge.keyIds.includes(keyId));
		if (merge) {
			log.debug(`Key "${keyId}" pressed, and is part of a merge:`, merge);
			keyId = merge.rootKeyId;
		}

		sendPressedKeysToMainWindow(); // TODO: This doesn't handle merges right.

		let keyConfig = state.keyConfigs.find(kc => kc.id === keyId);

		// @TODO: remove this debug testing code
		keyConfig = {
			disabled: false,
			procedureName: 'getScenes'
		};

		if (!keyConfig) {
			log.debug(`Key "${keyId}" has no config, ignoring procedure invocation request.`);
			return;
		}

		if (keyConfig.disabled) {
			log.debug(`Key "${keyId}" is disabled, ignoring procedure invocation request.`);
			return;
		}

		if (!keyConfig.procedureName) {
			log.debug(`Key "${keyId}" has no procedure, ignoring procedure invocation request.`);
			return;
		}

		if (keyIsOnCooldown(keyId)) {
			log.debug(`Key "${keyId}" is on cooldown, ignoring procedure invocation request.`);
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

	activeDevice.interface.on('keyReleased', keyId => {
		if (keyId === PROGRAMMING_KEY_ID) {
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

	return vendor.products.get(productId);
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
	activeDevice.interface.procedureInvoked(keyId);

	return new Promise((resolve, reject) => {
		try {
			performRpc(keyConfig.procedureName, keyConfig.procedureArguments)
				.then((...responseArgs) => {
					log.debug(`Call #${callNumber} succeeded, response:`, responseArgs);
					resolve(...responseArgs);
					activeDevice.interface.procedureCompleted(keyId, true);
				})
				.catch(error => {
					log.error(`Call #${callNumber} failed, error:`, error);
					reject(error);
					activeDevice.interface.procedureCompleted(keyId, false);
				});
		} catch (error) {
			log.error(`Failed to invoke RPC #${callNumber}:`, error);
			reject(error);
			activeDevice.interface.procedureCompleted(keyId, false);
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
	store.dispatch(keyStatesActions.putKeyOnCooldown(keyId, expirationTimestamp));
	cooldownTimeouts.set(keyId, setTimeout(() => {
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
	const keyState = store.getState().keyStates.find(({id}) => id === keyId);
	if (!keyState) {
		return false;
	}
	return keyState.blocked || keyState.coolingDown;
}

module.exports = {
	selectNewDesiredDevice,
	selectNewDevice,
	lookupDeviceMetadata
};
