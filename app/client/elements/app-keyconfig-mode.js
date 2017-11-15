/**
 * @customElement
 * @polymer
 */
class AppKeyconfigMode extends Polymer.GestureEventListeners(Polymer.Element) {
	static get is() {
		return 'app-keyconfig-mode';
	}

	static get properties() {
		return {
			selected: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			label: String,
			options: {
				type: Array,
				value: false
			},
			allowCustomValue: {
				type: Boolean,
				value: false
			}
		};
	}

	emitSelect() {
		this.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: false
		}));
	}
}

customElements.define(AppKeyconfigMode.is, AppKeyconfigMode);
