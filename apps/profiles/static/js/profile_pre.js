function renderProfilePreview(profileObj, idToAppend, type, actions){
    const profileRenderFunc = Handlebars.templates["userpreview.hbs"];
    const connectionId = profileObj['id'];
    const newProfilePreviewId = "id_" + type + "_" + connectionId;

    const hbContext = {};
    hbContext['profileLink'] = Urls['userprofile-detail'](connectionId);
    hbContext['colWidth'] = 5;
    hbContext['thumbnail'] = profileObj.thumbnail;
    hbContext['real_name'] = profileObj.real_name;
    hbContext['user_name'] = profileObj.user_name;
    hbContext['domId'] = newProfilePreviewId;
    for (var i = 0; i < actions.length; i++){
        actions[i].argId = profileObj.id;
    }
    hbContext['actions'] = actions;

    const newProfilePreview = createElementFromHTML(profileRenderFunc(hbContext));

    const whereToAppend = document.getElementById(idToAppend);
    whereToAppend.appendChild(newProfilePreview);
}

function renderConnections(connectionsObj, containerId){
    const connectionsArray = connectionsObj.results;
    document.getElementById(containerId).innerHTML = "";

    const actions = [{href: '#', toggle: 'modal', target: '#deleteConnectionModal', iconClasses: 'fas fa-fw fa-user-minus'}];

    for (var i = 0; i < connectionsArray.length; i++){
        renderProfilePreview(connectionsArray[i].connection, containerId, "connection", actions);
    }
}

function sendConnectionRequest(){
    const profileId = parseInt(document.getElementById("id_profile_id").value);
    const noteContent = document.getElementById("id_msg_textarea").value;

    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-request-create']() + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'recipient': profileId, 'note': noteContent}));
}

function acceptConnectionRequest(){
    const profileId = parseInt(document.getElementById("id_profile_id").value);

    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-request-accept-by-userid'](profileId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('PATCH', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'accepted': true}));
}

function deleteConnectionOrRequest(){
    const profileId = parseInt(document.getElementById("id_profile_id").value);

    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-request-delete-by-userid'](profileId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadConnections(userId, containerId) {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-list-others'](userId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderConnections(responseAsJSON, containerId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function startThread(){
    const chosenRecipientUsers = [parseInt(document.getElementById("id_profile_id").value)];

    const targetUrl = Urls['api-chatthread-start']() + "?format=json";

    const inputElem = document.getElementById("id_subject_input");
    const content = inputElem.value;

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                location.href = Urls['messages-overview']();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'recipient_users': chosenRecipientUsers, 'subject': content}));
}

function loadMyConnections(containerId) {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-list']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var responseAsJSON = JSON.parse(xhr.responseText);
                renderConnections(responseAsJSON, containerId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}