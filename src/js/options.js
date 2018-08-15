/**
 * Handling of options/configuration.
 */
class PathmarksOptions {

	constructor() {
		this.core = new PathmarksCore();
	}

	start() {
		document.querySelector('.configarea')
			.addEventListener('keyup', () => this.saveConfiguration());
		document.querySelector('.add')
			.addEventListener('click', () => this.addEntryFromInputFields());
		document.querySelector('.text')
			.addEventListener('keyup', (event) => PathmarksOptions.addEntriesOnEnter(event, this));
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

	saveConfiguration() {
		const jsonConfig = document.querySelector('#jsonConfig').value;
		if (!jsonConfig) {
			this.resetConfiguration();
			return;
		}
		const configArea = document.querySelector('.configarea');
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
		document.querySelector('#jsonConfig').value = '';
		this.core.useSetStorage('', () => {
			PathmarksOptions.setMessage('Configuration cleared.');
		});
	}

	loadConfiguration() {
		this.core.useGetStorage(function loadItemsToTextarea(items) {
			if (items) {
				document.querySelector('#jsonConfig').value = items;
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
		if (event.which === 13) {
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
