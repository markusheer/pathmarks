/**
 * Base for the popup of the chrome extension.
 */
class PathmarksPopUp {

	static get KEY_DOWN() {
		return 40;
	};

	static get KEY_ENTER() {
		return 13;
	};

	static get KEY_UP() {
		return 38;
	};

	constructor() {
		this.core = new PathmarksCore();
	}

	start() {
		this.showBaseUrl();
		this.showAddPathmark();
		this.showOpenOptionPage();
		this.createCloseFormButton();
		this.loadConfiguration();
		this.loadKeyNavigation();
		this.loadSortable();
	}

	static createVirtualLink(url) {
		const virtualLink = document.createElement('a');
		virtualLink.href = url;
		return virtualLink;
	}

	static getHostAndPort(url) {
		const virtualLink = PathmarksPopUp.createVirtualLink(url);
		const port = virtualLink.port ? `:${virtualLink.port}` : '';
		return `${virtualLink.protocol}//${virtualLink.hostname}${port}`;
	}

	static getPathQueryAndFragmentFromUrl(url) {
		const virtualLink = PathmarksPopUp.createVirtualLink(url);
		const fragment = virtualLink.hash ? virtualLink.hash : '';
		const query = virtualLink.search ? virtualLink.search : '';
		const path = virtualLink.pathname ? virtualLink.pathname : '';
		return `${path}${query}${fragment}`;
	}

	changeUrls(urlTarget, setNewTabActive) {
		this.executeFunctionOnActiveTab((tab) => {
			const targetForTab = PathmarksPopUp.getHostAndPort(tab.url) + urlTarget;
			const targetIndex = tab.index + 1;
			this.openOrSelectTab(targetForTab, setNewTabActive, targetIndex);
		});
	}

	openOrSelectTab(tabUrl, setNewTabActive, tabIndex) {
		chrome.tabs.query({url: tabUrl}, function (tabs) {
			if (tabs.length) {
				chrome.tabs.update(tabs[0].id, {active: setNewTabActive});
			} else {
				chrome.tabs.create({index: tabIndex, url: tabUrl, active: setNewTabActive});
			}
		});
	}

	loadConfiguration() {
		this.core.useGetStorage((items) => {
			if (items) {
				const configs = JSON.parse(items);
				if (configs.length < 1) {
					return this.showNoPathsMessage();
				}
				const urls = document.querySelector('.urls');
				urls.innerHTML = '';
				configs.forEach((entry) => {
					const url = document.createElement('div');
					url.classList.add('url');
					url.setAttribute('data-path', entry.value);
					url.innerHTML = '<div class="move-icon icon-default material-icons" aria-hidden="true">reorder</div>' + entry.title + '<span class="path">' + entry.value + '</span>';
					url.addEventListener('click', (event) => {
						const targetPath = event.currentTarget.getAttribute('data-path');
						this.changeUrls(targetPath, !event.shiftKey);
					});
					url.appendChild(this.createRemoveButton());
					urls.appendChild(url);
				});
			} else {
				this.showNoPathsMessage();
			}
		});
	}

	showNoPathsMessage() {
		document.querySelector('.urls').innerHTML = '<div class="no-paths-message"><div>Welcome to pathmarks.</div><div>No paths are configured, use the <span class="options">Options</span> page of this extension to configure paths or add paths with the path icon.</div></div>';
		document.querySelector('.options')
			.addEventListener('click', () => this.openOptionsPage());
	}

	createCloseFormButton() {
		document.querySelector('.js-form-close')
			.addEventListener('click', () => document.querySelector('.add-form').style.display = 'none');
	}

	createRemoveButton() {
		const removeButton = document.createElement('div');
		removeButton.classList.add('remove-entry');
		removeButton.setAttribute('title', 'Remove this entry');

		const removeIcon = document.createElement('div');
		removeIcon.classList.add('remove-icon', 'icon-default', 'material-icons');
		removeIcon.innerText = 'remove';
		removeButton.appendChild(removeIcon);
		removeButton.addEventListener('click', (event) => {
			this.createRemoveConfirmButtons(event.currentTarget);
			event.stopPropagation();
		});

		return removeButton;
	}

	createRemoveConfirmButtons(clickedElement) {
		const removeEntry = clickedElement;
		removeEntry.innerHTML = '';

		const removeYes = document.createElement('div');
		removeYes.classList.add('remove-yes');
		removeYes.innerText = 'Yes';
		removeYes.addEventListener('click', () => {
			this.removePathmark(removeEntry.closest('.url'));
			event.stopPropagation();
		});
		removeEntry.appendChild(removeYes);

		const removeNo = document.createElement('div');
		removeNo.classList.add('remove-no');
		removeNo.innerText = 'No';
		removeNo.addEventListener('click', () => {
			const entryDiv = removeEntry.closest('.url');
			removeEntry.remove();
			entryDiv.appendChild(this.createRemoveButton());
			event.stopPropagation();
		});
		removeEntry.appendChild(removeNo);
	}

	removePathmark(pathmarkEntry) {
		const path = pathmarkEntry.getAttribute('data-path');
		this.core.useGetStorage((items) => {
			let configValues = [];
			if (items) {
				configValues = JSON.parse(items);
			}
			for (let idx = configValues.length - 1; idx >= 0; idx--) {
				if (configValues[idx].value === path) configValues.splice(idx, 1);
			}
			const jsonConfig = PathmarksCore.serializeConfigValues(configValues);
			this.core.useSetStorage(jsonConfig, () => {
				this.start();
				this.refreshOptionsPage();
			});
		});
	}

	executeFunctionOnActiveTab(callback) {
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			tabs.forEach((tab) => callback(tab));
		});
	}

	showBaseUrl() {
		this.executeFunctionOnActiveTab((tab) => {
			document.querySelector('.baseurl').innerHTML = PathmarksPopUp.getHostAndPort(tab.url);
		});
	}

	showOpenOptionPage() {
		document.querySelector('.option-page')
			.addEventListener('click', () => this.openOptionsPage());
	}

	showAddPathmark() {
		this.executeFunctionOnActiveTab((tab) => {
			const tabTitle = tab.title;
			const pathQueryAndFragment = PathmarksPopUp.getPathQueryAndFragmentFromUrl(tab.url);
			const addPath = document.querySelector('.add-path');
			if (pathQueryAndFragment === '/') {
				addPath.style.display = 'none';
				return;
			}
			addPath.setAttribute('title', pathQueryAndFragment);
			addPath.addEventListener('click', () => {
				this.addCurrentPath(this, tabTitle, pathQueryAndFragment);
			});
		});
	}

	addCurrentPath(popupObject, tabTitle, pathQueryAndFragment) {
		const titleField = document.querySelector('input[name=title]');
		titleField.value = tabTitle;
		const valueField = document.querySelector('input[name=value]');
		valueField.value = pathQueryAndFragment;
		document.querySelector('.add').addEventListener('click', () => {
			popupObject.addEntryFromInputFields();
		});
		document.querySelector('.add-input-text').addEventListener('keyup', (event) => {
			if (event.which === PathmarksPopUp.KEY_ENTER) {
				document.querySelector('.add').click();
			}
		});
		document.querySelector('.add-form').style.display = 'block';
	}

	addEntryFromInputFields() {
		const selectorTitle = 'input[name=title]';
		const selectorValue = 'input[name=value]';
		const title = PathmarksPopUp.getValueFromInputAndCheckRequired(selectorTitle);
		const value = PathmarksPopUp.getValueFromInputAndCheckRequired(selectorValue);
		if (!title || !value) {
			return;
		}
		this.core.useGetStorage((items) => {
			let configValues = [];
			if (items) {
				configValues = JSON.parse(items);
			}
			const newEntry = {'title': title, 'value': value};
			configValues.push(newEntry);
			const jsonConfig = PathmarksCore.serializeConfigValues(configValues);
			this.core.useSetStorage(jsonConfig, () => {
				PathmarksPopUp.resetInputField(selectorTitle);
				PathmarksPopUp.resetInputField(selectorValue);
				document.querySelector('.add-form').style.display = 'none';
				this.start();
				this.refreshOptionsPage();
			});
		});
	}

	loadKeyNavigation() {
		document.documentElement.addEventListener('keyup', (event) => {
			if (PathmarksPopUp.isPathmarksEmpty()) {
				return;
			}
			if (event.which === PathmarksPopUp.KEY_ENTER) {
				const clickEvent = new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
					view: window,
					shiftKey: event.shiftKey
				});
				document.querySelector('.selected').dispatchEvent(clickEvent);
				return;
			}
			if (event.which === PathmarksPopUp.KEY_UP || event.which === PathmarksPopUp.KEY_DOWN) {
				if (PathmarksPopUp.isNonePathmarkSelected()) {
					document.querySelector('.url:first-child').classList.add('selected');
					return;
				}
			}
			if (event.which === PathmarksPopUp.KEY_DOWN) {
				return PathmarksPopUp.navigateKeyDown();
			}
			if (event.which === PathmarksPopUp.KEY_UP) {
				return PathmarksPopUp.navigateKeyUp();
			}
		});
	}

	static isPathmarksEmpty() {
		return document.querySelectorAll('.url').length === 0;
	}

	static isNonePathmarkSelected() {
		return document.querySelectorAll('.selected').length === 0;
	}

	static navigateKeyDown() {
		const selectedUrl = document.querySelector('.selected');
		selectedUrl.classList.remove('selected');
		const nextUrl = selectedUrl.nextSibling;
		if (!nextUrl) {
			document.querySelector('.url:first-child').classList.add('selected');
			return;
		}
		nextUrl.classList.add('selected');
	}

	static navigateKeyUp() {
		const selectedUrl = document.querySelector('.selected');
		selectedUrl.classList.remove('selected');
		const previousUrl = selectedUrl.previousSibling;
		if (!previousUrl) {
			document.querySelector('.url:last-child').classList.add('selected');
			return;
		}
		previousUrl.classList.add('selected');
	}

	openOptionsPage() {
		const optionsUrl = PathmarksPopUp.getOptionsUrl();
		this.openOrSelectTab(optionsUrl, true);
	}

	refreshTab(tabUrl) {
		chrome.tabs.query({url: tabUrl}, function (tabs) {
			if (tabs.length) {
				chrome.tabs.reload(tabs[0].id);
			}
		});
	}

	refreshOptionsPage() {
		const optionsUrl = PathmarksPopUp.getOptionsUrl();
		this.refreshTab(optionsUrl);
	}

	static getOptionsUrl() {
		return chrome.extension.getURL('/html/options.html');
	}

	loadSortable() {
		Sortable.create(document.querySelector('.urls'), {
			onEnd: () => this.resortPathmarks()
		});
	}

	resortPathmarks() {
		const viewWithPaths = PathmarksPopUp.createPathmarksFromHtml();
		this.core.useGetStorage((items) => {
			let configValues = [];
			if (items) {
				configValues = JSON.parse(items);
			}
			if (configValues.length !== viewWithPaths.length) {
				console.error('Unexpected behaviour, re-sort aborted');
				return;
			}
			const sortedConfigValues = [];
			viewWithPaths.forEach((path, sortIndex) => {
				configValues.forEach((savedPathmark) => {
					if (savedPathmark.value === path) {
						sortedConfigValues[sortIndex] = savedPathmark;
					}
				});
			});
			const jsonConfig = PathmarksCore.serializeConfigValues(sortedConfigValues);
			this.core.useSetStorage(jsonConfig, () => {
				this.start();
				this.refreshOptionsPage();
			});
		});
	}

	static createPathmarksFromHtml() {
		return Array.from(document.querySelectorAll('.url')).map((elem) => {
			return elem.getAttribute('data-path');
		});
	}

	static checkInputRequiredState(inputField) {
		if (!inputField.required) {
			return;
		}
		if (!inputField.value) {
			inputField.classList.add('invalid');
		} else {
			inputField.classList.remove('invalid');
		}
	}

	static getValueFromInputAndCheckRequired(selector) {
		const inputField = document.querySelector(selector);
		PathmarksPopUp.checkInputRequiredState(inputField);
		return inputField.value;
	}

	static resetInputField(selector) {
		document.querySelector(selector).value = '';
	}

}

document.addEventListener("DOMContentLoaded", () => {
	const popup = new PathmarksPopUp();
	popup.start();
});
