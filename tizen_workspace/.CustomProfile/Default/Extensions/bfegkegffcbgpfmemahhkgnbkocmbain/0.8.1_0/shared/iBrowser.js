//
// Browser interface
//

//using an Object instead of a function, since it doesn't make sense to be able to instantiate an iBrowser
var iBrowser = {
	notImplemented : function(name) {
		try {
			console.log("iBrowser interface : cannot invoke " + name + " : implementation is missing.")
		} finally {
			return false;
		}
	},
	getExtensionPath : function() {return this.notImplemented("getExtensionPath");},
	getExtensionVersion : function() {return this.notImplemented("getExtensionVersion");},
	getBrowserVersion : function() {return this.notImplemented("getBrowserVersion");},
	getBrowserName : function() {return this.notImplemented("getBrowserName");},
	refreshIcon : function() {return this.notImplemented("refreshIcon");},
	navigateTo : function() {return this.notImplemented("navigateTo");},
	logInfo : function() {return this.notImplemented("logInfo");},
	logToConsole : function() {return this.notImplemented("logToConsole");},
	logToFile : function() {return this.notImplemented("logToFile");}
}

iBrowser.consoleSeverities

//
// Settings, which can/should be overridden by each Browser
//

iBrowser.settings = {};
iBrowser.settings.api = {};
iBrowser.settings.api.publickey = ""; //each browser should likely have its own key
iBrowser.settings.api.secretkey = ""; //each browser should likely have its own key
iBrowser.settings.api.defaultUrl = "localhost:48867/local"; //must accept both https and http, do not include trailing /
iBrowser.settings.api.url = iBrowser.settings.api.defaultUrl //allow this to be overriden
iBrowser.settings.writeToFile;
iBrowser.settings.writeToConsole;


//
// Impelmentation-independent utilities
//

iBrowser.util = {};

iBrowser.util.getDomain = function(url) {
	if (typeof url != "string") {
		return null;
	}
	//this will return "google.com" for google.com, www.google.com, stuff.blah.google.com, etc
	//TODO: this will not work correctly with top-level domains like co.uk
	var match = url.match(/:\/\/([^/]*\.)?([^/\.]+\.[^/\.]+)/);
	if (match != null) {
		return match[2].toLowerCase();
	}
}

iBrowser.util.getProtocol = function(url) {
	if (typeof url != "string") {
		return null;
	}
	//this will return http or https or safari-extension or ...
	var match = url.match(/([a-zA-Z]+):\/\//);
	if (match != null) {
		return match[1].toLowerCase();
	}
}

iBrowser.util.shouldLogUrl = function(url) {
	var protocol = this.getProtocol(url);

	return (protocol === "http" || protocol === "https") && url.search("://api.cvnt.net/") == -1 && url.search("://localhost:48867/") == -1;

}

//
iBrowser.util.getVersionFromUserAgent = function(identifier) {
	//Example:
	// navigator.userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.168 Safari/535.19"
	// identifier = "Chrome/"
	var start = navigator.userAgent.indexOf(identifier); //71
	var end = navigator.userAgent.indexOf(" ", start); //91
	if (end == -1) { //If this is the last entry, adjust accordingly
		end = navigator.userAgent.length;
	}
	return navigator.userAgent.substring(start+identifier.length, end); //18.0.1025.168
}

iBrowser.getUserAgent = function() {
	var agent = {};

	agent.architecture = 32; //FIXME?
	agent.platform = this.getBrowserName();
	agent.platformVersion = this.getBrowserVersion();
	agent.version = this.getExtensionVersion();

	return agent;
}



//
// Enhance Function objects
//

/*
 * Usage:
 * function ChromeBrowser() {}
 * ChromeBrowser.inheritsFrom(iBrowser);
 * ChromeBrowser.prototype.getBrowserVersion = function() { //custom implementation for Chrome }
 */
Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
}
