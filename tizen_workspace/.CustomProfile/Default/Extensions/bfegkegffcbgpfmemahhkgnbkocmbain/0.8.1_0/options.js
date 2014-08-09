// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("apiURL");
  var apiURL = select.value;
  localStorage["apiURL"] = apiURL;
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);

  chrome.extension.sendRequest({cmd: "apiURL"});

}
// Restores select box state to saved value from localStorage.
function restore_options() {
  var printLogs = localStorage["writeToFile"];
  var print = document.getElementById("print_box");
  if (printLogs) {
    if (printLogs == "true") {
      print.checked = true;
      document.getElementById("status").style.display="block";
    } else {
      print.checked = false;
      document.getElementById("status").style.display="none";
    }
  }
  
  var apiURL = localStorage["apiURL"];
  if (!apiURL) {
    return;
  }
  var select = document.getElementById("apiURL");
  select.value = apiURL;
  
}

function save_button_onClick(evt) {
  try {
    save_options();
  } catch (e) {
    var status = document.getElementById("status");
    status.innerHTML = "An error occurred.";
    throw e;
  } finally {
    evt.preventDefault();
  }
}

function print_change(evt) {
  try {
    var print = document.getElementById("print_box");
    localStorage["writeToFile"] = print.checked;
    if(print.checked == "true")	{
  	  document.getElementById("status").style.display="block";
  	  var CEDebug = "";
      chrome.storage.local.get('CEDebug', function (result) {
        CEDebug = result.CEDebug;
		    var status = document.getElementById("status");
		    status.innerHTML = CEDebug;
      });
    } else {
      document.getElementById("status").style.display="none";
    }
  } catch (e) {
    var status = document.getElementById("status");
    status.innerHTML = "An error occurred.";
    throw e;
  } finally {
    evt.preventDefault();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  restore_options();
  var save_button = document.getElementById("save_button");
  var print = document.getElementById("print_box");
  if (save_button) {
    save_button.addEventListener('click', save_button_onClick);
  }
  if (print) {
    print.addEventListener('change', print_change);
  }
	
  var CEDebug = "";
  var status = document.getElementById("status");
  status.innerHTML = localStorage["CEDebug"];

}, false); 