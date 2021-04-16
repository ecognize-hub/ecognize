document.getElementById("id_btn_sendMessage").addEventListener("click", function(e){ sendMessageToChat(document.getElementById('id_div_messagebody').getAttribute('activeChatId'), 'id_msg_textarea'); });
document.getElementById("id_btn_startThread").addEventListener("click", startThread);

var input = document.getElementById("id_msg_textarea");
input.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    if (document.getElementById("id_enterToSend").checked){
        document.getElementById("id_btn_sendMessage").click();
    }
  }
});

var choicesConnections;
var choicesNationalOrgs;

function loadMyConnections() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-list']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const choicesArray = [];
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    if (responseAsJSON.results[i].connection.real_name === "" || responseAsJSON.results[i].connection.real_name == null){
                        choicesArray.push({value: responseAsJSON.results[i].connection.id, label: responseAsJSON.results[i].connection.user_name, selected: false, disabled: false})
                    } else {
                        choicesArray.push({value: responseAsJSON.results[i].connection.id, label: responseAsJSON.results[i].connection.user_name + " (" + responseAsJSON.results[i].connection.real_name + ")", selected: false, disabled: false})
                    }
                }
                choicesConnections = new Choices('#choices-connections', { removeItemButton: true, silent: true, choices: choicesArray });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadNationalOrgs(){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-orggroups-search-national']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const choicesArray = [];
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    if (responseAsJSON.results[i].local_name === "" || responseAsJSON.results[i].local_name == null){
                        choicesArray.push({value: responseAsJSON.results[i].id, label: responseAsJSON.results[i].display_name, selected: false, disabled: false})
                    } else {
                        choicesArray.push({value: responseAsJSON.results[i].id, label: responseAsJSON.results[i].display_name + " (" + responseAsJSON.results[i].local_name + ")", selected: false, disabled: false})
                    }
                }
                choicesNationalOrgs = new Choices('#choices-national-orgs', { removeItemButton: true, silent: true, choices: choicesArray });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

$('#startNewConvoModal').on('show.bs.modal', function (event) {
  loadMyConnections();
  loadNationalOrgs();
});