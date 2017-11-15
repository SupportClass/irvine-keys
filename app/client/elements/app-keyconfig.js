(function () {
	'use strict';

	const {ipcRenderer} = require('electron');

	/**
	 * @customElement
	 * @polymer
	 */
	class AppKeyconfig extends Polymer.Element {
		static get is() {
			return 'app-keyconfig';
		}

		static get properties() {
			return {
				selectedKeys: Array,
				availableScenes: Array,
				availableMethods: Array
			};
		}

		ready() {
			super.ready();

			this.availableMethods = ipcRenderer.sendSync('nodecg:getAvailableMethodsSync');
			this.availableScenes = ipcRenderer.sendSync('nodecg:getAvailableScenesSync');

			ipcRenderer.on('availableMethodsChanged', availableMethods => {
				this.availableMethods = availableMethods;
			});

			ipcRenderer.on('availableScenesChanged', availableScenes => {
				this.availableScenes = availableScenes;
			});
		}

		raiseUngroupButton() {
			this.$.ungroup.raised = true;
		}

		lowerUngroupButton() {
			this.$.ungroup.raised = false;
		}

		ungroup() {
			console.log('ungroup method not yet implemented');
		}

		_computeSelectedKeyLabel(selectedKeys) {
			if (selectedKeys.length === 0) {
				return 'None';
			}

			if (selectedKeys.length === 1) {
				return `Key #${selectedKeys[0].index + 1}`;
			}

			return `${selectedKeys.length} Keys`;
		}
	}

	customElements.define(AppKeyconfig.is, AppKeyconfig);
})();
