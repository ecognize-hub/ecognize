var ckEditor; // global ckeditor variable
var forumId;
var threadId;

function createThreadsOverviewContainer(id){
    return '<div class="col" id="id_threads_container_' + id + '"></div>';
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

function newlineToLinebreaks(stringObj){
    return stringObj.replaceAll('\n', '<br/>')
}

translators = {
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedAvatarThumbnail": getLinkedAvatarThumbnail,
    "prettyPrintDateTime": prettyPrintDateTime,
    "newlineToLinebreaks": newlineToLinebreaks,
    "linkedUserName": getLinkedUsername,
    "linkedRealName": getLinkedRealName
}

function deletePost(){
    const xhr = new XMLHttpRequest();
    const postToDeleteId = document.getElementById("id_post_id").value;
    const targetUrl = Urls['api-forum-post-delete'](forumId, threadId, postToDeleteId);
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                // deletion successful
                loadThreadMessages();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function deleteThread(){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forum-thread-delete'](forumId, threadId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                window.location.href = Urls['forum-details'](forumId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadThreadMessages() {
    const myUserId = parseInt(document.getElementById("id_currentUserProfile_id").value);
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-thread-posts-list'](forumId, threadId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const postsContainer = document.getElementById("posts_container");
                postsContainer.innerHTML = "";
                const postRenderFunc = Handlebars.templates["post.hbs"];
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    const thisPost = responseAsJSON.results[i];
                    const domId = "id_post_" + thisPost.id;

                    const hbContext = {};
                    hbContext['domId'] = domId;
                    hbContext['author'] = thisPost.author;
                    hbContext['content'] = thisPost.content;
                    hbContext['authorProfileLink'] = Urls['userprofile-detail'](thisPost.author.id);
                    hbContext['sent_timestamp'] = prettyPrintDateTime(thisPost.sent_timestamp);
                    hbContext['postCount'] = i+1;

                    if (myUserId === responseAsJSON.results[i].author.id){
                        if (i === 0){
                            hbContext['actions'] = [{
                                href: "#",
                                toggle: "modal",
                                target: "#deleteThreadModal",
                                iconClasses: "fas fa-fw fa-trash-alt"
                            }];
                        } else {
                            hbContext['actions'] = [{
                                href: "#",
                                toggle: "modal",
                                target: "#deletePostModal",
                                iconClasses: "fas fa-fw fa-trash-alt"
                            }];
                        }
                    }
                    let newPost = createElementFromHTML(postRenderFunc(hbContext));
                    postsContainer.appendChild(newPost);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function sendMessageToThread(threadId, inputId){
    const targetUrl = Urls['api-thread-posts-new'](forumId, threadId) + "?format=json";

    const inputElem = document.getElementById(inputId);
    inputElem.value = ckEditor.getData();
    const content = inputElem.value;

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                loadThreadMessages();
                ckEditor.setData( '' );
                inputElem.value = "";
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({'content': content, 'thread': threadId}));
    return false;
}

window.addEventListener("load", function(e){ forumId = parseInt(document.getElementById("id_thread_forum_id").value); threadId = parseInt(document.getElementById("id_thread_id").value); loadThreadMessages(); }, false);