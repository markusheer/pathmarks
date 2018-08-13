/**
 * Base for the popup of the chrome extension.
 */
class PathmarksPopUp {

    constructor() {
        this.KEY_UP = 38;
        this.KEY_DOWN = 40;
        this.KEY_ENTER = 13;
        this.core = new PathmarksCore();
        this.ui = new PathmarksUI();
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
	    const virtualLink = jQuery('<a></a>');
        virtualLink.prop('href', url);
        return virtualLink;
    }

    static getHostAndPort(url) {
	    const virtualLink = PathmarksPopUp.createVirtualLink(url);
	    const port = virtualLink.prop('port') ? `:${virtualLink.prop("port")}` : '';
        return `${virtualLink.prop('protocol')}//${virtualLink.prop('hostname')}${port}`;
    }

    static getPathQueryAndFragmentFromUrl(url) {
	    const virtualLink = PathmarksPopUp.createVirtualLink(url);
	    const fragment = virtualLink.prop('hash') ? virtualLink.prop('hash') : '';
	    const query = virtualLink.prop('search') ? virtualLink.prop('search') : '';
	    const path = virtualLink.prop('pathname') ? virtualLink.prop('pathname') : '';
        return path + query + fragment;
    }

    changeUrls(urlTarget, setNewTabActive) {
        this.executeFunctionOnActiveTab((tab) => {
	        const targetForTab = PathmarksPopUp.getHostAndPort(tab.url) + urlTarget;
	        const targetIndex = tab.index + 1;
            this.openOrSelectTab(targetForTab, setNewTabActive, targetIndex);
        });
    }

    openOrSelectTab(tabUrl, setNewTabActive, tabIndex) {
        chrome.tabs.query({url: tabUrl}, function(tabs) {
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
	            const urls = jQuery('.urls');
                urls.empty();
                jQuery.each(configs, (entryIdx, entry) => {
	                const url = jQuery('<div></div>');
                    url.addClass('url');
                    url.data('path', entry.value);
                    url.html('<div class="move-icon icon-default fa fa-ellipsis-v" aria-hidden="true"></div>' + entry.title + '<span class="path">' + entry.value + '</span>');
                    url.on('click', (event) => {
                        this.changeUrls(jQuery(event.target).data('path'), !event.shiftKey);
                    });
                    url.append(this.createRemoveButton(this));
                    urls.append(url);
                });
            } else {
                this.showNoPathsMessage();
            }
        });
    }

    showNoPathsMessage() {
        jQuery('.urls').html('<div class="no-paths-message"><div>Welcome to pathmarks.</div><div>No paths are configured, use the <span class="options">Options</span> page of this extension to configure paths or add paths with the path icon.</div></div>');
        jQuery('.options').on('click', () => {
            this.openOptionsPage();
        });
    }

    createCloseFormButton() {
        jQuery('.js-form-close').on('click', function () {
            jQuery('.add-form').hide('fast');
        });
    }

    createRemoveButton(self) {
	    const removeButton = jQuery('<div></div>');
        removeButton.addClass('remove-entry');
        removeButton.attr('title', 'Remove this entry');
	    const removeIcon = jQuery('<div></div>');
        removeIcon.addClass('remove-icon').addClass('icon-default').addClass('fa fa-minus');
        removeButton.append(removeIcon);
        removeButton.on('click', function() {
            self.createRemoveConfirmButtons(this);
            return false;
        });
        return removeButton;
    }

    createRemoveConfirmButtons(clickedElement) {
	    const removeEntry = jQuery(clickedElement);
        removeEntry.empty();
	    const removeYes = jQuery('<div></div>');
        removeYes.addClass('remove-yes');
        removeYes.html('Yes');
        removeYes.on('click', () => {
            this.removePathmark(removeEntry.parents('.url'));
            return false;
        });
        removeEntry.append(removeYes);
	    const removeNo = jQuery('<div></div>');
        removeNo.addClass('remove-no');
        removeNo.html('No');
        removeNo.on('click', () => {
	        const entryDiv = removeEntry.parents('.url');
            removeEntry.remove();
            entryDiv.append(this.createRemoveButton(this));
            return false;
        });
        removeEntry.append(removeNo);
    }

    removePathmark(pathmarkEntry) {
	    const path = pathmarkEntry.data('path');
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
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            jQuery.each(tabs, function(idx, tab) {
                return callback(tab);
            });
        });
    }

    showBaseUrl() {
        this.executeFunctionOnActiveTab((tab) => {
	        let targetForTab = PathmarksPopUp.getHostAndPort(tab.url);
            jQuery('.baseurl').html(targetForTab);
        });
    }

    showOpenOptionPage() {
        jQuery('.option-page').on('click', () => {
            this.openOptionsPage();
        });
    }

    showAddPathmark() {
        this.executeFunctionOnActiveTab((tab) => {
	        const tabTitle = tab.title;
	        const pathQueryAndFragment = PathmarksPopUp.getPathQueryAndFragmentFromUrl(tab.url);
	        const addPath = jQuery('.add-path');
            if (pathQueryAndFragment === '/') {
                addPath.hide();
                return;
            }
            addPath.attr('title', pathQueryAndFragment);
	        addPath.on('click', () => {
		        this.addCurrentPath(this, tabTitle, pathQueryAndFragment);
            });
        });
    }

    addCurrentPath(popupObject, tabTitle, pathQueryAndFragment) {
	    const titleField = jQuery('input[name=title]');
        titleField.val(tabTitle);
	    const valueField = jQuery('input[name=value]');
        valueField.val(pathQueryAndFragment);
        jQuery('.add').on('click', function() {
	        popupObject.addEntryFromInputFields();
        });
        jQuery('.add-input-text').on('keyup', function(event) {
            if (event.which === popupObject.KEY_ENTER) {
                jQuery('.add').trigger('click');
            }
        });
        jQuery('.add-form').show('fast');
    }

    addEntryFromInputFields() {
	    const selectorTitle = 'input[name=title]';
	    const selectorValue = 'input[name=value]';
	    const title = this.ui.getValueFromInputAndCheckRequired(selectorTitle);
	    const value = this.ui.getValueFromInputAndCheckRequired(selectorValue);
        if (!title || !value) {
            return;
        }
        this.core.useGetStorage((items) => {
	        let configValues = [];
            if (items) {
                configValues = JSON.parse(items);
            }
	        const newEntry = {'title': title, 'value': value };
            configValues.push(newEntry);
	        const jsonConfig = PathmarksCore.serializeConfigValues(configValues);
            this.core.useSetStorage(jsonConfig, () => {
	            PathmarksUI.resetInputField(selectorTitle);
	            PathmarksUI.resetInputField(selectorValue);
                jQuery('.add-form').hide();
	            this.start();
	            this.refreshOptionsPage();
            });
        });
    }

    loadKeyNavigation() {
        jQuery(document.documentElement).on('keyup', (event) => {
            if (PathmarksPopUp.isPathmarksEmpty()) {
                return;
            }
            if (event.which === this.KEY_ENTER) {
	            const clickEvent = jQuery.Event('click');
                clickEvent.shiftKey = event.shiftKey;
                jQuery('.selected').trigger(clickEvent);
                return;
            }
            if (event.which === this.KEY_UP || event.which === this.KEY_DOWN) {
                if (PathmarksPopUp.isNonePathmarkSelected()) {
                    jQuery('.url:first').addClass('selected');
                    return;
                }
            }
            if (event.which === this.KEY_DOWN) {
                return PathmarksPopUp.navigateKeyDown();
            }
            if (event.which === this.KEY_UP) {
                return PathmarksPopUp.navigateKeyUp();
            }
        });
    }

    static isPathmarksEmpty() {
        return jQuery('.url').length === 0;
    }

    static isNonePathmarkSelected() {
        return jQuery('.selected').length === 0;
    }

    static navigateKeyDown() {
	    const selectedUrl = jQuery('.selected');
	    const nextUrl = selectedUrl.next('.url');
        selectedUrl.removeClass('selected');
        if (nextUrl.length === 0) {
            jQuery('.url:first').addClass('selected');
            return;
        }
        nextUrl.addClass('selected');
    }

    static navigateKeyUp() {
	    const selectedUrl = jQuery('.selected');
	    const previousUrl = selectedUrl.prev('.url');
        selectedUrl.removeClass('selected');
        if (previousUrl.length === 0) {
            jQuery('.url:last').addClass('selected');
            return;
        }
        previousUrl.addClass('selected');
    }

    openOptionsPage() {
	    const optionsUrl = PathmarksPopUp.getOptionsUrl();
        this.openOrSelectTab(optionsUrl, true);
    }

    refreshTab(tabUrl) {
        chrome.tabs.query({url: tabUrl}, function(tabs) {
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
        jQuery('.urls').sortable({
            items: '.url',
            stop: () => {
                this.resortPathmarks();
            }
        });
    }

    resortPathmarks() {
	    const viewWithPaths = this.createPathmarksFromHtml();
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
            jQuery.each(viewWithPaths, function(sortIndex, path) {
                jQuery.each(configValues, function(actualIndex, savedPathmark) {
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

    createPathmarksFromHtml() {
	    const urls = jQuery('.url');
	    const result = [];
        jQuery.each(urls, function(idx, elem) {
            result.push(jQuery(elem).data('path'));
        });
        return result;
    }

}

jQuery().ready(function() {
	const popup = new PathmarksPopUp();
    popup.start();
});
