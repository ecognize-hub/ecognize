// cache objects:
var contactsCache = {};
var orgsCache = {};

var foldersCache = {};
var filesCache = {};

// choices instances:
var choicesUsersRead;
var choicesUsersWrite;
var choicesOrgsRead;
var choicesOrgsWrite;

// currently selected line:
var currentlySelectedLine;

function renderExpandButton(id){
    return `<i class="far fa-fw fa-plus-square" data-id="` + id + `" id="id_button_expand_` + id + `"></i>`;
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

function justify(fileObj){
    const isFile = fileObj.hasOwnProperty("file");
    const id = fileObj.id;
    let item;
    if (isFile) {
        item = document.getElementById("id_div_file_" + id);
    } else {
        item = document.getElementById("id_div_folder_" + id);
    }
    const level = parseInt(item.getAttribute('data-level'));
    return "&nbsp;".repeat(level * 6);
}

function createSubfolderContainer(id){
    return '<div class="col" id="id_div_subfolders_' + id + '"></col>';
}

function renderActions(fileObj){
    let canWrite = false;

    const orgIdsWrite = fileObj.orgs_write.map(a => a.id);
    const userIdsWrite = fileObj.users_write.map(a => a.id);

    const me = JSON.parse(sessionStorage.getItem('me'));
    if (fileObj.owner.id === me.id || orgIdsWrite.includes(me.primaryOrg) || userIdsWrite.includes(me.id) ){
        canWrite = true;
    }

    const isFile = fileObj.hasOwnProperty("file");
    let fileObjType;
    let fileName;
    let i;
    if (isFile){
        fileObjType = "file";
        fileName = extractFileName(fileObj.file);
    } else {
        fileObjType = "folder";
        fileName = fileObj.name;
    }
    const isOwner = fileObj.owner.id === me.id;

    const actionsRequiringWrite = document.getElementsByClassName("needs-write-action");
    const actionsRequiringFile = document.getElementsByClassName("file-action");
    const actionsRequiringFolder = document.getElementsByClassName("folder-action");
    const actionButtons = document.getElementsByClassName("action-button");
    const actionsRequiringOwnership = document.getElementsByClassName("needs-ownership-action");

    if (isFile){
        for (i = 0; i < actionsRequiringFolder.length; i++) {
            actionsRequiringFolder[i].classList.add("d-none");
        }
        for (i = 0; i < actionsRequiringFile.length; i++) {
            const actionItem = actionsRequiringFile[i];
            if (actionItem.classList.contains("needs-write-action")){
                if (canWrite){
                    actionItem.classList.remove("d-none");
                } else {
                    actionItem.classList.add("d-none");
                }
            } else {
                actionItem.classList.remove("d-none");
            }
        }
    } else {
        for (i = 0; i < actionsRequiringFile.length; i++) {
            actionsRequiringFile[i].classList.add("d-none");
        }
        for (i = 0; i < actionsRequiringFolder.length; i++) {
            const actionItem = actionsRequiringFolder[i];
            if (actionItem.classList.contains("needs-write-action")){
                if (canWrite){
                    actionItem.classList.remove("d-none");
                } else {
                    actionItem.classList.add("d-none");
                }
            } else {
                actionItem.classList.remove("d-none");
            }
        }
    }

    for (i = 0; i < actionButtons.length; i++){
        actionButtons[i].setAttribute('data-type', fileObjType);
        actionButtons[i].setAttribute('data-current-name', fileName);
        actionButtons[i].setAttribute('data-id', fileObj.id);
    }
    if (isFile){
        const dlButton = document.getElementById("id_a_downloadFile");
        dlButton.href = '/media/' + fileObj.file;
        dlButton.setAttribute("download", fileName);
    }

    for (i = 0; i < actionsRequiringOwnership.length; i++){
        if (isOwner){
            actionsRequiringOwnership[i].classList.remove("d-none");
        } else {
            actionsRequiringOwnership[i].classList.add("d-none");
        }
    }
}

function createFilesContainer(id){
    return '<div class="col" id="id_div_files_' + id + '"></col>';
}

function extractFileName(fileName){
    const splitName = fileName.split("/");
    return splitName[splitName.length - 1]
}

function renderNameAndInfosLink(fileObj){
    const isFile = fileObj.hasOwnProperty("file");
    if (isFile){
        const fileName = extractFileName(fileObj.file);
        return `<span data-id="` + fileObj.id + `" id="id_nameSpan_file_` + fileObj.id + `">` + fileName + `</span>`;
    } else {
        return `<span data-id="` + fileObj.id + `" id="id_nameSpan_folder_` + fileObj.id + `">` + fileObj.name + `</span>`;
    }
}

function getLinkedUserName(userObj){
    const baseUrl = Urls['userprofile-detail'](userObj.id);
    let res = `<a href="` + baseUrl + `">` + userObj.user_name;
    if (userObj.real_name !== ""){
        res += ` (` + userObj.real_name + `)`;
    }
    res += "</a>"
    return res;
}

function getLinkedOrgName(orgObj){
    const baseUrl = Urls['org-detail'](orgObj.id);
    return `<a href="` + baseUrl + `">` + orgObj.display_name + "</a>";
}

function getLinkedUsersAsCSV(usersArray){
    const linkedNamesArray = new Array(usersArray.length);
    for (var i = 0; i < usersArray.length; i++){
        linkedNamesArray[i] = getLinkedUserName(usersArray[i]);
    }
    return linkedNamesArray.join(", ");
}

function getLinkedOrgsAsCSV(orgsArray){
    const linkedOrgsArray = new Array(orgsArray.length);
    for (var i = 0; i < orgsArray.length; i++){
        linkedOrgsArray[i] = getLinkedOrgName(orgsArray[i]);
    }
    return linkedOrgsArray.join(", ");
}

translators = {
    "prettyPrintDateTime": prettyPrintDateTime,
    "renderExpandButton": renderExpandButton,
    "justify": justify,
    "createSubfolderContainer": createSubfolderContainer,
    "createFilesContainer": createFilesContainer,
    "extractFileName": extractFileName,
    "renderNameAndInfos": renderNameAndInfosLink,
    "getLinkedUserName": getLinkedUserName,
    "getLinkedUsersAsCSV": getLinkedUsersAsCSV,
    "getLinkedOrgsAsCSV": getLinkedOrgsAsCSV
}

function displayFilesystemObjectInfos(type, id){
    let filesystemObj;
    if (type === "file"){
        filesystemObj = filesCache[id];
    }
    if (type === "folder"){
        filesystemObj = foldersCache[id];
    }
    const containerId = "id_div_filesystemobj_info";
    fillChildren(containerId, filesystemObj);
    renderActions(filesystemObj);

    if (currentlySelectedLine != null){
        currentlySelectedLine.classList.remove("bg-secondary");
    }
    const elementRow = document.getElementById("id_div_" + type + "_" + id);
    if (type === "file"){
        elementRow.classList.add("bg-secondary");
        currentlySelectedLine = elementRow;
    } else {
        const inner_row = elementRow.firstElementChild.firstElementChild;
        inner_row.classList.add("bg-secondary");
        currentlySelectedLine = inner_row;
    }

    const editShareSettingsBtn = document.getElementById("id_editShareSettingsButton");
    editShareSettingsBtn.setAttribute("data-id", id);
    editShareSettingsBtn.setAttribute("data-type", type);
}

function expandFolder(folderId, level){
    const subFolderElem = document.getElementById("id_div_subfolders_" + folderId);
    const filesElem = document.getElementById("id_div_files_" + folderId);
    subFolderElem.classList.remove("d-none");
    filesElem.classList.remove("d-none");

    const expandButton = document.getElementById("id_button_expand_" + folderId);
    loadFiles(folderId, level, false);
    loadFolders(folderId, level, false);
    expandButton.classList.remove("fa-plus-square");
    expandButton.classList.add("fa-minus-square");
    expandButton.removeEventListener("click", expandFolderWrapper);
    expandButton.addEventListener("click", unexpandFolderWrapper, false);
    displayFilesystemObjectInfos("folder", folderId);
}

function unexpandFolder(folderId){
    const subFolderElem = document.getElementById("id_div_subfolders_" + folderId);
    const filesElem = document.getElementById("id_div_files_" + folderId);
    subFolderElem.classList.add("d-none");
    filesElem.classList.add("d-none");

    const expandButton = document.getElementById("id_button_expand_" + folderId);
    expandButton.classList.remove("fa-minus-square");
    expandButton.classList.add("fa-plus-square");
    expandButton.removeEventListener("click", unexpandFolderWrapper);
    expandButton.addEventListener("click", expandFolderWrapper, false);
    displayFilesystemObjectInfos("folder", folderId);
}

function renderFileOrFolderItems(dataArray, itemType, containerId, level){
    const containerElem = document.getElementById(containerId);
    containerElem.innerHTML = "";

    const folderRenderFunc = Handlebars.templates["folder.hbs"];
    const fileRenderFunc = Handlebars.templates["file.hbs"];

    for (var i = 0; i < dataArray.length; i++){
        let newItem;
        const idNo = dataArray[i].id;
        const domId = "id_div_" + itemType + "_" + idNo;
        const hbContext = {};
        hbContext['time_last_edited'] = prettyPrintDateTime(dataArray[i].time_last_edited);
        hbContext['domId'] = domId;
        hbContext['level'] = level;
        hbContext['justification'] = "&nbsp;".repeat(level * 6);
        if (itemType === "file"){
            filesCache[idNo] = dataArray[i];
            hbContext['file'] = dataArray[i];
            hbContext['fileName'] = extractFileName(dataArray[i].file);

            newItem = createElementFromHTML(fileRenderFunc(hbContext));
        }
        if (itemType === "folder"){
            foldersCache[idNo] = dataArray[i];
            hbContext['folder'] = dataArray[i];
            hbContext['justification'] = "&nbsp;".repeat(level * 6);

            newItem = createElementFromHTML(folderRenderFunc(hbContext));
        }
        containerElem.appendChild(newItem);

        // now add event handlers:
        if (itemType === "file"){
            const nameSpan = document.getElementById("id_nameSpan_file_" + idNo);
            nameSpan.addEventListener("click", function (e){
                const id = this.getAttribute('data-id');
                displayFilesystemObjectInfos('file', id);
            }, false);
        }
        if (itemType === "folder"){
            const nameSpan = document.getElementById("id_nameSpan_folder_" + idNo);
            nameSpan.addEventListener("click", function (e){
                const id = this.getAttribute('data-id');
                displayFilesystemObjectInfos('folder', id);
            }, false);

            const expandBtn = document.getElementById("id_button_expand_" + idNo);
            expandBtn.addEventListener("click", expandFolderWrapper, false);
        }
    }
}

function expandFolderWrapper(e){
    const id = this.getAttribute('data-id');
    const level = parseInt(document.getElementById('id_div_folder_' + id).getAttribute('data-level'));
    expandFolder(id, level + 1);
}

function unexpandFolderWrapper(e){
    const id = this.getAttribute('data-id');
    const level = parseInt(document.getElementById('id_div_folder_' + id).getAttribute('data-level'));
    unexpandFolder(id, level);
}

function loadFolders(parentFolderId, level, sharedRoot) {
    let targetUrl;
    const xhr = new XMLHttpRequest();
    if (sharedRoot){
        targetUrl = Urls['api-shared_folders-list']() + "?format=json";
    } else {
        targetUrl = Urls['api-folders-list'](parentFolderId) + "?format=json";
    }
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderFileOrFolderItems(responseAsJSON.results, "folder", "id_div_subfolders_" + parentFolderId, level);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function deleteFilesystemObj(type, id){
    if (type === "file"){
        deleteFile(id);
    }
    if (type === "folder"){
        deleteFolder(id);
    }
}

function deleteFile(targetId){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-file-delete'](targetId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                // deletion successful
                const deletedFileDOMElem = document.getElementById("id_div_file_" + targetId);
                deletedFileDOMElem.remove();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function deleteFolder(targetId){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-folder-delete'](targetId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                // deletion successful
                const deletedFileDOMElem = document.getElementById("id_div_folder_" + targetId);
                deletedFileDOMElem.remove();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadFiles(parentFolderId, level, sharedRoot) {
    let targetUrl;
    const xhr = new XMLHttpRequest();

    if (sharedRoot){
        targetUrl = Urls['api-shared_files-list']() + "?format=json";
    } else {
        targetUrl = Urls['api-files-list'](parentFolderId) + "?format=json";
    }

    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderFileOrFolderItems(responseAsJSON.results, "file", "id_div_files_" + parentFolderId, level);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadSingleFileInfo(fileId) {
    const targetUrl = Urls['api-file-info'](fileId) + "?format=json";
    const xhr = new XMLHttpRequest();

    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                filesCache[responseAsJSON.id] = responseAsJSON;
                displayFilesystemObjectInfos("file", fileId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
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
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    if (responseAsJSON.results[i].connection.real_name === "" || responseAsJSON.results[i].connection.real_name == null){
                        contactsCache[responseAsJSON.results[i].connection.id] = {value: responseAsJSON.results[i].connection.id, label: responseAsJSON.results[i].connection.user_name, selected: false, disabled: false};
                    } else {
                        contactsCache[responseAsJSON.results[i].connection.id] = {value: responseAsJSON.results[i].connection.id, label: responseAsJSON.results[i].connection.user_name + " (" + responseAsJSON.results[i].connection.real_name + ")", selected: false, disabled: false};
                    }
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function strArrayToIntArray(strArray, intArray){
    for (var i = 0; i < strArray.length; i++) {
        intArray[i] = parseInt(strArray[i]);
    }
}

function renameObject(objType, objId){
    let targetUrl;
    let parentId;
    let currentLevel;
    const rootElemId = parseInt(document.getElementById("id_root_folder").value);
    if (objType === "file"){
        targetUrl = Urls['api-file-meta-update'](objId) + "?format=json";
        if (filesCache.hasOwnProperty(objId) && filesCache[objId].parent_folder != null && filesCache[objId].parent_folder !== rootElemId) {
            parentId = filesCache[objId].parent_folder;
        } else {
            parentId = 0;
        }
        if (parentId !== rootElemId) {
            currentLevel = parseInt(document.getElementById("id_div_file_" + objId).getAttribute("data-level"));
        } else {
            currentLevel = 0;
        }
    } else if (objType === "folder"){
        targetUrl = Urls['api-folder-update'](objId) + "?format=json";
        if (foldersCache.hasOwnProperty(objId) && foldersCache[objId].parent_folder != null && foldersCache[objId].parent_folder !== rootElemId) {
            parentId = foldersCache[objId].parent_folder;
        } else {
            parentId = 0;
        }
        if (parentId !== rootElemId) {
            currentLevel = parseInt(document.getElementById("id_div_folder_" + objId).getAttribute("data-level"));
        } else {
            currentLevel = 0;
        }
    } else {
        displayErrorMessage("Error, wrong type when calling updateShareSettings");
    }

    const newName = document.getElementById("div_input_folder_name").value;

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (objType === "folder") {
                    loadFolders(parentId, currentLevel, false);
                }
                if (objType === "file") {
                    loadFiles(parentId, currentLevel, false);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({name: newName}));
}

function createNewFolder(objId){
    let targetUrl;
    let currentLevel;
    targetUrl = Urls['api-folder-create'](objId) + "?format=json";
    const rootElemId = parseInt(document.getElementById("id_root_folder").value);

    if (objId !== rootElemId) {
        currentLevel = parseInt(document.getElementById("id_div_folder_" + objId).getAttribute("data-level"));
    } else {
        currentLevel = 0;
    }

    const newName = document.getElementById("div_input_newFolder_name").value;

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                loadFolders(objId, currentLevel, false);
                if (objId !== rootElemId) {
                    unexpandFolder(objId, currentLevel);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({name: newName, parent_folder: objId}));
}

function replaceFileContent(fileToReplaceId, refresh){
    let currentLevel;

    let parentId = filesCache[fileToReplaceId].parent_folder;
    if (parentId != null && parentId !== 0){
        currentLevel = parseInt(document.getElementById("id_div_folder_" + parentId).getAttribute("data-level"));
    } else {
        currentLevel = 0;
        parentId = 0;
    }

    const fileInput = document.getElementById("id_fileinput_replace");
    const fileList = fileInput.files;
    if (fileList.length < 1) {
        displayErrorMessage("Error, no file provided");
        return false;
    }
    const newFile = fileList[0];
    const newName = newFile.name;
    const targetUrl = Urls['api-file-content-update'](fileToReplaceId, newName);

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('Content-Disposition', 'attachment; filename=' + newName);

    const rootElemId = parseInt(document.getElementById("id_root_folder").value);

    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                loadFiles(parentId, currentLevel, false);
                if (parentId !== rootElemId) {
                    unexpandFolder(parentId, currentLevel);
                }
                if (refresh){
                    location.reload();
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(newFile);
}

function replaceFileContentAndRefresh(fileToReplaceId){
    const fileInput = document.getElementById("id_fileinput_replace");
    const fileList = fileInput.files;
    if (fileList.length < 1) {
        displayErrorMessage("Error, no file provided");
        return false;
    }
    const newFile = fileList[0];
    const newName = newFile.name;
    const targetUrl = Urls['api-file-content-update'](fileToReplaceId, newName);

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('Content-Disposition', 'attachment; filename=' + newName);

    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(newFile);
}

function uploadFile(objId){
    let currentLevel;
    const rootElemId = parseInt(document.getElementById("id_root_folder").value);

    if (objId !== rootElemId) {
        currentLevel = parseInt(document.getElementById("id_div_folder_" + objId).getAttribute("data-level"));
    } else {
        currentLevel = 0;
    }

    const fileInput = document.getElementById("id_fileinput_new");
    const fileList = fileInput.files;
    if (fileList.length < 1) {
        displayErrorMessage("Error, no file provided");
        return false;
    }
    const newFile = fileList[0];
    const newName = newFile.name;
    const targetUrl = Urls['api-files-create'](objId, newName) + "?format=json";

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('Content-Disposition', 'attachment; filename=' + newName);

    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                loadFiles(objId, currentLevel, false);
                if (objId !== rootElemId) {
                    unexpandFolder(objId, currentLevel);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(newFile);
}

function updateShareSettings(objType, objId){
    let targetUrl;
    let parentId;
    let currentLevel;
    const rootElemId = parseInt(document.getElementById("id_root_folder").value);
    if (objType === "file"){
        targetUrl = Urls['api-file-meta-update'](objId) + "?format=json";
        if (filesCache[objId].parent_folder != null && filesCache[objId].parent_folder !== rootElemId) {
            parentId = filesCache[objId].parent_folder;
        } else {
            parentId = 0;
        }
        currentLevel = parseInt(document.getElementById("id_div_file_" + objId).getAttribute("data-level"));
    } else if (objType === "folder"){
        targetUrl = Urls['api-folder-update'](objId) + "?format=json";
        if (foldersCache[objId].parent_folder != null && foldersCache[objId].parent_folder !== rootElemId) {
            parentId = foldersCache[objId].parent_folder;
        } else {
            parentId = 0;
        }
        currentLevel = parseInt(document.getElementById("id_div_folder_" + objId).getAttribute("data-level"));
    } else {
        displayErrorMessage("Error, wrong type when calling updateShareSettings");
    }

    const users_read = choicesUsersRead.getValue(true);
    const users_write = choicesUsersWrite.getValue(true);
    const orgs_read = choicesOrgsRead.getValue(true);
    const orgs_write = choicesOrgsWrite.getValue(true);

    const users_read_int = new Array(users_read.length);
    const users_write_int = new Array(users_write.length);
    const orgs_read_int = new Array(orgs_read.length);
    const orgs_write_int = new Array(orgs_write.length);

    strArrayToIntArray(users_read, users_read_int);
    strArrayToIntArray(users_write, users_write_int);
    strArrayToIntArray(orgs_read, orgs_read_int);
    strArrayToIntArray(orgs_write, orgs_write_int);

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (objType === "folder") {
                    loadFolders(parentId, currentLevel, false);
                }
                if (objType === "file") {
                    loadFiles(parentId, currentLevel, false);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({users_read: users_read_int, users_write: users_write_int, orgs_read: orgs_read_int, orgs_write: orgs_write_int}));
}

function loadNationalOrgs(){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-orggroups-search-national']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    if (responseAsJSON.results[i].local_name === "" || responseAsJSON.results[i].local_name == null){
                        orgsCache[responseAsJSON.results[i].id] = {value: responseAsJSON.results[i].id, label: responseAsJSON.results[i].display_name, selected: false, disabled: false};
                    } else {
                        orgsCache[responseAsJSON.results[i].id] = {value: responseAsJSON.results[i].id, label: responseAsJSON.results[i].display_name + " (" + responseAsJSON.results[i].local_name + ")", selected: false, disabled: false};
                    }
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function toggleElemsForOwnView(show){
    let i;
    const elemsForOwnView = document.getElementsByClassName("only-own-files");
    if (show){
        for (i = 0; i < elemsForOwnView.length; i++){
            elemsForOwnView[i].classList.remove("d-none");
        }
    } else {
        for (i = 0; i < elemsForOwnView.length; i++){
            elemsForOwnView[i].classList.add("d-none");
        }
    }
}