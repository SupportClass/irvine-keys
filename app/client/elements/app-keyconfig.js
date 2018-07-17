(function () {
	'use strict';

	const {ipcRenderer} = require('electron');

	/**
	 * @customElement
	 * @polymer
	 */
	class AppKeyconfig extends window.ReduxMixin(Polymer.Element) {
		static get is() {
			return 'app-keyconfig';
		}

		static get properties() {
			return {
				selectedKeys: Array,
				availableMethods: {
					statePath(state) {
						if (!state.protocol || !state.protocol.serviceSummary) {
							return [];
						}

						return state.protocol.serviceSummary.availableProcedures;
					}
				}
			};
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
