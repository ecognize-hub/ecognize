function getGroupLogoThumbnail(thumbUrl){
    return '<img alt="logo" class="border rounded" src="' + thumbUrl + '" width="80" height="60" />';
}

function getGroupProfileLink(id){
    const userUrl = Urls['usergroup-detail'](id);
    return '<a href="' + userUrl + '"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

function getDeleteLink(id){
    if (id === -1){
        return "";
    } else {
        return '<a href="#" data-toggle="modal" data-target="#id_deleteGroupModal" data-group-id="' + id + '"><i class="fas fa-fw fa-trash-alt"></i></a>';
    }
}

function getLinkedName(userGroupObj){
    const groupDetailUrl = Urls['usergroup-detail'](userGroupObj.id);
    return '<a href="' + groupDetailUrl + '">' + userGroupObj.display_name + '</a>';
}

translators = {
    "logoPreview": getGroupLogoThumbnail,
    "orgProfileLink": getGroupProfileLink,
    "deleteLink": getDeleteLink,
    "linkedName": getLinkedName
}

function renderGroupPreview(groupObj, idToAppend, idPrefix){
    const groupId = groupObj['id'];
    const domId = "id_" + idPrefix + "_" + groupId;

    const groupRenderFunc = Handlebars.templates["grouppreview.hbs"];

    const hbContext = {};
    hbContext['group'] = groupObj;
    hbContext['domId'] = domId;
    hbContext['groupPageUrl'] = Urls['usergroup-detail'](groupId);

    if (groupObj.is_admin === true){
        hbContext['actions'] = [{href: "#", toggle: "modal", target: "#id_deleteGroupModal", argId: groupId, iconClasses: "fas fa-fw fa-trash-alt"}];
    }

    const newGroupPreview = createElementFromHTML(groupRenderFunc(hbContext));

    const whereToAppend = document.getElementById(idToAppend);
    whereToAppend.appendChild(newGroupPreview);
}

function renderGroupSearchResults(resultObj, containerId, idPrefix){
    document.getElementById(containerId).innerHTML = "";
    const groupsArray = resultObj.results;

    for (var i = 0; i < groupsArray.length; i++){
        renderGroupPreview(groupsArray[i], containerId, idPrefix);
    }
}

function doGroupSearch() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroups-search-global']() + "?format=json";
    const chosenCountries = choicesCountries.getValue().map(a => a.value).join(",");
    const searchString = document.getElementById("id_search_box").value;
    xhr.open('GET', targetUrl + "&search=" + searchString + "&countries=" + chosenCountries, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderGroupSearchResults(responseAsJSON, "id_searchresults_container", "group_search");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function deleteGroup(id){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-usergroups-update-delete'](id);
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                const connectionReqDOMElem = document.getElementById("id_my_group_" + id);
                connectionReqDOMElem.remove();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

async function performDeleteGroup(){
    const targetId = document.getElementById('id_group_id').value;
    deleteGroup(targetId);
}

function getMyGroups() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-my-groups']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderGroupSearchResults(responseAsJSON, "id_mygroups_container", "my_group");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function createNewGroup(){
    const formElem = document.getElementById('id_createNewGroupForm');
    const xhr = new XMLHttpRequest();
    const targetUrl = formElem.action;
    const csrftoken = getCookie('csrftoken');
    const formData = new FormData(formElem);
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                getMyGroups();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(formData);
}

window.addEventListener("load", getMyGroups, false);