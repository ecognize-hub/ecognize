function getUserProfileLink(id){
    const userUrl = Urls['userprofile-detail'](id);
    return '<a href="' + userUrl + '"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

function getUserAddLink(id){
    return '<a href="#" data-toggle="modal" data-target="#addUserAsConnectionModal" data-profile-id="' + id + '"><i class="fas fa-fw fa-user-plus"></i></a>';
}

function getUserProfileAndAddLink(id){
    return getUserAddLink(id) + getUserProfileLink(id);
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
    "userProfileLink": getUserProfileLink,
    "linkedAvatarThumbnail": getLinkedRoundUserAvatarThumbnail,
    "linkedUserName": getLinkedUsername,
    "linkedRealName": getLinkedRealName,
    "userAddLink": getUserAddLink,
}

function renderMemberList(connectionsObj, containerId){
    document.getElementById(containerId).innerHTML = "";
    const connectionsArray = connectionsObj.results;

    for (var i = 0; i < connectionsArray.length; i++){
        renderProfilePreview(connectionsArray[i], containerId);
    }
}

function renderProfilePreview(profileObj, idToAppend){
    const profileRenderFunc = Handlebars.templates["userpreview.hbs"];
    const connectionId = profileObj['id'];
    const domId = "id_member_" + connectionId;

    const hbContext = {};
    hbContext['profileLink'] = Urls['userprofile-detail'](profileObj.id);
    hbContext['thumbnail'] = profileObj.thumbnail;
    hbContext['user_name'] = profileObj.user_name;
    hbContext['real_name'] = profileObj.real_name;
    hbContext['colWidth'] = 5;
    hbContext['domId'] = domId;

    const newProfilePreview = createElementFromHTML(profileRenderFunc(hbContext));

    const whereToAppend = document.getElementById(idToAppend);
    whereToAppend.appendChild(newProfilePreview);
}

function loadMembers() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-orggroups-members'](document.getElementById("id_org_id").value) + "?format=json";
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
window.addEventListener("load", loadMembers, false);