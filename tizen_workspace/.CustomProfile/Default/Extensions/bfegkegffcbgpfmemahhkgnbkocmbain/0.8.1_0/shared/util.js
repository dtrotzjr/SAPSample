//depends on logger

var util = {};

util.errorHandler = function(e) {
  logger.error(e);
}

util.parseJsonResponse = function(xhr) {

    // Though this should enforce "application/json", for now let's be more lenient
    if (xhr.getResponseHeader("Content-Type")) { // === "application/json"
        var parsed = JSON.parse(xhr.responseText);

	    //sendjs.apiStatus = parsed.result.meta.status;
	    //sendjs.apiMessage = parsed.result.meta.message;

    	return parsed;
    }

    logger.error("Non-JSON response from client : " + xhr.getResponseHeader("Content-Type") + " : status "+ xhr.status + " (" + xhr.statusText + ")");
    return null;
}

/*
 * Note: does not currently handle negative, nor non-Integers as expected.
 */
util.padZeros = function(number, n) {
    n = n || 2;
    var str = number.toString();

    while (str.length < n) {
        str = '0' + str;
    }

    return str;
}

util.formatTimeZone = function(d) {
    var offset = d.getTimezoneOffset();
    var hours = Math.floor(-1 * offset / 60);
    var minutes = offset % 60;
    var sign = (hours < 0) ? '-' : '+';

    return sign + this.padZeros(Math.abs(hours)) + ':' + this.padZeros(minutes);
}

util.getTimeStamp = function(d) {

    return d.getFullYear() + '-' +
        this.padZeros(d.getMonth() + 1) + '-' +
        this.padZeros(d.getDate()) + 'T' +
        this.padZeros(d.getHours()) + ':' +
        this.padZeros(d.getMinutes()) + ':' +
        this.padZeros(d.getSeconds()) + '.' +
        this.padZeros(d.getMilliseconds(), 3) +
        this.formatTimeZone(d);
}
