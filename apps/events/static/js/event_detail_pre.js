var choicesConnections;

function getUserProfileLink(id){
    const userUrl = Urls['userprofile-detail'](id);
    return '<a href="' + userUrl + '"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

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

function getUserAddLink(id){
    return '<a href="#" data-toggle="modal" data-target="#addUserAsConnectionModal" data-profile-id="' + id + '"><i class="fas fa-fw fa-user-plus"></i></a>';
}

function getUserProfileAndAddLink(id){
    return getUserAddLink(id) + getUserProfileLink(id);
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

function fillMessages(messages){
    const ctid = parseInt(document.getElementById("id_ctid_eventthreadmessage").value);
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
    return '<button class="btn btn-primary" id="btn_send_' + id + '">Send</button>';
}

function getThanksButton(obj){
    const ctid = parseInt(document.getElementById("id_ctid_eventthreadmessage").value);
    if (!obj.thanked)
        return '<span data-objid="' + obj.id + '" data-ctid="' + ctid +  '" id="id_thankbtn_' + ctid + '_' + obj.id +  '"><i title="Thank the author for this" class="far fa-handshake"></i>&nbsp;+1</span>';
    else
        return '<span data-objid="' + obj.id + '" data-ctid="' + ctid +  '" id="id_thankbtn_' + ctid + '_' + obj.id +  '"><i title="Unthank" class="fas fa-handshake-slash"></i>&nbsp;-1</span>';
}

function getThanksStats(obj){
    const ctid = parseInt(document.getElementById("id_ctid_eventthreadmessage").value);
    const outerSpan = '<span class="thanksStatNumber" id="id_thankstats_' + ctid + '_' + obj.id + '">'
    if (obj.thanks === 0)
        return outerSpan + '' + "</span>";
    else
        return outerSpan + obj.thanks + "</span>";
}

translators = {
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedAvatarThumbnail": getLinkedRoundUserAvatarThumbnail,
    "linkedUsername": getLinkedUsername,
    "linkedRealName": getLinkedRealName,
    "setContainerId": setThreadIdOnMsgContainer,
    "fillMessages": fillMessages,
    "prettyPrintDateTime": prettyPrintDateTime,
    "userProfileLink": getUserProfileLink,
    "userProfileAndAddLink": getUserProfileAndAddLink,
    "addSendButton": addSendButton,
    "thanksStats": getThanksStats,
    "thanksButton": getThanksButton
}

function renderMemberList(membersObj, containerId, prefix){
    document.getElementById(containerId).innerHTML = "";
    const membersArray = membersObj.results;

    for (var i = 0; i < membersArray.length; i++){
        renderProfilePreview(membersArray[i], containerId, prefix);
    }
}

function renderProfilePreview(profileObj, idToAppend, prefix){
    const profileRenderFunc = Handlebars.templates["userpreview.hbs"];
    const connectionId = profileObj['id'];
    const newProfilePreviewId = "id_" + prefix + "_" + connectionId;

    const hbContext = {};
    hbContext['profileLink'] = Urls['userprofile-detail'](connectionId);
    hbContext['colWidth'] = 5;
    hbContext['thumbnail'] = profileObj.thumbnail;
    hbContext['real_name'] = profileObj.real_name;
    hbContext['user_name'] = profileObj.user_name;
    hbContext['domId'] = newProfilePreviewId;

    const newProfilePreview = createElementFromHTML(profileRenderFunc(hbContext));

    const whereToAppend = document.getElementById(idToAppend);
    whereToAppend.appendChild(newProfilePreview);
}

function loadParticipants() {
    const xhr = new XMLHttpRequest();
    const eventId = parseInt(document.getElementById("id_event_id").value);
    const targetUrl = Urls['api-events-participants-list'](eventId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderMemberList(responseAsJSON, "id_participants_container", "participant");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadInvited() {
    const xhr = new XMLHttpRequest();
    const eventId = parseInt(document.getElementById("id_event_id").value);
    const targetUrl = Urls['api-events-invited-list'](eventId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderMemberList(responseAsJSON, "id_invited_container", "invited");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function sendMessageToThread(threadId, inputId){
    const targetUrl = Urls['api-event-thread-message-send'](document.getElementById("id_event_id").value, threadId) + "?format=json";

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
                loadEventThreads();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'content': content, 'thread': threadId}));
}

function renderEventThreads(dataArray){
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

function deleteEvent(){
    const id = document.getElementById("id_event_id").value;
    const targetUrl = Urls['api-events-delete'](id) + "?format=json";

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                displaySuccessMessage("Event successfully deleted.");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadEventThreads() {
    const xhr = new XMLHttpRequest();
    const id = document.getElementById("id_event_id").value;
    const targetUrl = Urls['api-events-threads-list'](id) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderEventThreads(responseAsJSON.results);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function inviteConnectionsToEvent() {
    const chosenRecipientUsers = choicesConnections.getValue().map(a => a.value);
    const eventId = parseInt(document.getElementById("id_event_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-events-invite-contact'](eventId) + "?format=json";
    xhr.open('POST', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loadInvited();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'users': chosenRecipientUsers}));
}

function participateInEvent() {
    const eventId = parseInt(document.getElementById("id_event_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-events-participate'](eventId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
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

function cancelParticipationInEvent() {
    const eventId = parseInt(document.getElementById("id_event_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-events-cancel'](eventId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
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

function startThread(){
    const eventId = parseInt(document.getElementById("id_event_id").value);
    const targetUrl = Urls['api-events-threads-new'](eventId) + "?format=json";

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
                displayErrors(JSON.parse(threadXhr.responseText));
            }
        }
    };
    threadXhr.send(JSON.stringify({'event': eventId}));
}

// TODO to complete
function manageParticipation(myProfileId, adminList, cohostList, invitedList, participantList ) {
    var participationMgmtContainer = document.getElementById("participationMgmt");

}