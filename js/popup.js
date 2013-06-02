/**
 * Base for the popup of the chrome extension.
 */
Pathmarks.PopUp = Class.extend({


    init: function() {
        this.KEY_UP = 38;
        this.KEY_DOWN = 40;
        this.KEY_ENTER = 13;
        this.core = new Pathmarks.Core();
    },

    start: function() {
        this.showBaseUrl();
        this.loadConfiguration();
        this.loadKeyNavigation();
    },

    getHostAndPort: function(url) {
        var virtualLink = jQuery("<a />");
        virtualLink.prop("href", url);
        var port = virtualLink.prop("port") ? ":" + virtualLink.prop("port") : "";
        return virtualLink.prop("protocol") + "//" + virtualLink.prop("hostname") + port;
    },

    changeUrls: function(urlTarget) {
        var self = this;
        chrome.tabs.getSelected(null, function(tab) {
            var targetForTab = self.getHostAndPort(tab.url) + urlTarget;
            self.openOrSelectTab(targetForTab);
        });
    },

    openOrSelectTab: function(tabUrl) {
        chrome.tabs.query({url: tabUrl}, function(tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {active: true});
            } else {
                chrome.tabs.create({url: tabUrl});
            }
        });
    },

    loadConfiguration: function() {
        var self = this;
        this.core.useGetStorage(function(items) {
            if (items) {
                var configs = JSON.parse(items);
                var urls = jQuery(".urls");
                jQuery.each(configs, function(entryIdx, entry) {
                    var url = jQuery("<div />");
                    url.addClass("url");
                    url.attr("data-path", entry.value);
                    url.html(entry.title + "<span class='path'>" + entry.value + "</span>");
                    url.on("click", function () {
                        self.changeUrls(jQuery(this).attr("data-path"));
                    });
                    urls.append(url);
                });
            } else {
                jQuery(".urls").html("<div class=\"error\">No paths configured, use the <span class=\"options\">Options</span> of this extension to configure paths.</div>");
                jQuery(".options").on("click", function() {
                    self.openOptionsPage();
                });
            }
        });
    },

    showBaseUrl: function() {
        var self = this;
        chrome.tabs.getSelected(null, function(tab) {
            var targetForTab = self.getHostAndPort(tab.url);
            jQuery(".baseurl").html(targetForTab);
        });
    },

    loadKeyNavigation: function() {
        var self = this;
        jQuery(document.documentElement).on("keyup", function(event) {
            var selectedUrl = null;
            if (jQuery(".url").length == 0) {
                return;
            }
            if (event.which == self.KEY_ENTER) {
                jQuery(".selected").click();
            }
            if (event.which == self.KEY_UP || event.which == self.KEY_DOWN) {
                selectedUrl = jQuery(".selected");
                if (selectedUrl.length == 0) {
                    jQuery(".url:first").addClass("selected");
                    return;
                }
            }
            if (event.which == self.KEY_DOWN) {
                selectedUrl = jQuery(".selected");
                var nextUrl = selectedUrl.next(".url");
                selectedUrl.removeClass("selected");
                if (nextUrl.length == 0) {
                    jQuery(".url:first").addClass("selected");
                    return;
                }
                nextUrl.addClass("selected");
                return;
            }
            if (event.which == self.KEY_UP) {
                selectedUrl = jQuery(".selected");
                var previousUrl = selectedUrl.prev(".url");
                selectedUrl.removeClass("selected");
                if (previousUrl.length == 0) {
                    jQuery(".url:last").addClass("selected");
                    return;
                }
                previousUrl.addClass("selected");
            }
        });
    },

    openOptionsPage: function() {
        var optionsUrl = chrome.extension.getURL('/html/options.html');
        this.openOrSelectTab(optionsUrl);
    }


});

jQuery().ready(function() {
    var popup = new Pathmarks.PopUp();
    popup.start();
});