import * as Key from './key.js';
import Core from './core.js';
import InputField from './inputfield.js';

/**
 * Handling of options/configuration.
 */
class PathmarksOptions {

	constructor() {
		this.core = new Core();
	}

	start() {
		document.querySelector('.add')
			.addEventListener('click', () => this.addEntryFromInputFields());
		document.querySelector('.configarea')
			.addEventListener('keyup', () => PathmarksOptions.validateConfiguration());
		document.querySelector('.save')
			.addEventListener('click', () => this.saveConfiguration());
		document.querySelectorAll('.text')
			.forEach((text) => text.addEventListener('keyup', (event) => PathmarksOptions.addEntriesOnEnter(event, this)));
		this.loadConfiguration();
		this.createChromeExtensionsLink();
		PathmarksOptions.createHeaderVersion();
	}

	static setMessage(msg) {
		PathmarksOptions.changeMessage(msg);
	}

	static setErrorMessage(errorMsg) {
		PathmarksOptions.changeMessage(errorMsg, true);
	}

	static changeMessage(msg, isError = false) {
		const messageContainer = document.querySelector('.message');
		PathmarksOptions.changeClassState(messageContainer, 'error', isError);
		messageContainer.innerHTML = msg;
	}

	static validateConfiguration() {
		const configArea = new ConfigArea();
		if (!configArea.getValue()) {
			PathmarksOptions.setMessage('Please click on save to clear the configuration.');
			configArea.setValidState();
			return true;
		}
		try {
			JSON.parse(configArea.getValue());
			PathmarksOptions.setMessage('Please click on save to save the changed configuration.');
			configArea.setValidState();
			return true;
		} catch (e) {
			configArea.setInvalidState();
			PathmarksOptions.setErrorMessage(`Error: JSON configuration is not valid ${e}`);
			return false;
		}
	}

	saveConfiguration() {
		const configArea = new ConfigArea();
		if (!configArea.getValue()) {
			this.resetConfiguration();
			return;
		}
		try {
			JSON.parse(configArea.getValue());
		} catch (e) {
			configArea.setInvalidState();
			PathmarksOptions.setErrorMessage(`Error: Can not save illegal JSON configuration ${e}`);
			return;
		}
		this.core.useSetStorage(configArea.getValue(), () => {
			configArea.setSavedState();
			PathmarksOptions.setMessage('Configuration saved');
		});
	}

	resetConfiguration() {
		const configArea = new ConfigArea();
		configArea.reset();
		this.core.useSetStorage('', () => {
			PathmarksOptions.setMessage('Configuration cleared.');
		});
	}

	loadConfiguration() {
		this.core.useGetStorage(items => {
			if (items) {
				const configArea = new ConfigArea();
				configArea.setValue(items);
			}
		});
	}

	addEntryFromInputFields() {
		const titleField = new InputField('title');
		const valueField = new InputField('value');
		titleField.changeClassState();
		valueField.changeClassState();
		if (!titleField.getValue() || !valueField.getValue()) {
			return;
		}
		this.core.useGetStorage(items => {
			let configValues = [];
			if (items) {
				configValues = JSON.parse(items);
			}
			const newEntry = {
				title: titleField.getValue(),
				value: valueField.getValue()
			};
			configValues.push(newEntry);
			document.querySelector('.configarea').value = Core.serializeConfigValues(configValues);
			this.saveConfiguration();
			titleField.resetValue();
			valueField.resetValue();
		});
	}

	static changeClassState(elem, className, condition) {
		if (condition) {
			elem.classList.add(className);
		} else {
			elem.classList.remove(className);
		}
	}

	static addEntriesOnEnter(event, optionsObject) {
		if (event.key === Key.ENTER) {
			optionsObject.addEntryFromInputFields();
		}
	}

	createChromeExtensionsLink() {
		document.querySelector('.js-open-extensions-settings')
			.addEventListener('click', () => chrome.tabs.create({url: 'chrome://extensions'}));
	}

	static createHeaderVersion() {
		const manifest = chrome.runtime.getManifest();
		const dev = manifest.short_name === 'PathDev' ? ' DEV' : '';
		document.querySelector('.header-version')
			.innerHTML = `${manifest.version}${dev}`;
	}
}

class ConfigArea {

	constructor() {
		this.configArea = document.querySelector('.configarea');
	}

	getValue() {
		return this.configArea.value;
	}

	setValue(value) {
		this.configArea.value = value;
	}

	reset() {
		this.setValue('');
		this.setSavedState();
	}

	setValidState() {
		this.configArea.classList.remove('invalid')
	}

	setInvalidState() {
		this.configArea.classList.add('invalid')
	}

	setSavedState() {
		this.setValidState();
		this.configArea.classList.add('saved');
	}

}

document.addEventListener("DOMContentLoaded", () => {
	let options = new PathmarksOptions();
	options.start();
});
