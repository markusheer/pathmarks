/**
 * Handling of options/configuration.
 */
class PathmarksOptions {

	static get KEY_ENTER() {
		return 13;
	};

	constructor() {
		this.core = new PathmarksCore();
	}

	start() {
		document.querySelector('.add')
			.addEventListener('click', () => this.addEntryFromInputFields());
		document.querySelector('.configarea')
			.addEventListener('keyup', () => this.validateConfiguration());
		document.querySelector('.save')
			.addEventListener('click', () => this.saveConfiguration());
		document.querySelectorAll('.text')
			.forEach((text) => text.addEventListener('keyup', (event) => PathmarksOptions.addEntriesOnEnter(event, this)));
		document.querySelector('.header-version')
			.innerHTML = chrome.runtime.getManifest().version;
		this.loadConfiguration();
		this.createChromeExtensionsLink();
	}

	static setMessage(msg) {
		const messageContainer = document.querySelector('.message');
		messageContainer.classList.remove('error');
		messageContainer.innerHTML = msg;
	}

	static setErrorMessage(errorMsg) {
		const messageContainer = document.querySelector('.message');
		messageContainer.classList.add('error');
		messageContainer.innerHTML = errorMsg;
	}

	validateConfiguration() {
		const configArea = document.querySelector('.configarea');
		const jsonConfig = configArea.value;
		if (!jsonConfig) {
			PathmarksOptions.setMessage('Please click on save to clear the configuration.');
		 	return true;
		}
		try {
			JSON.parse(jsonConfig);
			PathmarksOptions.setMessage('Please click on save to save the changed configuration.');
			return true;
		} catch (e) {
			configArea.classList.add('invalid');
			PathmarksOptions.setErrorMessage(`Error: JSON configuration is not valid ${e}`);
			return false;
		}
	}

	saveConfiguration() {
		const configArea = document.querySelector('.configarea');
		const jsonConfig = configArea.value;
		if (!jsonConfig) {
			this.resetConfiguration();
			return;
		}
		try {
			JSON.parse(jsonConfig);
		} catch (e) {
			configArea.classList.add('invalid');
			PathmarksOptions.setErrorMessage(`Error: Can not save illegal JSON configuration ${e}`);
			return;
		}
		this.core.useSetStorage(jsonConfig, () => {
			configArea.classList.remove('invalid');
			configArea.classList.add("saved");
			PathmarksOptions.setMessage('Configuration saved');
		});
	}

	resetConfiguration() {
		const configArea = document.querySelector('.configarea');
		configArea.value = '';
		configArea.classList.remove('invalid');
		configArea.classList.add("saved");
		this.core.useSetStorage('', () => {
			PathmarksOptions.setMessage('Configuration cleared.');
		});
	}

	loadConfiguration() {
		this.core.useGetStorage(function loadItemsToTextarea(items) {
			if (items) {
				document.querySelector('.configarea').value = items;
			}
		});
	}

	addEntryFromInputFields() {
		const titleField = document.querySelector('input[name=title]');
		const valueField = document.querySelector('input[name=value]');
		const title = titleField.value;
		const value = valueField.value;
		if (!title) {
			titleField.classList.add('invalid');
		} else {
			titleField.classList.remove('invalid');
		}
		if (!value) {
			valueField.classList.add('invalid');
		} else {
			valueField.classList.remove('invalid');
		}
		if (!title || !value) {
			return;
		}
		this.core.useGetStorage((items) => {
			let configValues = [];
			if (items) {
				configValues = JSON.parse(items);
			}
			const newEntry = {title: title, value: value};
			configValues.push(newEntry);
			document.querySelector('.configarea').value = PathmarksCore.serializeConfigValues(configValues);
			this.saveConfiguration();
			titleField.value = '';
			valueField.value = '';
		});
	}

	static addEntriesOnEnter(event, optionsObject) {
		if (event.which === PathmarksOptions.KEY_ENTER) {
			optionsObject.addEntryFromInputFields();
		}
	}

	createChromeExtensionsLink() {
		document.querySelector('.js-open-extensions-settings')
			.addEventListener('click', () => chrome.tabs.create({url: 'chrome://extensions'}));
	}

}

document.addEventListener("DOMContentLoaded", () => {
	let options = new PathmarksOptions();
	options.start();
});
