function renderChatThreads(dataArray){
    const threadList = document.getElementById("id_div_messageheads");
    threadList.innerHTML = "";
    const threadRenderFunc = Handlebars.templates["chatthread.hbs"];

    for (var i = 0; i < dataArray.length; i++){
        const domId = "id_div_messagehead_" + dataArray[i].id;

        const hbContext = {};
        hbContext['thread'] = dataArray[i];
        hbContext['last_message_timestamp'] = prettyPrintDateTime(dataArray[i].last_message_timestamp);
        hbContext['domId'] = domId;

        const newMessageHead = createElementFromHTML(threadRenderFunc(hbContext));
        threadList.appendChild(newMessageHead);

        newMessageHead.addEventListener("click", function() { const idNo = this.getAttribute("data-threadId"); loadThreadMessages(idNo); }, false);
    }
}

function appendChatMessage(messageObj, divId, chatInitiatorId){
    const messageList = document.getElementById(divId);

    const myMsgRenderFunc = Handlebars.templates["chatmsg_mine.hbs"];
    const theirMsgRenderFunc = Handlebars.templates["chatmsg_theirs.hbs"];

    const domId = "id_div_message_" + messageObj.id;
    let newMessage;

    const hbContext = {};
    hbContext['msg'] = messageObj;
    hbContext['domId'] = domId;
    hbContext['sent_timestamp'] = prettyPrintDateTime(messageObj.sent_timestamp);

    const senderId = messageObj.sender.id;
    if (parseInt(chatInitiatorId) === parseInt(senderId)){
        newMessage = createElementFromHTML(myMsgRenderFunc(hbContext));
    } else {
        newMessage = createElementFromHTML(theirMsgRenderFunc(hbContext));
    }
    messageList.appendChild(newMessage);
}

function renderChatMessages(messagesArray, chatId){
    const messageList = document.getElementById("id_div_messagebody");
    messageList.setAttribute("activeChatId", chatId);
    messageList.innerHTML = "";
    const me = JSON.parse(sessionStorage.getItem('me'))['id'];

    for (var i = 0; i < messagesArray.length; i++){
        appendChatMessage(messagesArray[i], "id_div_messagebody", me);
    }
    messageList.scrollTop = messageList.scrollHeight - messageList.clientHeight;
}

function sendMessageToChat(threadId, inputId){
    const targetUrl = Urls['api-messages-in-chat-send'](threadId) + "?format=json";

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
                inputElem.value = "";
                loadThreadMessages(threadId);
                loadMyThreads();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'content': content, 'thread': threadId}));
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

function loadMyThreads() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-chatthreads-list']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('chatthreads', xhr.responseText);
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderChatThreads(responseAsJSON.results);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function displayThreadDetailColumn(){
    const threadInfo = document.getElementById("id_div_threadinfo");
    threadInfo.classList.remove("d-none");
    threadInfo.classList.remove("d-flex");
}

function loadThreadMessages(threadId) {
    document.getElementById("id_div_chatinput").classList.remove("d-none");
    displayThreadDetailColumn();
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-messages-in-chat-list'](threadId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('chatmessages', xhr.responseText);
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderChatMessages(responseAsJSON.results, threadId);
                renderChatInfo(threadId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function renderChatInfo(chatId){
    const chatInfoData = JSON.parse(sessionStorage.getItem('chatthreads'));
    const selectedChatData = (chatInfoData.results.filter(({id}) => parseInt(id) === parseInt(chatId)))[0];
    fillChildren("id_div_threadinfo", selectedChatData);
    document.getElementById("id_div_threadinfo").classList.remove("d-none");

    if (selectedChatData.recipient_groups.length > 0) {
        document.getElementById("id_container_recipient_groups").classList.remove("d-none");
    } else {
        document.getElementById("id_container_recipient_groups").classList.add("d-none");
    }

    if (selectedChatData.recipient_users.length > 0) {
        document.getElementById("id_container_recipient_users").classList.remove("d-none");
    } else {
        document.getElementById("id_container_recipient_users").classList.add("d-none");
    }
}

function getUserNamesAsList(threadObj, linked){
    let res = '';
    res += '<div class="row py-2"><div class="col-1"></div><div class="col-auto px-1">' + getRoundUserAvatarThumbnail(threadObj.initiator) + '</div><div class="col px-1">' + getUserName(threadObj.initiator, linked) + '</div></div>';
    for (var i = 0; i < threadObj.recipient_users.length; i++){
        res += '<div class="row py-2"><div class="col-1"></div><div class="col-auto px-1">' + getRoundUserAvatarThumbnail(threadObj.recipient_users[i]) + '</div><div class="col px-1">' + getUserName(threadObj.recipient_users[i], linked) + '</div></div>';
    }
    return res;
}

function getUserName(userTupleObj, linked){
    const current_key = userTupleObj.id;
    const current_user_name = userTupleObj.user_name;
    const userUrl = Urls['userprofile-detail'](current_key);
    if (linked) {
        return '<a href="' + userUrl + '">' + escapeHtml(current_user_name) + '</a>';
    } else {
        return escapeHtml(current_user_name);
    }
}

function getLinkedUserName(userTupleObj){
    return getUserName(userTupleObj, true);
}

function getUnlinkedUserName(userTupleObj){
    return getUserName(userTupleObj, false);
}

function getRoundUserAvatarThumbnail(userTupleObj){
    const thumbUrl = userTupleObj.thumbnail;
    return '<img alt="avatar" class="border rounded-circle" src="' + thumbUrl + '" width="50" height="50" />';
}

function getLinkedUserProfilesAsList(threadObj){
    return getUserNamesAsList(threadObj, true);
}

function getOrgName(orgTupleObj, linked){
    const current_key = Object.keys(orgTupleObj)[0];
    const current_org_name = orgTupleObj[current_key];
    const orgUrl = Urls['org-detail'](current_key);
    if (linked) {
        return '<a href="' + orgUrl + '">' + escapeHtml(current_org_name) + '</a>';
    } else {
        return escapeHtml(current_org_name);
    }
}

function getLinkedOrgList(orgArray){
    let res = '<ul>';
    for (var i = 0; i < orgArray.length; i++){
        res += '<li>' + getOrgName(orgArray[i], true) + '</li>';
    }
    res += '</ul>';
    return res;
}

function getOrgListAsCSV(orgArray){
    let res = '';
    for (var i = 0; i < orgArray.length; i++){
        res += getOrgName(orgArray[i], false) + ', ';
    }
    res = res.slice(0, -2);
    return res;
}

translators = {
    "linkedUserProfilesList": getLinkedUserProfilesAsList,
    "linkedUserName": getLinkedUserName,
    "unlinkedUserName": getUnlinkedUserName,
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedOrgList": getLinkedOrgList,
    "unlinkedOrgCSV": getOrgListAsCSV,
    "prettyPrintDateTime": prettyPrintDateTime
}

function startThread(){
    const chosenRecipientUsers = choicesConnections.getValue().map(a => a.value);
    const chosenRecipientGroups = choicesNationalOrgs.getValue().map(a => a.value);

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
                loadMyThreads();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'recipient_users': chosenRecipientUsers, 'recipient_groups': chosenRecipientGroups, 'subject': content}));
}

window.addEventListener("load", loadMyThreads, false);
window.addEventListener("load", getMe, false);