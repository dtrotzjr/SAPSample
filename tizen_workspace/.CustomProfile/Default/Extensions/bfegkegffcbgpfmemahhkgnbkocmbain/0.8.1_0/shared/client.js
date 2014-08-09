//Depends on util, browser, logger
var client = {}

client.getUserKeys = function() {
	logger.debug("Requesting user keys");

	client.sendAsyncMessageToClient("/user/dummy/keys.json", client.getUserKeys_reply);
}

client.getUserKeys_reply = function(json) {
	logger.debug("Received user keys from API");

	if (json == null) {
		util.errorHandler("Keys retrieval failed - no JSON returned.");
		return;
	}

	switch (json.result.meta.status) {
		case "Success":
			logger.info("Keys retrieval successful.");

			var basicAuth = json.result.records.basicAuthentication;
			//persist?

			break;

		default:
			logger.error("Keys retrieval failed - unexpected status (" + json.result.meta.status + "): " + json.result.meta);

	}
}

client.sendURL = function(url, title, datetime, visitType, username, ip) {
	username = typeof username !== 'undefined' && username != null ? username : "";
	ip = typeof ip !== 'undefined' && ip != null ? ip : "";

	var payload = {};

	payload.activityRecords = [];
	payload.activityRecords[0] = {};
	payload.activityRecords[0].webActivityRecord = {};
	payload.activityRecords[0].webActivityRecord.timestamp = util.getTimeStamp(datetime);
	payload.activityRecords[0].webActivityRecord.title = title;
	payload.activityRecords[0].webActivityRecord.url = url;
	payload.activityRecords[0].webActivityRecord.visitType = visitType;
	payload.activityRecords[0].webActivityRecord.ip = ip;

	payload.client = browser.getUserAgent();
	
	client.sendAsyncMessageToClient("/user//report/activity_log.json?system_username=" + username, payload, client.sendURL_reply);
}

client.sendURL_reply = function(json) {
	if (json == null) {
		logger.error("Sending URL failed - no JSON returned.");
		return;
	}

	switch (json.result.meta.status) {
		case "Success":
			logger.info("Sending URL successful.");
			break;

		default:
			util.errorHandler("Sending URL failed - unexpected status (" + json.result.meta.status + "): " + json.result.meta);

	}
}

client.sendAsyncMessageToClient = function(path, payloadJSON, callbackFunction) {

	try {
	    var url = "http://" + settings.api.url +
	                path;
	                
	    var payload = JSON.stringify(payloadJSON);

	    var req = new XMLHttpRequest();
	    req.mozBackgroundRequest = true; //otherwise, Firefox pops up to user on failure...fail.
	    req.open('POST', url, true);

	    req.onreadystatechange = function (event) {
	        try {
	            if (req.readyState !== 4) {
	                return;
	            }

			    logger.debug("asynchronous response from " + url + " | " + req.status + " - " + req.statusText +
					" | Content-type: " + req.getResponseHeader("Content-Type") + 
			    	" | Message: " + req.responseText);

	            callbackFunction(util.parseJsonResponse(req));
	        } catch (e) {
	            logger.error(path + " : caught error, sending log to API likely failed : " + e);
	        }
	    }

	    logger.debug("asynchronous POST to " + url + " | " + payload);

	    req.send(payload);

	    return true;
	} catch (e) {
		logger.exception(e, "catching & throwing exception in client.sendAsyncMessageToClient" + 
					" | path: " + path + 
					" | payloadJSON: " + payloadJSON + 
					" | callbackFunction: " + (callbackFunction == null ? "null" : "not null"));
		throw e;
	}
}

client.sendMessageToClient = function(path, payloadJSON, callbackFunction) {

	try {
	    var url = "http://" + settings.api.url +
	                path;

	    var payload = JSON.stringify(payloadJSON);

	    var req = new XMLHttpRequest();
	    req.mozBackgroundRequest = true; //otherwise, Firefox pops up to user on failure...fail.
	    req.open('POST', url, false);

	    logger.debug("synchronous POST to " + url + " | " + payload);

	    req.send(payload);

	    logger.debug("synchronous response from " + url + " | " + req.status + " - " + req.statusText +
			" | Content-type: " + req.getResponseHeader("Content-Type") + 
	    	" | Message: " + req.responseText);

	    var result = util.parseJsonResponse(req);

	    if (callbackFunction) {
	    	callbackFunction(result);
	    	return true;
	    }

	    return result;

	} catch (e) {
		util.errorHandler(e, "catching & throwing exception in client.sendMessageToClient" + 
					" | path: " + path + 
					" | payloadJSON: " + payloadJSON + 
					" | callbackFunction: " + (callbackFunction == null ? "null" : "not null"));
		throw e;
	}
}
