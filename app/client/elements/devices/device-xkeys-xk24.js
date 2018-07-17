(function () {
	'use strict';

	/**
	 * @customElement
	 * @polymer
	 */
	class DeviceXkeysXK24 extends window.ReduxMixin(Polymer.Element) {
		static get is() {
			return 'device-xkeys-xk24';
		}

		static get properties() {
			return {
				deviceName: {
					type: String,
					value: 'X-keys XK-24',
					reflectToAttribute: true
				},
				keyConfigs: {
					type: Array,
					statePath: 'keyConfigs'
				},
				selectedKeyIds: {
					type: Array,
					notify: true,
					computed: '_computeSelectedKeyIds(_selectedKeyElements)'
				},

				// Internal state
				_selectedKeyElements: {
					type: Array
				}
			};
		}

		_mapKeyConfigs(keyConfigs) {
			if (!Array.isArray(keyConfigs)) {
				return [];
			}

			return keyConfigs.map(keyConfig => {
				return {
					...keyConfig,
					gridX: Math.floor(keyConfig.id / 8),
					gridY: keyConfig.id % 8,
					gridWidth: 1,
					gridHeight: 1
				};
			});
		}

		_computeSelectedKeyIds(_selectedKeyElements) {
			if (!Array.isArray(_selectedKeyElements)) {
				return [];
			}

			return _selectedKeyElements.map(keyElement => {
				return keyElement.keyId;
			});
		}
	}

	customElements.define(DeviceXkeysXK24.is, DeviceXkeysXK24);
})();
