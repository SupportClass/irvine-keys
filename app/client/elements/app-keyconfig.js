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
			availableScenes: {
				type: Array,
				value: ['Scene 1', 'Scene 2', 'Scene 3']
			},
			availableMethods: {
				type: Array,
				value: ['Method 1', 'Method 2', 'Method 3']
			}
		};
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
