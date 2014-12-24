/**
 * Handling of options/configuration.
 */
Pathmarks.Options = Class.extend({

    init: function() {
        this.core = new Pathmarks.Core();
        this.UI = new Pathmarks.UI();
    },

    start: function() {
        var self = this;
        jQuery(".configarea").on("keyup", function() {
            self.saveConfiguration();
        });
        jQuery(".add").on("click", function() {
            self.addEntryFromInputFields();
        });
        jQuery(".text").on("keyup", function(event) {
            self.addEntriesOnEnter(event, self);
        });
        jQuery(".header-version").html(chrome.runtime.getManifest().version);
        this.loadConfiguration();
        this.createChromeExtensionsLink();
    },

    setMessage: function(msg) {
        var messageContainer = jQuery(".message");
        messageContainer.removeClass("error");
        messageContainer.html(msg);
    },

    setErrorMessage: function(errorMsg) {
        var messageContainer = jQuery(".message");
        messageContainer.addClass("error");
        messageContainer.html(errorMsg);
    },

    saveConfiguration: function() {
        var jsonConfig = jQuery("#jsonConfig").val();
        if (!jsonConfig) {
            this.resetConfiguration();
            return;
        }
        try {
            JSON.parse(jsonConfig);
        } catch (e) {
            jQuery(".configarea").addClass("invalid");
            this.setErrorMessage("Error: Can not save illegal JSON configuration " + e);
            return;
        }
        var self = this;
        this.core.useSetStorage(jsonConfig, function() {
            jQuery(".configarea").removeClass("invalid");
            jQuery(".configarea").addClass("saved");
            self.setMessage("Configuration saved");
        });
    },

    resetConfiguration: function() {
        jQuery("#jsonConfig").val("");
        var self = this;
        this.core.useSetStorage("", function() {
            self.setMessage("Configuration cleared.");
        });
    },

    loadConfiguration: function() {
        this.core.useGetStorage(function(items) {
            if (items) {
                jQuery("#jsonConfig").val(items);
            }
        });
    },

    addEntryFromInputFields: function() {
        var titleField = jQuery("input[name=title]");
        var valueField = jQuery("input[name=value]");
        var title = titleField.val();
        var value = valueField.val();
        if (!title) {
            titleField.addClass("invalid");
        } else {
            titleField.removeClass("invalid");
        }
        if (!value) {
            valueField.addClass("invalid");
        } else {
            valueField.removeClass("invalid");
        }
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
            jQuery(".configarea").val(self.core.serializeConfigValues(configValues));
            self.saveConfiguration();
            titleField.val("");
            valueField.val("");
        });
    },

    addEntriesOnEnter: function(event, self) {
        if (event.which == 13) {
            self.addEntryFromInputFields();
        }
    },

    createChromeExtensionsLink: function() {
        jQuery(".js-open-extensions-settings").on("click", function() {
            chrome.tabs.create({url: "chrome://extensions"});
        });
    }

});

jQuery().ready(function() {
	var options = new Pathmarks.Options();
    options.start();
});