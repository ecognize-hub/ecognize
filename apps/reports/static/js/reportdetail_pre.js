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

function fillMessages(messages){
    const ctid = parseInt(document.getElementById("id_ctid_report_comment").value);
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
    const ctid = parseInt(document.getElementById("id_ctid_report_comment").value);
    if (!obj.thanked)
        return '<span data-objid="' + obj.id + '" data-ctid="' + ctid +  '" id="id_thankbtn_' + ctid + '_' + obj.id +  '"><i title="Thank the author for this" class="far fa-handshake"></i>&nbsp;+1</span>';
    else
        return '<span data-objid="' + obj.id + '" data-ctid="' + ctid +  '" id="id_thankbtn_' + ctid + '_' + obj.id +  '"><i title="Unthank" class="fas fa-handshake-slash"></i>&nbsp;-1</span>';
}

function getThanksStats(obj){
    const ctid = parseInt(document.getElementById("id_ctid_report_comment").value);
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
    "addSendButton": addSendButton,
    "thanksStats": getThanksStats,
    "thanksButton": getThanksButton
}

function sendMessageToThread(threadId, inputId){
    const targetUrl = Urls['api-report-commentthreads-send'](document.getElementById("id_report_id").value, threadId) + "?format=json";

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
                loadReportComments();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'content': content, 'thread': threadId}));
}

function renderReportComments(dataArray){
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
        fillMessages(dataArray[i].comments);
        document.getElementById("btn_send_" + dataArray[i].id).addEventListener("click", function(e){ const id = e.target.id.split("_")[2]; sendMessageToThread(id, 'id_msg_textarea_' + id); });
    }
}

function loadReportComments() {
    const xhr = new XMLHttpRequest();
    const reportId = document.getElementById("id_report_id").value;
    const targetUrl = Urls['api-report-commentthreads-list'](reportId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderReportComments(responseAsJSON.results);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function startThread(){
    const reportId = parseInt(document.getElementById("id_report_id").value);
    const targetUrl = Urls['api-report-commentthreads-start'](reportId) + "?format=json";

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
    threadXhr.send(JSON.stringify({'report': reportId}));
}