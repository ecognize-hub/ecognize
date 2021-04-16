function toggleFileElemInfo(showInfo){
    if (showInfo){
        document.getElementById('id_div_filesystemobj_info_hidden').classList.add('d-none');
        document.getElementById('id_div_filesystemobj_info').classList.remove('d-none');
    } else {
        document.getElementById('id_div_filesystemobj_info_hidden').classList.remove('d-none');
        document.getElementById('id_div_filesystemobj_info').classList.add('d-none');
    }
}

document.getElementById("id_link_show_filesystemobj_info").addEventListener("click", function(e){ toggleFileElemInfo(true); }, false);
document.getElementById("id_link_hide_filesystemobj_info").addEventListener("click", function(e){ toggleFileElemInfo(false); }, false);

document.getElementById("id_button_delete").addEventListener("click", function(e){ const objId = parseInt(document.getElementById('id_input_object_id_del').value); const objType = document.getElementById('id_input_object_type_del').value; deleteFilesystemObj(objType, objId); }, false);
document.getElementById("id_button_share").addEventListener("click", function(e){ const objId = parseInt(document.getElementById('id_input_object_id_share').value); const objType = document.getElementById('id_input_object_type_share').value; updateShareSettings(objType, objId); }, false);
document.getElementById("id_button_rename").addEventListener("click", function(e){ const objId = parseInt(document.getElementById('id_input_object_id_rename').value); const objType = document.getElementById('id_input_object_type_rename').value; renameObject(objType, objId); }, false);
document.getElementById("id_button_createFolder").addEventListener("click", function(e){ const objId = parseInt(document.getElementById('id_input_object_id_newFolder').value); const objType = document.getElementById('id_input_object_type_newFolder').value; createNewFolder(objId); }, false);
document.getElementById("id_button_uploadReplaceFile").addEventListener("click", function(e){ const objId = parseInt(document.getElementById('id_input_object_id_uploadReplace').value); replaceFileContent(objId, false); }, false);
document.getElementById("id_button_uploadNewFile").addEventListener("click", function(e){ const objId = parseInt(document.getElementById('id_input_object_id_uploadNew').value); const objType = document.getElementById('id_input_object_type_uploadNew').value; uploadFile(objId); }, false);



function loadAndMergeUserOptions(objId, accessType, objType){
    const mergedDict = JSON.parse(JSON.stringify(contactsCache));
    let targetObj;
    if (accessType === "read") {
        if (objType === "file") {
            targetObj = filesCache[objId].users_read;
        } else if (objType === "folder"){
            targetObj = foldersCache[objId].users_read;
        } else {
            displayErrorMessage("Error");
        }
    } else if (accessType === "write") {
        if (objType === "file") {
            targetObj = filesCache[objId].users_write;
        } else if (objType === "folder"){
            targetObj = foldersCache[objId].users_write;
        } else {
            displayErrorMessage("Error");
        }
    } else {
        displayErrorMessage("Error");
    }

    for (var i = 0; i < targetObj.length; i++){
        if (targetObj[i].real_name === "" || targetObj[i].real_name == null){
            mergedDict[targetObj[i].id] = {value: targetObj[i].id, label: targetObj[i].user_name, selected: true, disabled: false};
        } else {
            mergedDict[targetObj[i].id] = {value: targetObj[i].id, label: targetObj[i].user_name + " (" + targetObj[i].real_name + ")", selected: true, disabled: false};
        }
    }

    const mergedDictAsArray = Object.values(mergedDict);

    if (accessType === "read"){
        if (choicesUsersRead != null){ // already initialized
            choicesUsersRead.clearStore();
            choicesUsersRead.setChoices(mergedDictAsArray, 'value', 'label', true);
        } else {
            choicesUsersRead = new Choices('#choices-users-read', { removeItemButton: true, silent: true, choices: mergedDictAsArray });
        }
    }
    if (accessType === "write"){
        if (choicesUsersWrite != null){ // already initialized
            choicesUsersWrite.clearStore();
            choicesUsersWrite.setChoices(mergedDictAsArray, 'value', 'label', true);
        } else {
            choicesUsersWrite = new Choices('#choices-users-write', { removeItemButton: true, silent: true, choices: mergedDictAsArray });
        }
    }
}


function loadAndMergeOrgOptions(objId, accessType, objType){
    const mergedDict = JSON.parse(JSON.stringify(orgsCache));
    let targetObj;
    if (accessType === "read") {
        if (objType === "file") {
            targetObj = filesCache[objId].orgs_read;
        } else if (objType === "folder"){
            targetObj = foldersCache[objId].orgs_read;
        } else {
            displayErrorMessage("Error");
        }
    } else if (accessType === "write") {
        if (objType === "file") {
            targetObj = filesCache[objId].orgs_write;
        } else if (objType === "folder"){
            targetObj = foldersCache[objId].orgs_write;
        } else {
            displayErrorMessage("Error");
        }
    } else {
        displayErrorMessage("Error");
    }

    for (var i = 0; i < targetObj.length; i++){
        if (targetObj[i].local_name === "" || targetObj[i].local_name == null){
            mergedDict[targetObj[i].id] = {value: targetObj[i].id, label: targetObj[i].display_name, selected: true, disabled: false};
        } else {
            mergedDict[targetObj[i].id] = {value: targetObj[i].id, label: targetObj[i].display_name + " (" + targetObj[i].local_name + ")", selected: true, disabled: false};
        }
    }

    const mergedDictAsArray = Object.values(mergedDict);

    if (accessType === "read"){
        if (choicesOrgsRead != null){ // already initialized
            choicesOrgsRead.clearStore();
            choicesOrgsRead.setChoices(mergedDictAsArray, 'value', 'label', true);
        } else {
            choicesOrgsRead = new Choices('#choices-orgs-read', { removeItemButton: true, silent: true, choices: mergedDictAsArray });
        }
    }
    if (accessType === "write"){
        if (choicesOrgsWrite != null){ // already initialized
            choicesOrgsWrite.clearStore();
            choicesOrgsWrite.setChoices(mergedDictAsArray, 'value', 'label', true);
        } else {
            choicesOrgsWrite = new Choices('#choices-orgs-write', { removeItemButton: true, silent: true, choices: mergedDictAsArray });
        }
    }
}

$('#deleteObjModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const objId = invoker.getAttribute("data-id");
    const objType = invoker.getAttribute("data-type");
    const fileName = invoker.getAttribute("data-current-name");
    document.getElementById("id_input_object_id_del").value = objId;
    document.getElementById("id_input_object_type_del").value = objType;
    document.getElementById("id_del_current_name").innerText = fileName;
    document.getElementById("id_delete-modal_header_type").innerText = objType;
    document.getElementById("id_delete-modal_body_type").innerText = objType;
});

$('#shareObjModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const objId = invoker.getAttribute("data-id");
    const objType = invoker.getAttribute("data-type");
    document.getElementById("id_input_object_id_share").value = objId;
    document.getElementById("id_input_object_type_share").value = objType;

    // merge options from filesCache/foldersCache with contactsCache/orgsCache:
    loadAndMergeUserOptions(objId, "read", objType);
    loadAndMergeUserOptions(objId, "write", objType);
    loadAndMergeOrgOptions(objId, "read", objType);
    loadAndMergeOrgOptions(objId, "write", objType);
});

$('#renameObjModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const objId = invoker.getAttribute("data-id");
    const objType = invoker.getAttribute("data-type");
    const fileName = invoker.getAttribute("data-current-name");
    document.getElementById("id_input_object_id_rename").value = objId;
    document.getElementById("id_input_object_type_rename").value = objType;
    document.getElementById("id_p_current_name").innerText = fileName;
});

$('#uploadReplaceFileModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const objId = invoker.getAttribute("data-id");
    const objType = invoker.getAttribute("data-type");
    const fileName = invoker.getAttribute("data-current-name");
    document.getElementById("id_input_object_id_uploadReplace").value = objId;
    document.getElementById("id_input_object_type_uploadReplace").value = objType;
    document.getElementById("id_uploadReplace_oldFileName").innerText = fileName;
});

$('#uploadNewFileModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const objId = invoker.getAttribute("data-id");
    const objType = invoker.getAttribute("data-type");
    let parentFolderName = "";
    if (foldersCache.hasOwnProperty(objId)){
        parentFolderName = foldersCache[objId].name;
    }

    if (parentFolderName != null && parentFolderName !== ""){
        parentFolderName = ' to folder "' + parentFolderName + '"';
    }

    document.getElementById("id_input_object_id_uploadNew").value = objId;
    document.getElementById("id_input_object_type_uploadNew").value = objType;
    document.getElementById("id_uploadNew_parentFolderName").innerText = parentFolderName;
});

$('#newFolderModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const objId = invoker.getAttribute("data-id");
    const objType = invoker.getAttribute("data-type");
    let parentFolderName = "";
    if (foldersCache.hasOwnProperty(objId)){
        parentFolderName = foldersCache[objId].name;
    }

    if (parentFolderName != null && parentFolderName !== ""){
        parentFolderName = ' in folder "' + parentFolderName + '"';
    }

    document.getElementById("id_input_object_id_newFolder").value = objId;
    document.getElementById("id_input_object_type_newFolder").value = objType;
    document.getElementById("id_newFolder_parentFolderName").innerText = parentFolderName;
});

function loadObjects(){
    toggleElemsForOwnView(true);
    const folderId = parseInt(document.getElementById("id_root_folder").value);

    // adjust root container id:
    document.getElementById("id_div_subfolders_0").id = "id_div_subfolders_" + folderId
    document.getElementById("id_div_files_0").id = "id_div_files_" + folderId

    loadFolders(folderId, 0, false);
    loadFiles(folderId, 0, false);
}

window.addEventListener("load", getMe, false);
window.addEventListener("load", loadObjects, false);
window.addEventListener("load", loadMyConnections, false);
window.addEventListener("load", loadNationalOrgs, false);