function getRoundUserAvatarThumbnail(thumbUrl){
    return '<img alt="avatar" class="border rounded-circle" src="' + thumbUrl + '" width="50" height="50" />';
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

function getUserProfileLink(id){
    const userUrl = Urls['userprofile-detail'](id);
    return '<a href="' + userUrl + '" title="View user profile"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

function getRemoveUserFromGroupLink(id){
    return '<a href="#" title="Remove user from group" data-toggle="modal" data-target="#deleteUserFromGroupModal" data-profile-id="' + id + '"><i class="fas fa-users-slash"></i></a>';
}

function getCancelJoinRequestLink(id){
    return '<a href="#" title="Deny request to join" data-toggle="modal" data-target="#denyUserModal" data-profile-id="' + id + '"><i class="fas fa-users-slash"></i></a>';
}

function getAcceptJoinRequestLink(id){
    return '<a href="#" title="Accept request to join" data-toggle="modal" data-target="#admitUserModal" data-profile-id="' + id + '"><i class="fas fa-user-check"></i></a>';
}

function getUserProfileAndAddAndRemoveLink(id){
    return getRemoveUserFromGroupLink(id);
}

function getuserProfileAndAddAndRemoveAndAcceptLink(id){
    return getCancelJoinRequestLink(id) + getAcceptJoinRequestLink(id);
}

function getMe(){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-me']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('me', xhr.responseText);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function fillMessages(messages){
    const ctid = parseInt(document.getElementById("id_ctid_usergroup_comment").value);
    const commentPostRenderFunc = Handlebars.templates["comment_post.hbs"];

    for (var i = 0; i < messages.length; i++){
        const thisMessage = messages[i];
        const domId = "id_msg_" + thisMessage.id;
        const parentId = "id_div_msgCtr_for_thread_" + thisMessage.thread;
        const parentElem = document.getElementById(parentId);

        const hbContext = {};
        hbContext['post'] = thisMessage;
        hbContext['domId'] = domId;
        hbContext['authorProfileLink'] = Urls['userprofile-detail'](thisMessage.author.id);
        hbContext['author'] = thisMessage.author;
        hbContext['sent_timestamp'] = prettyPrintDateTime(thisMessage.sent_timestamp);
        hbContext['ctid'] = ctid;

        const newMessage = createElementFromHTML(commentPostRenderFunc(hbContext));
        parentElem.appendChild(newMessage);

        const thank_button = document.getElementById("id_thankbtn_" + ctid + "_" + messages[i].id);
        thank_button.addEventListener("click", function (e){
            const ctid = parseInt(e.target.parentNode.getAttribute("data-ctid"));
            const objid = parseInt(e.target.parentNode.getAttribute("data-objid"));
            toggleThanks(ctid, objid, "id_thankstats_" + ctid + "_" + objid, "id_thankbtn_" + ctid + "_" + objid);
        }, false);

    }
    return "";
}

function setThreadIdOnMsgContainer(id){
    return '<div class="col" id="id_div_msgCtr_for_thread_' + id  + '"></div>';
}

function addSendButton(id){
    return '<button class="btn btn-primary" id="btn_send_' + id +'">Send</button>';
}

translators = {
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedAvatarThumbnail": getLinkedRoundUserAvatarThumbnail,
    "linkedUserName": getLinkedUsername,
    "linkedRealName": getLinkedRealName,
    "setContainerId": setThreadIdOnMsgContainer,
    "fillMessages": fillMessages,
    "prettyPrintDateTime": prettyPrintDateTime,
    "userProfileLink": getUserProfileLink,
    "userProfileAndAddAndRemoveLink": getUserProfileAndAddAndRemoveLink,
    "userProfileAndAddAndRemoveAndAcceptLink": getuserProfileAndAddAndRemoveAndAcceptLink,
    "addSendButton": addSendButton
}

function sendMessageToThread(threadId, inputId){
    const targetUrl = Urls['api-groupmessages-send'](parseInt(document.getElementById("id_usergroup_id").value), threadId) + "?format=json";

    const inputElem = document.getElementById(inputId);
    const content = inputElem.value;

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                loadGroupThreads();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'content': content, 'thread': threadId}));
}

function renderMemberList(connectionsObj, containerId){
    document.getElementById(containerId).innerHTML = "";
    const connectionsArray = connectionsObj.results;
    const is_admin = document.getElementById("id_is_admin").value;

    for (var i = 0; i < connectionsArray.length; i++){
        let actions = [];
        if (is_admin.toLowerCase() === "true") {
            actions = [{
                href: "#",
                toggle: "modal",
                target: "#deleteUserFromGroupModal",
                argId: connectionsArray[i].id,
                iconClasses: "fas fa-users-slash"
            }];
        }
        renderProfilePreview(connectionsArray[i], containerId, actions);
    }
}

function renderApplicantList(connectionsObj, containerId){
    document.getElementById(containerId).innerHTML = "";
    const connectionsArray = connectionsObj.results;
    const is_admin = document.getElementById("id_is_admin").value;
    const join_mode = document.getElementById("id_join_mode").value;

    for (var i = 0; i < connectionsArray.length; i++){
        let actions = [];
        if (is_admin.toLowerCase() === "true") {
            actions = [
                {
                    href: "#",
                    toggle: "modal",
                    target: "#admitUserModal",
                    argId: connectionsArray[i].id,
                    iconClasses: "fas fa-user-check"
                },
                {
                    href: "#",
                    toggle: "modal",
                    target: "#denyUserModal",
                    argId: connectionsArray[i].id,
                    iconClasses: "fas fa-users-slash"
                }
            ];
        } else if (join_mode.toLowerCase() === "m") {
            actions = [
                {
                    href: "#",
                    toggle: "modal",
                    target: "#admitUserModal",
                    argId: connectionsArray[i].id,
                    iconClasses: "fas fa-user-check"
                }
            ];
        }
        renderProfilePreview(connectionsArray[i], containerId, actions);
    }
}

function renderProfilePreview(profileObj, idToAppend, actions){
    const profileRenderFunc = Handlebars.templates["userpreview.hbs"];
    const connectionId = profileObj['id'];
    const domId = "id_member_" + connectionId;

    const hbContext = {};
    hbContext['profileLink'] = Urls['userprofile-detail'](profileObj.id);
    hbContext['thumbnail'] = profileObj.thumbnail;
    hbContext['user_name'] = profileObj.user_name;
    hbContext['real_name'] = profileObj.real_name;
    hbContext['colWidth'] = 5;
    hbContext['actions'] = actions;
    hbContext['domId'] = domId;

    const newProfilePreview = createElementFromHTML(profileRenderFunc(hbContext));

    const whereToAppend = document.getElementById(idToAppend);
    whereToAppend.appendChild(newProfilePreview);
}

function renderGroupThreads(dataArray){
    const threadList = document.getElementById("id_thread_container");
    threadList.innerHTML = "";
    const threadRenderFunc = Handlebars.templates["comment_thread.hbs"];

    for (var i = 0; i < dataArray.length; i++){
        const thisThread = dataArray[i];
        const elemId = "id_div_thread_" + thisThread.id;

        const hbContext = {};
        hbContext['domId'] = elemId;
        hbContext['thread'] = thisThread;
        hbContext['me'] = JSON.parse(sessionStorage.getItem('me'));

        const newThreadHead = createElementFromHTML(threadRenderFunc(hbContext));
        threadList.appendChild(newThreadHead);
        fillMessages(dataArray[i].messages);
        document.getElementById("btn_send_" + dataArray[i].id).addEventListener("click", function(e){ const id = e.target.id.split("_")[2]; sendMessageToThread(id, 'id_msg_textarea_' + id); });
    }
}

function loadGroupThreads() {
    const xhr = new XMLHttpRequest();
    const id = document.getElementById("id_usergroup_id").value;
    const targetUrl = Urls['api-groupthreads-list'](id) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderGroupThreads(responseAsJSON.results);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMembers() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroups-members'](document.getElementById("id_usergroup_id").value) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderMemberList(responseAsJSON, "id_members_container");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadSupplicants() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroups-supplicants'](document.getElementById("id_usergroup_id").value) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderApplicantList(responseAsJSON, "id_join_requests_container");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function requestToJoin() {
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroup-join'](userGroupId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function leaveGroup() {
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroup-leave'](userGroupId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function abortRequestToJoin() {
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroup-cancel'](userGroupId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function deleteGroup(){
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroups-update-delete'](userGroupId);
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                location.href = Urls['group-search']()
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function admitRequestToJoin(profileId) {
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroup-admit'](userGroupId) + "?format=json";
    xhr.open('POST', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loadMembers();
                loadSupplicants();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'user': profileId}));
}

function inviteConnectionsToJoinGroup() {
    const chosenRecipientUsers = choicesConnections.getValue().map(a => a.value);
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroup-invite'](userGroupId) + "?format=json";
    xhr.open('POST', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loadSupplicants();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'users': chosenRecipientUsers}));
}

function removeUserFromGroup(profileId) {
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroup-remove'](userGroupId) + "?format=json";
    xhr.open('POST', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loadMembers();
                loadSupplicants();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'user': profileId}));
}

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

function denyRequestToJoin(profileId) {
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroup-deny'](userGroupId) + "?format=json";
    xhr.open('POST', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loadSupplicants();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'user': profileId}));
}

function startThread(){
    const userGroupId = parseInt(document.getElementById("id_usergroup_id").value);
    const targetUrl = Urls['api-groupthreads-new'](userGroupId) + "?format=json";

    const subjectElem = document.getElementById("id_subject_input");
    const subject = subjectElem.value;

    const csrftoken = getCookie('csrftoken');
    const threadXhr = new XMLHttpRequest();
    threadXhr.open('POST', targetUrl, true);
    threadXhr.setRequestHeader("X-CSRFToken", csrftoken);
    threadXhr.setRequestHeader('Content-Type', 'application/json');
    threadXhr.onload = function() {
        if (threadXhr.readyState === 4) {
            if (threadXhr.status === 201) {
                const newThreadId = JSON.parse(threadXhr.responseText).id;
                sendMessageToThread(newThreadId, "id_post_textarea");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    threadXhr.send(JSON.stringify({'subject': subject, 'user_group': userGroupId}));
}

window.addEventListener("load", getMe, false);
window.addEventListener("load", loadMembers, false);
window.addEventListener("load", loadSupplicants, false);
window.addEventListener("load", loadGroupThreads, false);