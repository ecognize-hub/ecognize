var oldImageSrc = ""; // container to keep old img src in case user aborts editing

function toggleEditMode(enable){
    const titleElem = document.getElementById("id_profile_title");
    const titleEdit = document.getElementById("id_profile_title_input");
    const avatarElem = document.getElementById("id_profile_avatar");
    const bioElem = document.getElementById("id_profile_bio");
    const bioInput = document.getElementById("id_profile_bio_input");
    const changeAvatarBtn = document.getElementById("id_btn_update_image");
    const aboutTab = document.getElementById("about-tab");

    if (enable){
        aboutTab.click();

        document.getElementById("id_button_edit").classList.add("d-none");
        document.getElementById("id_button_save_profile").classList.remove("d-none");
        document.getElementById("id_button_abort_edit_profile").classList.remove("d-none");

        titleElem.classList.add("d-none");
        titleEdit.classList.remove("d-none");

        bioElem.classList.add("d-none");
        bioInput.classList.remove("d-none");

        changeAvatarBtn.classList.remove("d-none");
    } else {
        document.getElementById("id_button_edit").classList.remove("d-none");
        document.getElementById("id_button_save_profile").classList.add("d-none");
        document.getElementById("id_button_abort_edit_profile").classList.add("d-none");

        titleElem.classList.remove("d-none");
        titleEdit.classList.add("d-none");

        bioElem.classList.remove("d-none");
        bioInput.classList.add("d-none");

        changeAvatarBtn.classList.add("d-none");
        avatarElem.src = oldImageSrc;
    }
}

function saveProfile(){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls["api-my-profile-update"]() + '?format=json';

    const titleElem = document.getElementById("id_profile_title");
    const titleEdit = document.getElementById("id_profile_title_input");
    const avatarElem = document.getElementById("id_profile_avatar");
    const avatarInput = document.getElementById("id_file_field");
    const bioElem = document.getElementById("id_profile_bio");
    const bioInput = document.getElementById("id_profile_bio_input");

    const params = {'title': titleEdit.value, 'bio': bioInput.value};

    if( avatarInput.files.length > 0 ){
        const fileAsBase64Field = document.getElementById("id_avatar_b64_input");
        params['avatar'] = fileAsBase64Field.value;
    }

    const csrftoken = getCookie('csrftoken');
    xhr.open('PATCH', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                titleElem.textContent = titleEdit.value;
                bioElem.textContent = bioInput.value;
                toggleEditMode(false);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify(params));
}

function openFileDialog(e){
    document.getElementById('id_file_field').click();
    e.preventDefault();
}

function handleFileSelect(evt) {
    const f = evt.target.files[0]; // FileList object
    const reader = new FileReader();
    reader.fileName = f.name
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            const binaryData = e.target.result;
            const fileNameSplit = e.target.fileName.split(".");
            const fileExtension = fileNameSplit[fileNameSplit.length];
            //Converting Binary Data to base 64
            const base64String = window.btoa(binaryData);
            //showing file converted to base64
            document.getElementById('id_avatar_b64_input').value = base64String;
            document.getElementById('id_profile_avatar').src = "data:image/" + fileExtension + ";base64," + base64String;
        };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsBinaryString(f);
}

document.getElementById("id_button_edit").addEventListener("click", function(e){ toggleEditMode(true); });
document.getElementById("id_button_abort_edit_profile").addEventListener("click", function(e){ toggleEditMode(false); });
document.getElementById("id_button_save_profile").addEventListener("click", saveProfile);
document.getElementById('id_btn_update_image').addEventListener('click', openFileDialog);
document.getElementById('id_file_field').addEventListener('change', handleFileSelect, false);
window.addEventListener("load", function(e){ oldImageSrc = document.getElementById("id_profile_avatar").src; }, false)