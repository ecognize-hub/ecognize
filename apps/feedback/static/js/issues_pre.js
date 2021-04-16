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

function getRoundUserAvatarThumbnail(avatarUrl){
    return '<img alt="avatar" class="border rounded-circle" src="' + avatarUrl + '" width="50" height="50" />';
}

function getLinkedAvatarThumbnail(userObj){
    const baseUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + baseUrl + '">' + getRoundUserAvatarThumbnail(userObj.thumbnail) + '</a>';
}

function getLinkedUsername(userObj){
    const baseUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + baseUrl + '">' + userObj.user_name + '</a>';
}

function getLinkedRealName(userObj){
    const baseUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + baseUrl + '">(' + userObj.real_name + ')</a>';
}

function getIssueTypeIcon(issueTypeAsChar){
    if (issueTypeAsChar === 'C'){
        return '<span class="badge badge-secondary"><i class="fas fa-fw fa-sync"></i>&nbsp;Change request</span>';
    } else if (issueTypeAsChar === 'F'){
        return '<span class="badge badge-secondary"><i class="fas fa-fw fa-plus"></i>&nbsp;Feature request</span>';
    } else if (issueTypeAsChar === 'B'){
        return '<span class="badge badge-secondary"><i class="fas fa-fw fa-bug"></i>&nbsp;Bug report</span>';
    } else {
        displayErrorMessage("Error");
        return '<i class="fas fa-fw fa-exclamation-triangle"></i>';
    }
}

function getIssueTypeBadge(issueTypeAsChar){
    if (issueTypeAsChar === 'C'){
        return {title: "Change request", iconClasses: "fas fa-fw fa-sync", text: "Change request"};
    } else if (issueTypeAsChar === 'F'){
        return {title: "Feature request", iconClasses: "fas fa-fw fa-plus", text: "Feature request"};
    } else if (issueTypeAsChar === 'B'){
        return {title: "Bug report", iconClasses: "fas fa-fw fa-bug", text: "Bug report"};
    } else {
        displayErrorMessage("Error");
        return {title: "Error", iconClasses: "fas fa-fw fa-bug", text: "Error rendering this issue"};
    }
}

function showHideCommentsButton(id){
    return '<button id="button_showhidecomments_' + id + '" class="btn btn-secondary font-weight-light">Show comments</button>';
}

function createCommentsContainer(id){
    return '<div class="col d-none" id="comments_' + id + '"></div>'
}

function getUpvoteButtons(numOfUpvotes){
    return '<h4><i class="fas fa-chevron-up"></i><br/>' + numOfUpvotes + '<br/><i class="fas fa-chevron-down d-none"></i></h4>';
}

function addSendButton(id){
    return '<button class="btn btn-primary" id="btn_send_' + id +'">Send</button>';
}

function getIssueStateBadge(issueStateAsChar){
    if (issueStateAsChar === 'W'){
        return {title: "Work in progress", iconClasses: "fas fa-fw fa-hourglass-start", text: "In progress"};
    } else if (issueStateAsChar === 'D'){
        return {title: "Complete", iconClasses: "fas fa-fw fa-check", text: "Done"};
    } else if (issueStateAsChar === 'O'){
        return {title: "Open", iconClasses: "fas fa-fw fa-question", text: "Open"};
    } else {
        return {title: "Error", iconClasses: "fas fa-fw fa-question", text: "Error rendering this issue"};
    }
}

function getIssueStateIcon(issueStateAsChar){
    if (issueStateAsChar === 'W'){
        return '<span class="badge badge-secondary"><i title="Work in progress" class="fas fa-fw fa-hourglass-start"></i>&nbsp;In progress</span>';
    } else if (issueStateAsChar === 'D'){
        return '<span class="badge badge-secondary"><i title="Complete" class="fas fa-fw fa-check"></i>&nbsp;Done</span>';
    } else if (issueStateAsChar === 'O'){
        return '<span class="badge badge-secondary"><i title="Open" class="fas fa-fw fa-question"></i>&nbsp;Open</span>';
    } else {
        return "error";
    }
}

translators = {
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedAvatarThumbnail": getLinkedAvatarThumbnail,
    "prettyPrintDateTime": prettyPrintDateTime,
    "linkedUserName": getLinkedUsername,
    "linkedRealName": getLinkedRealName,
    "getIssueTypeIcon": getIssueTypeIcon,
    "getIssueStateIcon": getIssueStateIcon,
    "showHideCommentsButton": showHideCommentsButton,
    "createCommentsContainer": createCommentsContainer,
    "getUpvoteButtons": getUpvoteButtons,
    "addSendButton": addSendButton
}

function loadCommentsForIssue(id){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-issues-comment-list'](id) + '?format=json';
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const jsonData = JSON.parse(xhr.responseText);
                if (jsonData.results.length > 0){
                    const issueId = jsonData.results[0].issue;

                    const ctid = parseInt(document.getElementById("id_ctid_issueComment").value);
                    const commentPostRenderFunc = Handlebars.templates["comment_post.hbs"];

                    const commentsContainer = document.getElementById("comments_" + issueId);
                    commentsContainer.innerHTML = "";
                    for (var i = 0; i < jsonData.results.length; i++){
                        const thisComment = jsonData.results[i];
                        const domId = "row_comment_" + thisComment.id;

                        const hbContext = {};
                        hbContext['post'] = thisComment;
                        hbContext['domId'] = domId;
                        hbContext['authorProfileLink'] = Urls['userprofile-detail'](thisComment.author.id);
                        hbContext['author'] = thisComment.author;
                        hbContext['sent_timestamp'] = prettyPrintDateTime(thisComment.sent_timestamp);
                        hbContext['ctid'] = ctid;

                        const newComment = createElementFromHTML(commentPostRenderFunc(hbContext));
                        commentsContainer.appendChild(newComment);

                        const thank_button = document.getElementById("id_thankbtn_" + ctid + "_" + thisComment.id);
                        thank_button.addEventListener("click", function (e){
                            const ctid = parseInt(e.target.parentNode.getAttribute("data-ctid"));
                            const objid = parseInt(e.target.parentNode.getAttribute("data-objid"));
                            toggleThanks(ctid, objid, "id_thankstats_" + ctid + "_" + objid, "id_thankbtn_" + ctid + "_" + objid);
                        }, false);
                    }
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function openNewIssue(){
    const targetUrl = Urls['api-issues-create']();

    const titleInputElem = document.getElementById("id_title_input");
    const descriptionInputElem = document.getElementById("id_description_textarea");
    const issueTypeInputElem = document.getElementById("id_issue_type_input");

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                loadAllIssues();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'title': titleInputElem.value, 'description': descriptionInputElem.value, 'issue_type': issueTypeInputElem.options[issueTypeInputElem.selectedIndex].value}));
}

function sendCommentToIssue(issueId, inputId){
    const targetUrl = Urls['api-issues-comment-add'](issueId) + "?format=json";

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
                loadCommentsForIssue(issueId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'content': content, 'issue': issueId}));
}

function toggleComments(id){
    const commentsContainer = document.getElementById("comments_" + id);
    const createCommentsContainer = document.getElementById("id_create_comment_container_" + id);
    if (commentsContainer.classList.contains("d-none")){
        commentsContainer.classList.remove("d-none");
        createCommentsContainer.classList.remove("d-none");
        document.getElementById("button_showhidecomments_" + id).innerText = "Hide comments";
        loadCommentsForIssue(id);
    } else {
        commentsContainer.classList.add("d-none");
        createCommentsContainer.classList.add("d-none");
        document.getElementById("button_showhidecomments_" + id).innerText = "Show comments";
    }
}

function loadAllIssues() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-issues-all-list']() + '?format=json';
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const jsonData = JSON.parse(xhr.responseText);
                const featureRequestsContainer = document.getElementById("feature_requests_container");
                const bugReportsContainer = document.getElementById("bugs_container");
                featureRequestsContainer.innerHTML = "";
                bugReportsContainer.innerHTML = "";
                const issueRenderFunc = Handlebars.templates["issue.hbs"];
                for (var i = 0; i < jsonData.results.length; i++){
                    const featureRequest = jsonData.results[i];
                    const domId = "row_featureRequest_" + featureRequest.id;

                    const hbContext = {};
                    hbContext['domId'] = domId;
                    hbContext['issue'] = featureRequest;
                    hbContext['me'] = JSON.parse(sessionStorage.getItem('me'));
                    hbContext['author'] = featureRequest.author;
                    hbContext['authorProfileUrl'] = Urls['userprofile-detail'](featureRequest.author.id);
                    const typeBadge = getIssueTypeBadge(featureRequest.issue_type);
                    const statusBadge = getIssueStateBadge(featureRequest.issue_status);
                    hbContext['typeBadge'] = typeBadge;
                    hbContext['statusBadge'] = statusBadge;

                    const newFeatureRequest = createElementFromHTML(issueRenderFunc(hbContext));

                    if ((featureRequest.issue_type === "C") || (featureRequest.issue_type === "F")){
                        featureRequestsContainer.appendChild(newFeatureRequest);
                    } else if (featureRequest.issue_type === "B"){
                        bugReportsContainer.appendChild(newFeatureRequest);
                    } else {
                        displayErrorMessage("Error, unexpected or invalid issue type!");
                    }
                    document.getElementById("button_showhidecomments_" + featureRequest.id).addEventListener("click", function(e) { var id = parseInt(e.target.id.split('_')[2]); toggleComments(id); });
                    document.getElementById("btn_send_" + featureRequest.id).addEventListener("click", function(e){ var id = e.target.id.split("_")[2]; sendCommentToIssue(id, 'id_msg_textarea_' + id); });
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}