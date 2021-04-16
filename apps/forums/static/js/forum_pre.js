var forumId;
var choicesConnections;
var choicesOrgs;
var choicesAdmins;
var choicesMods;

var profileIdsWithAccess = [];
var adminProfileIds = []
var modProfileIds = [];
var orgIdsWithAccess = [];
var occGroupIdsWithAccess = [];

function userNamesAsLists(userList){
    let collectedNames = "";
    for (var i = 0; i < userList.length; i++){
        let profileUrl = Urls['userprofile-detail'](userList[i].id);
        collectedNames += '<a href="' + profileUrl + '">';
        collectedNames += userList[i].user_name;
        const real_name = userList[i].real_name;
        if (real_name != null && real_name !== ""){
            collectedNames += " (" + real_name + ")";
        }
        collectedNames += "</a>, "
    }
    collectedNames = collectedNames.slice(0, -2);
    return collectedNames;
}

function orgNamesAsList(forumObj){
    let collectedNames = "";
    for (var i = 0; i < forumObj.participant_organizations.length; i++){
        let orgPageUrl = Urls['org-detail'](forumObj.participant_organizations[i].id);
        collectedNames += '<a href="' + orgPageUrl +'">' + forumObj.participant_organizations[i].display_name + "</a>, ";
    }
    collectedNames = collectedNames.slice(0, -2);
    return collectedNames;
}

function occupationalGroupsAsList(forumObj){
    let collectedNames = "";
    for (var i = 0; i < forumObj.participant_generic_groups.length; i++){
        collectedNames += forumObj.participant_generic_groups[i].display_name + ", ";
    }
    collectedNames = collectedNames.slice(0, -2);
    return collectedNames;
}

function createThreadsOverviewContainer(id){
    return '<div class="col" id="id_threads_container_' + id + '"></div>';
}

function getRoundUserAvatarThumbnail(avatarUrl){
    return '<img alt="avatar" class="border rounded-circle" src="' + avatarUrl + '" width="50" height="50" />';
}

function getLinkedThreadTitle(threadObj){
    return '<a href="' + Urls['thread-detail'](forumId, threadObj.id) + '"><h5>' + threadObj.subject + '</h5>';
}

function getLinkedAvatarThumbnail(userObj){
    const baseUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + baseUrl + '">' + getRoundUserAvatarThumbnail(userObj.thumbnail) + '</a>';
}

translators = {
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedAvatarThumbnail": getLinkedAvatarThumbnail,
    "createThreadsOverviewContainer": createThreadsOverviewContainer,
    "prettyPrintDateTime": prettyPrintDateTime,
    "linkedTitle": getLinkedThreadTitle
}

function startThread(){
    const targetUrl = Urls['api-forum-threads-new'](forumId) + "?format=json";

    const contentElem = document.getElementById("id_post_textarea");
    const content = contentElem.value;

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

                const postXhr = new XMLHttpRequest();
                const targetUrl2 = Urls['api-thread-posts-new'](forumId, newThreadId) + "?format=json";
                postXhr.open('POST', targetUrl2, true);
                postXhr.setRequestHeader("X-CSRFToken", csrftoken);
                postXhr.setRequestHeader('Content-Type', 'application/json');
                postXhr.onload = function() {
                    if (postXhr.readyState === 4) {
                        if (postXhr.status === 201) {
                            loadForumThreads(forumId);
                        } else {
                            displayErrors(postXhr.responseText);
                        }
                    }
                };
                postXhr.send(JSON.stringify({'content': content, 'thread': newThreadId}));
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    threadXhr.send(JSON.stringify({'subject': subject}));
}

function deleteForum(){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forum-delete'](forumId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                // deletion successful
                window.location.href = Urls['forums-all']();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMyConnectionsWithPreselect() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-connections-list']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const accessChoicesArray = [];
                const adminChoicesArray = [];
                const modChoicesArray = [];
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    let displayName = ""
                    if (responseAsJSON.results[i].connection.real_name === "" || responseAsJSON.results[i].connection.real_name == null){
                        displayName = responseAsJSON.results[i].connection.user_name;
                    } else {
                        displayName = responseAsJSON.results[i].connection.user_name + " (" + responseAsJSON.results[i].connection.real_name + ")";
                    }

                    accessChoicesArray.push({value: responseAsJSON.results[i].connection.id, label: displayName, selected: profileIdsWithAccess.includes(parseInt(responseAsJSON.results[i].connection.id)), disabled: false})
                    adminChoicesArray.push({value: responseAsJSON.results[i].connection.id, label: displayName, selected: adminProfileIds.includes(parseInt(responseAsJSON.results[i].connection.id)), disabled: false})
                    modChoicesArray.push({value: responseAsJSON.results[i].connection.id, label: displayName, selected: modProfileIds.includes(parseInt(responseAsJSON.results[i].connection.id)), disabled: false})
                }
                choicesConnections = new Choices('#choices-connections', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: accessChoicesArray });
                choicesAdmins = new Choices('#choices-admins', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: adminChoicesArray });
                choicesMods  = new Choices('#choices-mods', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: modChoicesArray });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadOrgsWithPreselect() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-orggroups-search-global']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var responseAsJSON = JSON.parse(xhr.responseText);
                var choicesArray = [];
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    if (orgIdsWithAccess.includes(parseInt(responseAsJSON.results[i].id))) {
                        choicesArray.push({value: responseAsJSON.results[i].id, label: responseAsJSON.results[i].display_name, selected: true, disabled: false})
                    } else {
                        choicesArray.push({value: responseAsJSON.results[i].id, label: responseAsJSON.results[i].display_name, selected: false, disabled: false})
                    }
                }
                choicesOrgs = new Choices('#choices-orgs', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: choicesArray });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadForum() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forum-details'](forumId) + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                loadForumThreads(responseAsJSON.id);

                if (responseAsJSON.participant_users_profiles.length > 0){
                    document.getElementById("id_access_label_users").classList.remove("d-none");
                    document.getElementById("id_col_users_with_access").classList.remove("d-none");

                    profileIdsWithAccess = responseAsJSON.participant_users_profiles.map(a => parseInt(a.id));
                } else {
                    document.getElementById("id_access_label_users").classList.add("d-none");
                    document.getElementById("id_col_users_with_access").classList.add("d-none");
                }
                if (responseAsJSON.participant_organizations.length > 0){
                    document.getElementById("id_access_label_orgs").classList.remove("d-none");
                    document.getElementById("id_col_orgs_with_access").classList.remove("d-none");

                    orgIdsWithAccess = responseAsJSON.participant_organizations.map(a => parseInt(a.id));
                } else {
                    document.getElementById("id_access_label_orgs").classList.add("d-none");
                    document.getElementById("id_col_orgs_with_access").classList.add("d-none");
                }
                if (responseAsJSON.participant_generic_groups.length > 0){
                    document.getElementById("id_access_label_occugrps").classList.remove("d-none");
                    document.getElementById("id_col_occgroups_with_access").classList.remove("d-none");

                    occGroupIdsWithAccess = responseAsJSON.participant_generic_groups.map(a => parseInt(a.id));
                } else {
                    document.getElementById("id_access_label_occugrps").classList.add("d-none");
                    document.getElementById("id_col_occgroups_with_access").classList.add("d-none");
                }
                if (responseAsJSON.administrators.length > 0){
                    adminProfileIds = responseAsJSON.administrators.map(a => parseInt(a.id));
                    document.getElementById("id_label_administrators").classList.remove("d-none");
                    document.getElementById("id_col_administrators").classList.remove("d-none");
                } else {
                    document.getElementById("id_label_administrators").classList.add("d-none");
                    document.getElementById("id_col_administrators").classList.add("d-none");
                }
                if (responseAsJSON.moderators.length > 0){
                    modProfileIds = responseAsJSON.moderators.map(a => parseInt(a.id));
                    document.getElementById("id_label_moderators").classList.remove("d-none");
                    document.getElementById("id_col_moderators").classList.remove("d-none");
                } else {
                    document.getElementById("id_label_moderators").classList.add("d-none");
                    document.getElementById("id_col_moderators").classList.add("d-none");
                }

                document.getElementById("id_col_users_with_access").innerHTML = userNamesAsLists(responseAsJSON.participant_users_profiles);
                document.getElementById("id_col_orgs_with_access").innerHTML = orgNamesAsList(responseAsJSON);
                document.getElementById("id_col_occgroups_with_access").innerText = occupationalGroupsAsList(responseAsJSON);
                document.getElementById("id_col_administrators").innerHTML = userNamesAsLists(responseAsJSON.administrators);
                document.getElementById("id_col_moderators").innerHTML = userNamesAsLists(responseAsJSON.moderators);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadForumThreads(id) {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forum-threads-list'](id);
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const threadsContainer = document.getElementById("id_threads_container");
                threadsContainer.innerHTML = "";
                const threadRenderFunc = Handlebars.templates["threadpreview.hbs"];
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    const thisThread = responseAsJSON.results[i];
                    const newThreadId = "id_thread_" + thisThread.id;

                    const hbContext = {};
                    hbContext['domId'] = newThreadId;
                    hbContext['author'] = thisThread.author;
                    hbContext['last_post_user'] = thisThread.last_post_user;
                    hbContext['authorProfileLink'] = Urls['userprofile-detail'](thisThread.author.id);
                    hbContext['lastPostUserProfileLink'] = Urls['userprofile-detail'](thisThread.last_post_user.id);
                    hbContext['thread'] = thisThread;
                    hbContext['started_timestamp'] = prettyPrintDateTime(thisThread.started_timestamp);
                    hbContext['last_post_datetime'] = prettyPrintDateTime(thisThread.last_post_datetime);
                    hbContext['threadLink'] = Urls['thread-detail'](forumId, thisThread.id);

                    const newThreadPreview = createElementFromHTML(threadRenderFunc(hbContext));
                    threadsContainer.appendChild(newThreadPreview);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function editCustomForum(){
    let i;

    var participant_users_profiles = choicesConnections.getValue();
    var moderators = choicesMods.getValue();
    var administrators = choicesAdmins.getValue();

    var participant_users_profiles_array = new Array(participant_users_profiles.length);
    var moderators_array = new Array(moderators.length);
    var administrators_array = new Array(administrators.length);

    for (i = 0; i < participant_users_profiles_array.length; i++) {
        participant_users_profiles_array[i] = parseInt(participant_users_profiles[i].value);
    }
    for (i = 0; i < moderators_array.length; i++) {
        moderators_array[i] = parseInt(moderators[i].value);
        // mods must be members of the users:
        if (!participant_users_profiles_array.includes(parseInt(moderators[i].value))){
            participant_users_profiles_array.push(parseInt(moderators[i].value));
        }
    }
    for (i = 0; i < administrators_array.length; i++) {
        administrators_array[i] = parseInt(administrators[i].value);
        // admins must be members of the users:
        if (!participant_users_profiles_array.includes(parseInt(administrators[i].value))){
            participant_users_profiles_array.push(parseInt(administrators[i].value));
        }
    }

    var participant_organizations = choicesOrgs.getValue();
    var participant_organizations_array = new Array(participant_organizations.length);
    for (i = 0; i < participant_organizations.length; i++) {
        participant_organizations_array[i] = participant_organizations[i].value;
    }

    var targetUrl = Urls['api-forum-edit'](forumId);

    var newForumName = document.getElementById("name").value;

    const csrftoken = getCookie('csrftoken');
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
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
    xhr.send(JSON.stringify({name: newForumName, moderators: moderators_array, administrators: administrators_array, participant_organizations: participant_organizations_array, participant_users_profiles: participant_users_profiles_array})); // participant_generic_groups: participant_occupational_groups_array
}

window.addEventListener("load", function(e) { window.forumId = parseInt(document.getElementById("id_forum_id").value); loadForum(); }, false)