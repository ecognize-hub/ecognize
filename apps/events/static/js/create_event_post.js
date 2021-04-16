function fixDate(){
    document.getElementById('id_timestamp').value = startPicker.getDate().getFullYear() + '-' + (startPicker.getDate().getMonth()+1) + '-' + startPicker.getDate().getDate();
    return true;
}

$(function () {
    $('#startdatetimepicker').datetimepicker({format: 'YYYY-MM-DD HH:mm:ss', icons: {time: "far fa-clock"}});
});

$(function () {
    $('#enddatetimepicker').datetimepicker({format: 'YYYY-MM-DD HH:mm:ss', icons: {time: "far fa-clock"}},);
});

function updateEvent(e){
    let i;
    e.preventDefault();
    const eventId = parseInt(document.getElementById("id_event_id").value);
    const formElem = document.getElementById('id_form_new_report');
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-events-edit'](eventId) + "?format=json";
    const csrftoken = getCookie('csrftoken');
    const formData = new FormData(formElem);

    //fix time formatting:
    formData.set('datetime_start', formatTimeForServer(formData.get('datetime_start')));
    formData.set('datetime_end', formatTimeForServer(formData.get('datetime_end')));

    //fix multi choice values into arrays:

    const cohostsArray = [];
    const cohostsSelected = document.getElementById("id_cohosts").selectedOptions;
    for (i = 0; i < cohostsSelected.length; i++) {
        cohostsArray.push(cohostsSelected[i].value);
    }
    while (formData.get('cohosts') != null && formData.get('cohosts') != undefined){
        formData.delete('cohosts');
    }
    if (cohostsArray.length > 0) { formData.set('cohosts', cohostsArray); }

    const invitedArray = [];
    const invitedSelected = document.getElementById("id_invited").selectedOptions;
    for (i = 0; i < invitedSelected.length; i++) {
        invitedArray.push(invitedSelected[i].value);
    }
    while (formData.get('invited') != null && formData.get('invited') != undefined){
        formData.delete('invited');
    }
    if (invitedArray.length > 0) { formData.set('invited', invitedArray); }


    xhr.open('PATCH', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    //xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                window.location.href = Urls['view-events-detail'](eventId);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(formData);
}

function createEvent(e){
    let i;
    e.preventDefault();
    const formElem = document.getElementById('id_form_new_report');
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-events-create']() + "?format=json";
    const csrftoken = getCookie('csrftoken');
    const formData = new FormData(formElem);

    //fix time formatting:
    formData.set('datetime_start', formatTimeForServer(formData.get('datetime_start')));
    formData.set('datetime_end', formatTimeForServer(formData.get('datetime_end')));

    //fix multi choice values into arrays:

    const cohostsArray = [];
    const cohostsSelected = document.getElementById("id_cohosts").selectedOptions;
    for (i = 0; i < cohostsSelected.length; i++) {
        cohostsArray.push(cohostsSelected[i].value);
    }
    while (formData.get('cohosts') != null && formData.get('cohosts') != undefined){
        formData.delete('cohosts');
    }
    if (cohostsArray.length > 0) { formData.set('cohosts', cohostsArray); }

    const invitedArray = [];
    const invitedSelected = document.getElementById("id_invited").selectedOptions;
    for (i = 0; i < invitedSelected.length; i++) {
        invitedArray.push(invitedSelected[i].value);
    }
    while (formData.get('invited') != null && formData.get('invited') != undefined){
        formData.delete('invited');
    }
    if (invitedArray.length > 0) { formData.set('invited', invitedArray); }


    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    //xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                window.location.href = Urls['view-events-detail'](JSON.parse(xhr.responseText).id)
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(formData);
}

var choicesCohosts = new Choices('#id_cohosts', {
    removeItemButton: true, silent: true,
});

var choicesInvited = new Choices('#id_invited', {
    removeItemButton: true, silent: true,
});

document.getElementById("id_form_new_report").addEventListener("submit", function(e) {
    const mode = document.getElementById("id_mode").value;
    if (mode === "Create") {
        createEvent(e);
    } else if (mode === "Update"){
        updateEvent(e);
    }
}
, false);
document.getElementById("id_online").addEventListener("click", function(e) {
    if (e.target.checked) {
        document.getElementById("online_address_container").classList.remove("d-none");
        document.getElementById("offline_address_container").classList.add("d-none");
    } else {
        document.getElementById("online_address_container").classList.add("d-none");
        document.getElementById("offline_address_container").classList.remove("d-none");
    }
}, false);
