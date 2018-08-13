/**
 * Handling of options/configuration.
 */
class PathmarksOptions {

	constructor() {
		this.core = new PathmarksCore();
	}

	start() {
		jQuery('.configarea').on('keyup', () => {
			this.saveConfiguration();
		});
		jQuery('.add').on('click', () => {
			this.addEntryFromInputFields();
		});
		jQuery('.text').on('keyup', (event) => {
			PathmarksOptions.addEntriesOnEnter(event, this);
		});
		jQuery('.header-version').html(chrome.runtime.getManifest().version);
		this.loadConfiguration();
		this.createChromeExtensionsLink();
	}

	static setMessage(msg) {
		const messageContainer = jQuery('.message');
		messageContainer.removeClass('error');
		messageContainer.html(msg);
	}

	static setErrorMessage(errorMsg) {
		const messageContainer = jQuery('.message');
		messageContainer.addClass('error');
		messageContainer.html(errorMsg);
	}

	saveConfiguration() {
		const jsonConfig = jQuery('#jsonConfig').val();
		if (!jsonConfig) {
			this.resetConfiguration();
			return;
		}
		try {
			JSON.parse(jsonConfig);
		} catch (e) {
			jQuery('.configarea').addClass('invalid');
			PathmarksOptions.setErrorMessage(`Error: Can not save illegal JSON configuration ${e}`);
			return;
		}
		this.core.useSetStorage(jsonConfig, () => {
			jQuery('.configarea')
				.removeClass('invalid')
				.addClass('saved');
			PathmarksOptions.setMessage('Configuration saved');
		});
	}

	resetConfiguration() {
		jQuery('#jsonConfig').val('');
		this.core.useSetStorage('', () => {
			PathmarksOptions.setMessage('Configuration cleared.');
		});
	}

	loadConfiguration() {
		this.core.useGetStorage(function (items) {
			if (items) {
				jQuery('#jsonConfig').val(items);
			}
		});
	}

	addEntryFromInputFields() {
		const titleField = jQuery('input[name=title]');
		const valueField = jQuery('input[name=value]');
		const title = titleField.val();
		const value = valueField.val();
		if (!title) {
			titleField.addClass('invalid');
		} else {
			titleField.removeClass('invalid');
		}
		if (!value) {
			valueField.addClass('invalid');
		} else {
			valueField.removeClass('invalid');
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
			jQuery('.configarea').val(PathmarksCore.serializeConfigValues(configValues));
			this.saveConfiguration();
			titleField.val('');
			valueField.val('');
		});
	}

	static addEntriesOnEnter(event, optionsObject) {
		if (event.which === 13) {
			optionsObject.addEntryFromInputFields();
		}
	}

	createChromeExtensionsLink() {
		jQuery('.js-open-extensions-settings').on('click', function () {
			chrome.tabs.create({url: 'chrome://extensions'});
		});
	}

}

jQuery().ready(function () {
	let options = new PathmarksOptions();
	options.start();
});
