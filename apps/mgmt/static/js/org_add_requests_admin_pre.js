function createNewOrg(requestId){
    let targetUrl;
    if (requestId > 0) {
        targetUrl = Urls['api-req-org-addition-add'](requestId) + "?format=json";
    } else {
        targetUrl = Urls['api-org-addition-add']() + "?format=json";
    }

    const chosenCountries = choicesCountries.getValue(true);

    const formData = new FormData(document.getElementById("id_form_new_org"));

    const formDataAsObj = Object.fromEntries(formData); // need to convert to object first to store array

    formDataAsObj['countries'] = chosenCountries;

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify(formDataAsObj));
}

function deleteOrgRequest(requestId){
    const targetUrl = Urls['api-req-org-addition-delete'](requestId) + "?format=json";

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 204) {
                location.reload();
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function handleFileSelect(evt) {
    const f = evt.target.files[0]; // FileList object
    const reader = new FileReader();
    reader.fileName = f.name
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
    return function(e) {
        const binaryData = e.target.result;
        //Converting Binary Data to base 64
        const base64String = window.btoa(binaryData);
        //showing file converted to base64
        document.getElementById('id_input_logo_id').value = base64String;
    };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsBinaryString(f);
}