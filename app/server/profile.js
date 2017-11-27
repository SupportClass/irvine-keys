'use strict';

// Native
const fs = require('fs');
const util = require('util');

// Packages
const semver = require('semver');

const CURRENT_VERSION = require('../package.json').version;
const CURRENT_MAJOR_VERSION = semver.major(CURRENT_VERSION);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

module.exports = {
	/**
	 * Saves the provided state to disk.
	 * Filters the state to save only the relevant keys.
	 * @param filePath {String} - The filepath to save to.
	 * @param state {Object} - The Redux state to save.
	 * @returns {Promise.<*>}
	 */
	async save(filePath, state) {
		return writeFile(filePath, JSON.stringify({
			appVersion: CURRENT_VERSION,
			protocol: state.protocol,
			keyConfigs: state.keyConfigs,
			keyMerges: state.keyMerges
		}, null, 2), 'utf-8');
	},

	/**
	 * Loads state from disk.
	 * Filters the loaded state to only load the relevant keys.
	 * Errors if the profile being loaded was made with a different major version of the app.
	 * @param filePath {String} - The filepath to load from.
	 * @param currentState {Object} - The current state, which the loaded state will be merged into.
	 * @returns {Promise.<Object>}
	 */
	async load(filePath, currentState) {
		const file = await readFile(filePath, 'utf-8');
		const loadedState = JSON.parse(file);
		if (!{}.hasOwnProperty.call(loadedState, 'appVersion')) {
			throw new Error('Profile cannot be loaded, as it is missing the "appVersion" key.');
		}

		if (!semver.valid(loadedState.appVersion)) {
			throw new Error('Profile cannot be loaded, as its appVersion is not valid semver.');
		}

		const compatible = CURRENT_MAJOR_VERSION === semver.major(loadedState.appVersion);
		if (!compatible) {
			throw new Error('Profile cannot be loaded, as it was made with a different major version ' +
				`(profile version: ${loadedState.appVersion}, app version: ${CURRENT_VERSION}.`);
		}

		return {
			...currentState,
			...loadedState
		};
	}
};
