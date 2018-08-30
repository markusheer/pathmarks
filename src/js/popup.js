import * as Key from './key.js';
import Core from './core.js';
import * as SortableModule from '/lib/Sortable.js';
import InputField from './inputfield.js';

/**
 * Base for the popup of the chrome extension.
 */
class PathmarksPopUp {

	constructor() {
		this.core = new Core();
	}

	start() {
		PathmarksPopUp.connectAndSetActiveIcon();
		this.showBaseUrl();
		this.showAddPathmark();
		this.showOpenOptionPage();
		this.createCloseFormButton();
		this.loadConfiguration();
		this.loadKeyNavigation();
		this.loadSortable();
	}

	static connectAndSetActiveIcon() {
		chrome.runtime.connect();
		chrome.browserAction.setIcon({path: '../images/icon-active-38.png'});
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
					const url = PathmarksPopUp.templateContent('template-url', 'url');
					url.setAttribute('data-path', entry.value);
					url.querySelector('.title').innerHTML = entry.title;
					url.querySelector('.path').innerHTML = entry.value;
					url.addEventListener('click', (event) => {
						this.changeUrls(PathmarksPopUp.getTargetPath(event), !event.shiftKey);
					});
					url.querySelector('.remove-entry').addEventListener('click', (event) => {
						this.createRemoveConfirmButtons(event.currentTarget);
						event.stopPropagation();
					});
					urls.appendChild(url);
				});
			} else {
				this.showNoPathsMessage();
			}
		});
	}

	static getTargetPath(event) {
		return event.currentTarget.getAttribute('data-path');
	}

	showNoPathsMessage() {
		const configEmpty = PathmarksPopUp.templateContent('template-config-empty', 'no-paths-message');
		configEmpty.querySelector('.options')
			.addEventListener('click', () => this.openOptionsPage());
		document.querySelector('.urls').appendChild(configEmpty);
	}

	static templateContent(templateId, className) {
		return document.importNode(document.getElementById(templateId).content, true).querySelector(`.${className}`);
	}

	createCloseFormButton() {
		document.querySelector('.js-form-close')
			.addEventListener('click', () => document.querySelector('.add-form').style.display = 'none');
	}

	createRemoveConfirmButtons(clickedElement) {
		const removeEntry = clickedElement;
		const removeButton = removeEntry.querySelector('.remove-icon');
		removeButton.style.display = 'none';

		const removeYes = removeEntry.querySelector('.remove-yes');
		removeYes.addEventListener('click', () => {
			this.removePathmark(removeEntry.closest('.url'));
			event.stopPropagation();
		});
		const removeNo = removeEntry.querySelector('.remove-no');
		removeNo.addEventListener('click', () => {
			removeButton.style.display = 'block';
			removeYes.style.display = 'none';
			removeNo.style.display = 'none';
			event.stopPropagation();
		});
		removeYes.style.display = 'block';
		removeNo.style.display = 'block';

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
			const jsonConfig = Core.serializeConfigValues(configValues);
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
		const titleField = new InputField('title');
		titleField.setValue(tabTitle);
		const valueField = new InputField('value');
		valueField.setValue(pathQueryAndFragment);
		document.querySelector('.add').addEventListener('click', () => {
			popupObject.addEntryFromInputFields();
		});
		document.querySelector('.add-input-text').addEventListener('keyup', (event) => {
			if (event.key === Key.ENTER) {
				document.querySelector('.add').click();
			}
		});
		document.querySelector('.add-form').style.display = 'block';
	}

	addEntryFromInputFields() {
		const titleField = new InputField('title');
		const valueField = new InputField('value');

		PathmarksPopUp.checkInputRequiredState(titleField);
		PathmarksPopUp.checkInputRequiredState(valueField);

		if (!titleField.getValue() || !valueField.getValue()) {
			return;
		}
		this.core.useGetStorage((items) => {
			let configValues = [];
			if (items) {
				configValues = JSON.parse(items);
			}
			const newEntry = {'title': titleField.getValue(), 'value': valueField.getValue()};
			configValues.push(newEntry);
			const jsonConfig = Core.serializeConfigValues(configValues);
			this.core.useSetStorage(jsonConfig, () => {
				titleField.resetValue();
				valueField.resetValue();
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
			if (event.key === Key.ENTER) {
				if (!PathmarksPopUp.isNonePathmarkSelected()) {
					document.querySelector('.selected')
						.dispatchEvent(PathmarksPopUp.createClickEvent(event.shiftKey));
				}
			}
		});

		document.documentElement.addEventListener('keydown', (event) => {
			if (PathmarksPopUp.isPathmarksEmpty()) {
				return;
			}
			if (event.key === Key.UP || event.key === Key.DOWN) {
				if (PathmarksPopUp.isNonePathmarkSelected()) {
					document.querySelector('.url:first-child').classList.add('selected');
					return;
				}
			}
			if (event.key === Key.DOWN) {
				return PathmarksPopUp.navigateKeyChange();
			}
			if (event.key === Key.UP) {
				return PathmarksPopUp.navigateKeyChange({up: true});
			}
		});
	}

	static isPathmarksEmpty() {
		return document.querySelectorAll('.url').length === 0;
	}

	static isNonePathmarkSelected() {
		return document.querySelectorAll('.selected').length === 0;
	}

	static createClickEvent(shiftKey) {
		return new MouseEvent("click", {
			bubbles: true,
			cancelable: true,
			view: window,
			shiftKey: shiftKey
		});
	}

	static navigateKeyChange({up = false} = {}) {
		const selectedUrl = document.querySelector('.selected');
		selectedUrl.classList.remove('selected');
		const nextUrl = up ? selectedUrl.previousSibling : selectedUrl.nextSibling;
		if (!nextUrl) {
			const childSelector = up ? 'last-child' : 'first-child';
			document.querySelector(`.url:${childSelector}`).classList.add('selected');
			return;
		}
		nextUrl.classList.add('selected');
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
		console.debug('Load Sortable via module', SortableModule);
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
			const jsonConfig = Core.serializeConfigValues(sortedConfigValues);
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
		if (!inputField.isRequired()) {
			return;
		}
		inputField.changeClassState();
	}

}

document.addEventListener("DOMContentLoaded", () => {
	const popup = new PathmarksPopUp();
	popup.start();
});
