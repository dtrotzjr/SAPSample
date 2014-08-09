//depends on browser

var logger = {}

logger.DEBUG_MODE = true;

logger.ERROR = "error";
logger.WARNING = "warning";
logger.INFO = "info";
logger.DEBUG = "debug";

logger.sendToConsole = function(message, severity) {
	browser.logToFile(message,severity);
	
	if (!browser.logToConsole(message, severity)) {
		//revert to using console.log
		console.log("browser.logToConsole failed, attempt to log " + severity + ": " + message);

		if (this.DEBUG_MODE) {
			alert("browser.logToConsole failed, attempt to log " + severity + ": " + message);
		}
	}
}

logger.exception = function(exception, message) {
	var msg = "exception caught " + exception.name + " - " + exception.message;

	if (message) {
		msg += " | " + message;
	}

	this.error(msg);

	//if (logger.DEBUG_MODE) {
	//	throw exception;
	//}
}

logger.error = function(str) {
	var msg = "CE ERROR: " + str;
	this.sendToConsole(msg, this.ERROR);
}
logger.err = logger.error;

logger.warning = function(str) {
	var msg = "CE WARNING: " + str;
	this.sendToConsole(msg, this.WARNING);
}
logger.warn = logger.warning;

logger.info = function(str) {
	var msg = "CE INFO: " + str;
	this.sendToConsole(msg, this.INFO);
}

logger.debug = function(str) {
	var msg = "CE DEBUG: " + str;
	this.sendToConsole(msg, this.DEBUG);
}
