/**
 * Handling of options/configuration.
 */
class PathmarksOptions {

	constructor() {
		this.core = new PathmarksCore();
	}

	start() {
		$('.configarea').on('keyup', () => {
			this.saveConfiguration();
		});
		$('.add').on('click', () => {
			this.addEntryFromInputFields();
		});
		$('.text').on('keyup', (event) => {
			PathmarksOptions.addEntriesOnEnter(event, this);
		});
		$('.header-version').html(chrome.runtime.getManifest().version);
		this.loadConfiguration();
		this.createChromeExtensionsLink();
	}

	static setMessage(msg) {
		const messageContainer = $('.message');
		messageContainer.removeClass('error');
		messageContainer.html(msg);
	}

	static setErrorMessage(errorMsg) {
		const messageContainer = $('.message');
		messageContainer.addClass('error');
		messageContainer.html(errorMsg);
	}

	saveConfiguration() {
		const jsonConfig = $('#jsonConfig').val();
		if (!jsonConfig) {
			this.resetConfiguration();
			return;
		}
		try {
			JSON.parse(jsonConfig);
		} catch (e) {
			$('.configarea').addClass('invalid');
			PathmarksOptions.setErrorMessage(`Error: Can not save illegal JSON configuration ${e}`);
			return;
		}
		this.core.useSetStorage(jsonConfig, () => {
			$('.configarea')
				.removeClass('invalid')
				.addClass('saved');
			PathmarksOptions.setMessage('Configuration saved');
		});
	}

	resetConfiguration() {
		$('#jsonConfig').val('');
		this.core.useSetStorage('', () => {
			PathmarksOptions.setMessage('Configuration cleared.');
		});
	}

	loadConfiguration() {
		this.core.useGetStorage(function (items) {
			if (items) {
				$('#jsonConfig').val(items);
			}
		});
	}

	addEntryFromInputFields() {
		const titleField = $('input[name=title]');
		const valueField = $('input[name=value]');
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
			$('.configarea').val(PathmarksCore.serializeConfigValues(configValues));
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
		$('.js-open-extensions-settings').on('click', function () {
			chrome.tabs.create({url: 'chrome://extensions'});
		});
	}

}

$().ready(function () {
	let options = new PathmarksOptions();
	options.start();
});
