'use strict';

// Native
const fs = require('fs');

module.exports = {
	save(filePath, state) {
		return fs.writeFileSync(filePath, JSON.stringify({
			protocol: state.protocol,
			keyMerges: state.keyMerges,
			keyConfigs: state.keyConfigs
		}, null, 2), 'utf-8');
	},
	load(filePath, currentState) {
		const loadedState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
		return {
			...currentState,
			loadedState
		};
	}
};
