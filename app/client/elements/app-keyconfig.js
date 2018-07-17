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

			//this.availableMethods = ipcRenderer.sendSync('nodecg:getAvailableMethodsSync');
			//this.availableScenes = ipcRenderer.sendSync('nodecg:getAvailableScenesSync');
			this.availableMethods = [];
			this.availableScenes = [];

			ipcRenderer.on('availableMethodsChanged', availableMethods => {
				this.availableMethods = availableMethods;
			});

			ipcRenderer.on('availableScenesChanged', availableScenes => {
				this.availableScenes = availableScenes;
			});
		}

		raiseButton(e) {
			e.target.raised = true;
		}

		lowerButton(e) {
			e.target.raised = false;
		}

		ungroup() {
			console.log('ungroup method not yet implemented');
		}

		group() {
			this.dispatchEvent(new CustomEvent('group-keys', {
				detail: {
					keys: this.selectedKeys
				},
				bubbles: false,
				composed: false
			}));
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

		_areMultipleKeysSelected(selectedKeys) {
			return selectedKeys && selectedKeys.length > 1;
		}

		_formatSelectedKeys(selectedKeys) {
			if (selectedKeys && selectedKeys.length > 0) {
				return selectedKeys.map(k => k.index + 1).join(', ');
			}

			return 'No keys selected.';
		}

		_isGroupRectangular(selectedKeys) {

		}
	}

	customElements.define(AppKeyconfig.is, AppKeyconfig);
})();
