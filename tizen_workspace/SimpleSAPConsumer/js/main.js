var SAAgent = null;
var SASocket = null;
var CHANNELID = 123;
var ProviderAppName = "SimpleSAPProvider";

function createHTML(log_string) {
	var log = document.getElementById("resultBoard");
	log.innerHTML = log.innerHTML + "<br> : " + log_string;
}

function onerror(err) {
	console.log("ONERROR: err [" + err.name + "] msg [" + err.message + "]");
}

var agentCallback = {
	onconnect : function(socket) {
		console.log("agentCallback onconnect" + socket);
		SASocket = socket;
		alert("SAP Connection established with RemotePeer");
		createHTML("startConnection");
		SASocket.setSocketStatusListener(function(reason) {
			console.log("Service connection lost, Reason: [" + reason + "]");
			disconnect();
		});
	},
	onerror : onerror
};

var peerAgentFindCallback = {
	onpeeragentfound : function(peerAgent) {
		try {
			if (peerAgent.appName == ProviderAppName) {
				console.log("peerAgentFindCallback::onpeeragentfound "
						+ peerAgent.appName + " || " + ProviderAppName);
				SAAgent.setServiceConnectionListener(agentCallback);
				SAAgent.requestServiceConnection(peerAgent);
			} else {
				console.log("peerAgentFindCallback::onpeeragentfound  else");
				alert("Not expected app!! : " + peerAgent.appName);
			}
		} catch (err) {
			console.log("peerAgentFindCallback::onpeeragentfound exception: [ "
					+ err.name + "] msg[" + err.message + "]");
		}
	},
	onerror : onerror
}

function onsuccess(agents) {
	try {
		if (agents.length > 0) {
			SAAgent = agents[0];

			SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
			SAAgent.findPeerAgents();
			console.log(" onsuccess " + SAAgent.name);
		} else {
			alert("Not found SAAgent!");
			console.log(" onsuccess else");
		}
	} catch (err) {
		console.log("onsuccess exception: [ " + err.name + "] msg["
				+ err.message + "]");
	}
}

function onreceive(channelId, data) {
	createHTML(data);
}

function connect() {
	if (SASocket) {
		alert('Already connected');
		return false;
	}
	try {
		webapis.sa.requestSAAgent(onsuccess, onerror);
	} catch (err) {
		console.log(" connect exception: [ " + err.name + " ] msg[ "
				+ err.message + " ]");
	}
}

function fetch() {
	try {
		SASocket.setDataReceiveListener(onreceive);
		SASocket.sendData(CHANNELID, "");
	} catch (err) {
		console.log(" fetch exception: [ " + err.name + "] msg[" + err.message
				+ "]");
	}
}

function disconnect() {
	try {
		if (SASocket != null) {
			console.log("DISCONNECT SASOCKET NOT NULL");
			SASocket.close();
			SASocket = null;
			createHTML("closeConnection");
		}
	} catch (err) {
		console.log(" disconnect exception: [ " + err.name + "] msg["
				+ err.message + "]");
	}
}

window.onload = function() {
	document.addEventListener('tizenhwkey', function(e) {
		if (key.name == "back")
			tizen.application.getCurrentApplication().exit();
	});
};
