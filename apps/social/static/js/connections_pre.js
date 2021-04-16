function getRoundUserAvatarThumbnail(thumbUrl){
    return '<img alt="avatar" class="border rounded-circle" src="' + thumbUrl + '" width="50" height="50" />';
}

function getUserProfileLink(id){
    const userUrl = Urls['userprofile-detail'](id);
    return '<a href="' + userUrl + '"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

function getUserAddLink(id){
    return '<a href="#" data-toggle="modal" data-target="#addUserAsConnectionModal" data-profile-id="' + id + '"><i class="fas fa-fw fa-user-plus"></i></a>';
}

function getRequestDeleteLink(id){
    return '<a href="#" data-toggle="modal" data-target="#deleteConnectionRequestModal" data-connection-id="' + id + '"><i class="fas fa-fw fa-trash-alt"></i></a>';
}

function getConnectionDeleteLink(id){
    return '<a href="#" data-toggle="modal" data-target="#deleteConnectionModal" data-connection-id="' + id + '"><i class="fas fa-fw fa-user-minus"></i></a>';
}

function getRequestAcceptLink(id){
    return '<a href="#" data-toggle="modal" data-target="#acceptConnectionModal" data-connection-id="' + id + '"><i class="fas fa-fw fa-check"></i></a>';
}

function getUserProfileAndAddLink(id){
    return getUserAddLink(id) + getUserProfileLink(id);
}

function getUserProfileAndRemoveRequestLink(id){
    return getRequestDeleteLink(id) + getUserProfileLink(id);
}

function getUserProfileAndRemoveConnectionLink(id){
    return getConnectionDeleteLink(id) + getUserProfileLink(id);
}

function getLinkedRoundUserAvatarThumbnail(userObj){
    const userUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + userUrl + '" title="View user profile"><img alt="avatar" class="border rounded-circle" src="' + userObj.thumbnail + '" width="50" height="50" /></a>';
}

function getLinkedUsername(userObj){
    const userUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + userUrl + '" title="View user profile">' + userObj.user_name + '</a>';
}

function getLinkedRealName(userObj){
    const userUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + userUrl + '" title="View user profile">' + userObj.real_name + '</a>';
}

translators = {
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedAvatarThumbnail": getLinkedRoundUserAvatarThumbnail,
    "linkedUserName": getLinkedUsername,
    "linkedRealName": getLinkedRealName,
    "userAddLink": getUserAddLink,
    "userProfileLink": getUserProfileLink,
    "userProfileAndAddLink": getUserProfileAndAddLink,
    "userProfileAndRemoveRequestLink": getUserProfileAndRemoveRequestLink,
    "userProfileAndRemoveConnectionLink": getUserProfileAndRemoveConnectionLink,
    "requestDeleteLink": getRequestDeleteLink,
    "connectionDeleteLink": getConnectionDeleteLink,
    "requestAcceptLink": getRequestAcceptLink
}

function renderMyConnections(connectionsObj, containerId){
    const connectionsArray = connectionsObj.results;
    document.getElementById(containerId).innerHTML = "";

    const actions = [{href: '#', toggle: 'modal', target: '#deleteConnectionModal', iconClasses: 'fas fa-fw fa-user-minus'}];

    for (var i = 0; i < connectionsArray.length; i++){
        renderProfilePreview(connectionsArray[i].connection, containerId, "connection", actions);
    }
}

function renderMySentConnectionRequests(connectionsObj, containerId){
    const connectionsArray = connectionsObj.results;
    document.getElementById(containerId).innerHTML = "";

    const actions = [{href: '#', toggle: 'modal', target: '#deleteConnectionRequestModal', iconClasses: 'fas fa-fw fa-trash-alt'}];

    for (var i = 0; i < connectionsArray.length; i++){
        renderProfilePreview(connectionsArray[i].connection, containerId, "connectionrequest", actions);
    }
}

function renderMyReceivedConnectionRequests(connectionsObj, containerId){
    const connectionsArray = connectionsObj.results;
    document.getElementById(containerId).innerHTML = "";

    const actions = [{href: '#', toggle: 'modal', target: '#acceptConnectionModal', iconClasses: 'fas fa-fw fa-check'},
                     {href: '#', toggle: 'modal', target: '#deleteConnectionRequestModal', iconClasses: 'fas fa-fw fa-trash-alt'}
    ];

    for (var i = 0; i < connectionsArray.length; i++){
        renderProfilePreview(connectionsArray[i].connection, containerId, "connectionrequest", actions);
    }
}

function renderSearchResults(connectionsObj, containerId){
    document.getElementById(containerId).innerHTML = "";
    const connectionsArray = connectionsObj.results;

    const actions = [{href: '#', toggle: 'modal', target: '#addUserAsConnectionModal', iconClasses: 'fas fa-fw fa-user-plus'}];

    for (var i = 0; i < connectionsArray.length; i++){
        renderProfilePreview(connectionsArray[i], containerId, "profilepreview", actions);
    }
}

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

function loadMyConnections(containerId) {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-list']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var responseAsJSON = JSON.parse(xhr.responseText);
                renderMyConnections(responseAsJSON, containerId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMySentConnectionRequests() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-request-sent']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                if (responseAsJSON.results.length > 0){
                    document.getElementById("id_requests_outer_container").classList.remove("d-none");
                    document.getElementById("id_requests_separator").classList.remove("d-none");
                    renderMySentConnectionRequests(responseAsJSON, "id_sent_requests_container");
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMyReceivedConnectionRequests() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-request-received']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                if (responseAsJSON.results.length > 0){
                    document.getElementById("id_requests_outer_container").classList.remove("d-none");
                    document.getElementById("id_requests_separator").classList.remove("d-none");
                    renderMyReceivedConnectionRequests(responseAsJSON, "id_received_requests_container");
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function deleteConnectionOrRequest(targetId, prefix){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-request-delete'](targetId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                // deletion successful
                var connectionReqDOMElem = document.getElementById(prefix + targetId);
                connectionReqDOMElem.remove();
                displaySuccessMessage("Contact removed.");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function acceptConnectionRequest(id){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-request-accept'](id) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('PATCH', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                displaySuccessMessage("Contact added.");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'accepted': true}));
}

function doProfileSearch() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-profile-search']() + "?format=json";
    const chosenCountries = choicesCountries.getValue().map(a => a.value).join(",");
    const chosenTypes = choicesTypes.getValue().map(a => a.value).join(",");
    const searchString = document.getElementById("id_search_box").value;
    xhr.open('GET', targetUrl + "&search=" + searchString + "&countries=" + chosenCountries + "&types=" + chosenTypes, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderSearchResults(responseAsJSON, "id_searchresults_container");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

async function performConnectionRequest(){
    const targetId = document.getElementById('id_profile_id').value;
    const noteContent = document.getElementById('id_msg_textarea').value;
    sendConnectionRequest(targetId, noteContent);
    await new Promise(r => setTimeout(r, 1000));
    loadMySentConnectionRequests();
}

async function performDeleteConnectionRequest(){
    const targetId = document.getElementById('id_request_id').value;
    deleteConnectionOrRequest(targetId, "id_connectionrequest_");
}

async function performDeleteConnection(){
    const targetId = document.getElementById('id_connection_id').value;
    deleteConnectionOrRequest(targetId, "id_connection_");
}

async function performAcceptConnectionRequest(){
    const targetId = document.getElementById('id_accept_id').value;
    acceptConnectionRequest(targetId);
    // now delete element from sent
    const connectionReqDOMElem = document.getElementById("id_connectionrequest_" + targetId);
    connectionReqDOMElem.remove();
    //now reload connections:
    await new Promise(r => setTimeout(r, 2000));
    loadMyConnections("id_connections_container");
}

function sendConnectionRequest(profileId, noteContent){
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