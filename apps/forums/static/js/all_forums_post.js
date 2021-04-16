// document.getElementById("id_btn_updateChosenOccupationalGroups").addEventListener("click", updateChosenOccupationalGroups);
document.getElementById("id_btn_getOccupationalGroupIDsAndSubmit").addEventListener("click", createCustomForum, false);

var choicesConnections;
var choicesOrgs;
var choicesMods;
var choicesAdmins;

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
                choicesConnections = new Choices('#choices-connections', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: choicesArray });
                choicesMods = new Choices('#choices-mods', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: choicesArray });
                choicesAdmins = new Choices('#choices-admins', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: choicesArray });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadOrgs() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-orggroups-search-global']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const choicesArray = [];
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    choicesArray.push({value: responseAsJSON.results[i].id, label: responseAsJSON.results[i].display_name, selected: false, disabled: false})
                }
                choicesOrgs = new Choices('#choices-orgs', {itemSelectText: 'Select', removeItemButton: true, silent: true, searchFields: ['label'], choices: choicesArray });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function createCustomForum(){
    let i;

    const participant_users_profiles = choicesConnections.getValue();
    const moderators = choicesMods.getValue();
    const administrators = choicesAdmins.getValue();

    const participant_users_profiles_array = new Array(participant_users_profiles.length);
    const moderators_array = new Array(moderators.length);
    const administrators_array = new Array(administrators.length);

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

    const participant_organizations = choicesOrgs.getValue();
    const participant_organizations_array = new Array(participant_organizations.length);
    for (i = 0; i < participant_organizations.length; i++) {
        participant_organizations_array[i] = participant_organizations[i].value;
    }

    const targetUrl = document.getElementById("id_createNewForum").action;

    const newForumName = document.getElementById("name").value;

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                loadMyCustomForums();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({name: newForumName, moderators: moderators_array, administrators: administrators_array, participant_organizations: participant_organizations_array, participant_users_profiles: participant_users_profiles_array})); // participant_generic_groups: participant_occupational_groups_array
}

$('#createNewForumModal').on('show.bs.modal', function (event) {
  loadMyConnections();
  loadOrgs();
});