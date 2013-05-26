/**
 * Base for the popup of the chrome extension.
 */
Pathmarks.PopUp = Class.extend({

    init: function() {
        this.core = new Pathmarks.Core();
    },

    start: function() {
        this.showBaseUrl();
        this.loadConfiguration();
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
            chrome.tabs.create({url: targetForTab});
        });
    },

    loadConfiguration: function() {
        var self = this;
        this.core.useGetStorage(function(items) {
            if (items) {
                var configs = JSON.parse(items);
                var urls = jQuery(".urls");
                for (var entryIdx in configs) {
                    var entry = configs[entryIdx];
                    var url = jQuery("<div />");
                    url.addClass("url");
                    url.attr("data-path", entry.value);
                    url.html(entry.title + "<span class='path'>" + entry.value + "</span>");
                    url.click(function () {
                        self.changeUrls(jQuery(this).attr("data-path"));
                    });
                    urls.append(url);
                }
            } else {
                jQuery(".urls").html("<div class=\"error\">No paths configured, use options of this extension to configure paths.</div>");
            }
        });
    },

    showBaseUrl: function() {
        var self = this;
        chrome.tabs.getSelected(null, function(tab) {
            var targetForTab = self.getHostAndPort(tab.url);
            jQuery(".baseurl").html(targetForTab);
        });
    }


});

jQuery().ready(function() {
    var popup = new Pathmarks.PopUp();
    popup.start();
});