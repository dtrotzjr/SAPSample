function ChromeBrowser() {
	//Define any custom Chrome-specific things here
};

ChromeBrowser.inheritsFrom(iBrowser);

ChromeBrowser.prototype.settings.api.publickey = "e0aa45e7ba0e3517a975f2fd67e1290dc424483a";
ChromeBrowser.prototype.settings.api.secretkey = "ce6c04c920a3fc5a0e6ac76c5da1f78a9520b6b9";

//TODO: investigate to ensure this is assigning "by reference" per se, not copy the actual strings.
//send.js requires this settings object to exist in global scope, to avoid coupling between send.js and browser.js
var settings = ChromeBrowser.prototype.settings;

//
// Implementation-dependent functions (must implement interface)
//

ChromeBrowser.prototype.getExtensionPath = function() {
	var id = chrome.i18n.getMessage("@@extension_id");
	if (id == null) {
		id = chrome.app.getDetails().id;
	}
    return "chrome-extension://" + id + "/";
}

ChromeBrowser.prototype.getExtensionVersion = function() {
    /* chrome.app.getDetails() seems undocumented online - here are its properties:
     	background
		browser_action
		content_security_policy
		description
		homepage_url
		icons
		id
		manifest_version
		minimum_chrome_version
		name
		permissions
		update_url
		version
		web_accessible_resources 
     */
    var details = chrome.app.getDetails();

    return details.version;
}

ChromeBrowser.prototype.getBrowserVersion = function() {
	return this.util.getVersionFromUserAgent("Chrome/");
}

ChromeBrowser.prototype.getBrowserName = function() {
	return "Chrome"; //TODO: reevaluate if this can be determined systematically.
}

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}

ChromeBrowser.prototype.logToFile = function(aMessage,severity) {
	if(localStorage["writeToFile"] == "true")
	{
		var temp = new Date();
		var dateStr = padStr(temp.getFullYear()) +
					  padStr(1 + temp.getMonth()) +
					  padStr(temp.getDate()) +
					  padStr(temp.getHours()) +
					  padStr(temp.getMinutes()) +
					  padStr(temp.getSeconds());

		localStorage["CEDebug"] = dateStr + ": " + aMessage + "\n" + localStorage["CEDebug"];
	}
	return true;
}

ChromeBrowser.prototype.logToConsole = function(aMessage,severity) {
	if(severity == "info")
	{
		console.info(aMessage);
	}
	else if(severity == "debug")
	{
		console.debug(aMessage);
	}
	else if(severity == "warning")
	{
		console.warn(aMessage);
	}
	else //Default to error
	{
		console.error(aMessage);
	}
	
	return true;
}

ChromeBrowser.prototype.navigateTo = function(destUrl, newTab) {
	var tab = null;
	if (newTab) {
		chrome.tabs.create({url: destUrl});
	} else {
		window.location = destUrl;
	}
}

var browser = new ChromeBrowser();


// PreferenceWatcher for Chrome
var PreferenceWatcher = {

	// Initialize the extension
	startup: function()
	{
		// Register to receive notifications of preference changes
		chrome.extension.onRequest.addListener(this.observe);

		if (localStorage["apiURL"]) {
			this.refreshApp();
		}

	},

	// Clean up after ourselves and save the prefs
	shutdown: function()
	{
		chrome.extension.onRequest.removeListener(this.observe);
	},

	// Called when events occur on the preferences
	observe: function (request, sender, sendResponse) {
	    if (request.cmd == "apiURL") {
			PreferenceWatcher.refreshApp();
	    }
	},

	// Sets the apiURL preference
	setApiURL: function(newApiURL)
	{
		localStorage["apiURL"] = newApiURL;
	},

	// Refresh the application when the preference changes
	refreshApp: function()
	{
		var apiURL = localStorage["apiURL"];
		//alert(localStorage["apiURL"]);
		if (!settings.api.url) {
			console.error("Unable to override API url, since settings.api.url is not accessible.");
			return
		}

		if (apiURL == "") {
			if (settings.api.defaultUrl) {
				console.log("Restoring API url to " + settings.api.defaultUrl + " (was " + settings.api.url + ")");
				settings.api.url = settings.api.defaultUrl;
			}
		} else {
			console.log("Overriding API url to " + apiURL + " (was " + settings.api.url + ")");
			settings.api.url = apiURL;
		}
	},
}

// Install load and unload handlers
window.addEventListener("load", function(e) { PreferenceWatcher.startup(); }, false);
window.addEventListener("unload", function(e) { PreferenceWatcher.shutdown(); }, false);
