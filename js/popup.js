/**
 * Base for the popup of the chrome extension.
 */
Pathmarks.PopUp = Class.extend({

    init: function() {
        this.KEY_UP = 38;
        this.KEY_DOWN = 40;
        this.KEY_ENTER = 13;
        this.core = new Pathmarks.Core();
        this.ui = new Pathmarks.UI();
    },

    start: function() {
        this.showBaseUrl();
        this.showAddPathmark();
        this.showOpenOptionPage();
        this.createCloseFormButton();
        this.loadConfiguration();
        this.loadKeyNavigation();
        this.loadSortable();
    },

    createVirtualLink: function(url) {
        var virtualLink = jQuery("<a></a>");
        virtualLink.prop("href", url);
        return virtualLink;
    },

    getHostAndPort: function(url) {
        var virtualLink = this.createVirtualLink(url);
        var port = virtualLink.prop("port") ? ":" + virtualLink.prop("port") : "";
        return virtualLink.prop("protocol") + "//" + virtualLink.prop("hostname") + port;
    },

    getPathQueryAndFragmentFromUrl: function(url) {
        var virtualLink = this.createVirtualLink(url);
        var fragment = virtualLink.prop("hash") ? virtualLink.prop("hash") : "";
        var query = virtualLink.prop("search") ? virtualLink.prop("search") : "";
        var path = virtualLink.prop("pathname") ? virtualLink.prop("pathname") : "";
        return path + query + fragment;
    },

    changeUrls: function(urlTarget, setNewTabActive) {
        var self = this;
        this.executeFunctionOnActiveTab(function(tab) {
            var targetForTab = self.getHostAndPort(tab.url) + urlTarget;
	        var targetIndex = tab.index + 1;
            self.openOrSelectTab(targetForTab, setNewTabActive, targetIndex);
        });
    },

    openOrSelectTab: function(tabUrl, setNewTabActive, tabIndex) {
        chrome.tabs.query({url: tabUrl}, function(tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {active: setNewTabActive});
            } else {
                chrome.tabs.create({index: tabIndex, url: tabUrl, active: setNewTabActive});
            }
        });
    },

    loadConfiguration: function() {
        var self = this;
        this.core.useGetStorage(function(items) {
            if (items) {
                var configs = JSON.parse(items);
                if (configs.length < 1) {
                    return self.showNoPathsMessage();
                }
                var urls = jQuery(".urls");
                urls.empty();
                jQuery.each(configs, function(entryIdx, entry) {
                    var url = jQuery("<div></div>");
                    url.addClass("url");
                    url.data("path", entry.value);
                    url.html('<div class="move-icon icon-default fa fa-ellipsis-v" aria-hidden="true"></div>' + entry.title + "<span class='path'>" + entry.value + "</span>");
                    url.on("click", function (event) {
                        self.changeUrls(jQuery(this).data("path"), !event.shiftKey);
                    });
                    url.append(self.createRemoveButton(self));
                    urls.append(url);
                });
            } else {
                self.showNoPathsMessage();
            }
        });
    },

    showNoPathsMessage: function() {
        var self = this;
        jQuery(".urls").html("<div class=\"no-paths-message\"><div>Welcome to pathmarks.</div><div>No paths are configured, use the <span class=\"options\">Options</span> page of this extension to configure paths or add paths with the path icon.</div></div>");
        jQuery(".options").on("click", function() {
            self.openOptionsPage();
        });
    },

    createCloseFormButton: function () {
        jQuery(".js-form-close").on("click", function () {
            jQuery(".add-form").hide("fast");
        });
    },

    createRemoveButton: function(self) {
        var removeButton = jQuery("<div></div>");
        removeButton.addClass("remove-entry");
        removeButton.attr("title", "Remove this entry");
        var removeIcon = jQuery("<div></div>");
        removeIcon.addClass("remove-icon").addClass("icon-default").addClass("fa fa-minus");
        removeButton.append(removeIcon);
        removeButton.on("click", function() {
            self.createRemoveConfirmButtons(this);
            return false;
        });
        return removeButton;
    },

    createRemoveConfirmButtons: function(clickedElement) {
        var self = this;
        var removeEntry = jQuery(clickedElement);
        removeEntry.empty();
        var removeYes = jQuery("<div></div>");
        removeYes.addClass("remove-yes");
        removeYes.html("Yes");
        removeYes.on("click", function() {
            self.removePathmark(removeEntry.parents(".url"));
            return false;
        });
        removeEntry.append(removeYes);
        var removeNo = jQuery("<div></div>");
        removeNo.addClass("remove-no");
        removeNo.html("No");
        removeNo.on("click", function() {
            var entryDiv = removeEntry.parents(".url");
            removeEntry.remove();
            entryDiv.append(self.createRemoveButton(self));
            return false;
        });
        removeEntry.append(removeNo);
    },

    removePathmark: function(pathmarkEntry) {
        var path = pathmarkEntry.data("path");
        var self = this;
        this.core.useGetStorage(function(items) {
            var configValues = [];
            if (items) {
                configValues = JSON.parse(items);
            }
            for (var idx = configValues.length - 1; idx >= 0; idx--) {
                if (configValues[idx].value == path) configValues.splice(idx, 1);
            }
            var jsonConfig = self.core.serializeConfigValues(configValues);
            self.core.useSetStorage(jsonConfig, function() {
                self.start();
                self.refreshOptionsPage();
            });
        });
    },

    executeFunctionOnActiveTab: function(callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            jQuery.each(tabs, function(idx, tab) {
                return callback(tab);
            });
        });
    },

    showBaseUrl: function() {
        var self = this;
        this.executeFunctionOnActiveTab(function(tab) {
            var targetForTab = self.getHostAndPort(tab.url);
            jQuery(".baseurl").html(targetForTab);
        });
    },

    showOpenOptionPage: function() {
        var self = this;
        jQuery(".option-page").on("click", function() {
            self.openOptionsPage();
        });
    },

    showAddPathmark: function() {
        var self = this;
        this.executeFunctionOnActiveTab(function(tab) {
            var tabTitle = tab.title;
            var pathQueryAndFragment = self.getPathQueryAndFragmentFromUrl(tab.url);
	        var addPath = jQuery(".add-path");
            if (pathQueryAndFragment == "/") {
                addPath.hide();
                return;
            }
            addPath.attr("title", pathQueryAndFragment);
	        addPath.on("click", function() {
		        self.addCurrentPath(self, tabTitle, pathQueryAndFragment);
            });
        });
    },

    addCurrentPath: function(self, tabTitle, pathQueryAndFragment) {
        var titleField = jQuery("input[name=title]");
        titleField.val(tabTitle);
        var valueField = jQuery("input[name=value]");
        valueField.val(pathQueryAndFragment);
        jQuery(".add").on("click", function() {
            self.addEntryFromInputFields();
        });
        jQuery(".add-input-text").on("keyup", function(event) {
            if (event.which == self.KEY_ENTER) {
                jQuery(".add").trigger("click");
            }
        });
        jQuery(".add-form").show("fast");
    },

    addEntryFromInputFields: function() {
        var selectorTitle = "input[name=title]";
        var selectorValue = "input[name=value]";
        var title = this.ui.getValueFromInputAndCheckRequired(selectorTitle);
        var value = this.ui.getValueFromInputAndCheckRequired(selectorValue);
        if (!title || !value) {
            return;
        }
        var self = this;
        this.core.useGetStorage(function(items) {
            var configValues = [];
            if (items) {
                configValues = JSON.parse(items);
            }
            var newEntry = {"title": title, "value": value };
            configValues.push(newEntry);
            var jsonConfig = self.core.serializeConfigValues(configValues);
            self.core.useSetStorage(jsonConfig, function() {
                self.ui.resetInputField(selectorTitle);
                self.ui.resetInputField(selectorValue);
                jQuery(".add-form").hide();
                self.start();
                self.refreshOptionsPage();
            });
        });
    },

    loadKeyNavigation: function() {
        var self = this;
        jQuery(document.documentElement).on("keyup", function(event) {
            if (self.isPathmarksEmpty()) {
                return;
            }
            if (event.which == self.KEY_ENTER) {
                var clickEvent = jQuery.Event("click");
                clickEvent.shiftKey = event.shiftKey;
                jQuery(".selected").trigger(clickEvent);
                return;
            }
            if (event.which == self.KEY_UP || event.which == self.KEY_DOWN) {
                if (self.isNonePathmarkSelected()) {
                    jQuery(".url:first").addClass("selected");
                    return;
                }
            }
            if (event.which == self.KEY_DOWN) {
                return self.navigateKeyDown();
            }
            if (event.which == self.KEY_UP) {
                return self.navigateKeyUp();
            }
        });
    },

    isPathmarksEmpty: function() {
        return jQuery(".url").length == 0;
    },

    isNonePathmarkSelected: function() {
        return jQuery(".selected").length == 0;
    },

    navigateKeyDown: function() {
        var selectedUrl = jQuery(".selected");
        var nextUrl = selectedUrl.next(".url");
        selectedUrl.removeClass("selected");
        if (nextUrl.length == 0) {
            jQuery(".url:first").addClass("selected");
            return;
        }
        nextUrl.addClass("selected");
    },

    navigateKeyUp: function() {
        var selectedUrl = jQuery(".selected");
        var previousUrl = selectedUrl.prev(".url");
        selectedUrl.removeClass("selected");
        if (previousUrl.length == 0) {
            jQuery(".url:last").addClass("selected");
            return;
        }
        previousUrl.addClass("selected");
    },

    openOptionsPage: function() {
        var optionsUrl = this.getOptionsUrl();
        this.openOrSelectTab(optionsUrl, true);
    },

    refreshTab: function(tabUrl) {
        chrome.tabs.query({url: tabUrl}, function(tabs) {
            if (tabs.length) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    },

    refreshOptionsPage: function() {
        var optionsUrl = this.getOptionsUrl();
        this.refreshTab(optionsUrl);
    },

    getOptionsUrl: function() {
        return chrome.extension.getURL("/html/options.html");
    },

    loadSortable: function() {
        var self = this;
        jQuery(".urls").sortable({
            items: ".url",
            stop: function() {
                self.resortPathmarks();
            }
        });
    },

    resortPathmarks: function() {
        var viewWithPaths = this.createPathmarksFromHtml();
        var self = this;
        this.core.useGetStorage(function(items) {
            var configValues = [];
            if (items) {
                configValues = JSON.parse(items);
            }
            if (configValues.length != viewWithPaths.length) {
                console.error("Unexpected behaviour, re-sort aborted");
                return;
            }
            var sortedConfigValues = [];
            jQuery.each(viewWithPaths, function(sortIndex, path) {
                jQuery.each(configValues, function(actualIndex, savedPathmark) {
                    if (savedPathmark.value == path) {
                        sortedConfigValues[sortIndex] = savedPathmark;
                    }
                });
            });
            var jsonConfig = self.core.serializeConfigValues(sortedConfigValues);
            self.core.useSetStorage(jsonConfig, function() {
                self.start();
                self.refreshOptionsPage();
            });
        });
    },

    createPathmarksFromHtml: function() {
        var urls = jQuery(".url");
        var result = [];
        jQuery.each(urls, function(idx, elem) {
            result.push(jQuery(elem).data("path"));
        });
        return result;
    }

});

jQuery().ready(function() {
    var popup = new Pathmarks.PopUp();
    popup.start();
});
