

chrome.history.onVisited.addListener(function(result) {
	try {
		if (browser.util.shouldLogUrl(result.url)) {
			logger.info("Sending Direct, " + result.url);
			client.sendURL(result.url, result.title, new Date(result.lastVisitTime), "Direct", null, null);
		} else {
			logger.info("chrome.history.onVisited : ignoring URL, not sending to API : " + result.url);
		}
	} catch (e) {
		util.errorHandler("chrome.history.onVisited : caught error, sending log to API likely failed : " + e + " : " + result.url)

			//default to allow (fail open)
	}
});

//Eventually it'd be good to use onResponseStarted, onBeforeRedirect, & onErrorOccurred (instead of onBeforeRequest),
// but we're seeing cases that slip through those, or could cause double-counting - need to readdress later.
chrome.webRequest.onBeforeRequest.addListener(
	function(info) {
		try {
			if ((browser.util.shouldLogUrl(info.url)) && (info.type != "main_frame")) {
				client.sendURL(info.url, info.title, new Date(), "Indirect", null, info.ip);
			}
			else {
				logger.info("chrome.webRequest.onResponseStarted : ignoring URL, not sending to API : " + info.url);
			}
		} catch (e) {
			util.errorHandler("chrome.webRequest.onResponseStarted : caught error, sending log to API likely failed : " + e);

			//default to allow (fail open)
		}
	},
     
	{urls: [
		"http://*/*",
		"https://*/*"
    ]}
);
