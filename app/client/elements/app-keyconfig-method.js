/**
 * @customElement
 * @polymer
 */
class AppKeyconfigMethod extends Polymer.GestureEventListeners(Polymer.Element) {
	static get is() {
		return 'app-keyconfig-method';
	}

	static get properties() {
		return {
			selected: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			method: {
				type: Object
			}
		};
	}

	_emitSelect() {
		this.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: false
		}));
	}

	_calcFieldsHidden(method) {
		if (!method || !Array.isArray(method.fields)) {
			return true;
		}

		return method.fields.length <= 0;
	}
}

customElements.define(AppKeyconfigMethod.is, AppKeyconfigMethod);
