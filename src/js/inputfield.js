/**
 * Represents and input field.
 */
export default class InputField {

	constructor(fieldName) {
		this.inputField = document.querySelector(`input[name=${fieldName}]`);
	}

	getValue() {
		return this.inputField.value;
	}

	setValue(value) {
		this.inputField.value = value;
	}

	resetValue() {
		this.setValue('');
	}

	changeClassState() {
		if (!this.getValue()) {
			this.inputField.classList.add('invalid');
		} else {
			this.inputField.classList.remove('invalid');
		}
	}

	isRequired() {
		return this.inputField.required;
	}

}
