function createNewReport(){
    const typeStr = document.getElementById("id_type_str").value;
    let targetUrl;
    if (typeStr === "report"){
        targetUrl = Urls['report-api-create']() + "?format=json";
    } else if (typeStr === "onlinereport"){
        targetUrl = Urls['onlinereport-api-create']() + "?format=json";
    } else {
        displayErrorMessage("Error - wrong type!");
        return;
    }

    const formData = new FormData(document.getElementById("id_form_new_report"));
    formData.set('timestamp', formData.get('timestamp') + "T00:00Z");
    formData.set('initial-timestamp', formData.get('initial-timestamp') + "T00:00Z");

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                const typeStr = document.getElementById("id_type_str").value;
                const isAuthenticated = document.getElementById("id_authenticated").value.toLowerCase() === "true";
                if (typeStr === "report") {
                    if (response.edit_token != null && response.edit_token !== "") {
                        localStorage.setItem('report_token', response.edit_token);
                    }
                    if (isAuthenticated) {
                        location.href = Urls['report-add-images'](response.id);
                    } else {
                        location.href = Urls['report-add-images-keyed'](response.id, response.edit_token);
                    }
                } else if (typeStr === "onlinereport"){
                    if (response.edit_token != null && response.edit_token !== "") {
                        localStorage.setItem('onlinereport_token', response.edit_token);
                    }
                    if (isAuthenticated) {
                        location.href = Urls['onlinereport-add-images'](response.id);
                    } else {
                        location.href = Urls['onlinereport-add-images-keyed'](response.id, response.edit_token);
                    }
                } else {
                    displayErrorMessage("Error - wrong type!");
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify(Object.fromEntries(formData)));
}

function fetchAndLoadReport(){
    if (document.getElementById("id_mode").value !== "update"){
        return;
    }
    const isAuthenticated = document.getElementById("id_authenticated").value.toLowerCase() === "true";
    const typeStr = document.getElementById("id_type_str").value;
    const id = parseInt(document.getElementById("id_report_id").value);
    let targetUrl;
    if (typeStr === "report"){
        if (isAuthenticated) {
            targetUrl = Urls['report-api-detail'](id) + "?format=json";
        } else {
            targetUrl = Urls['report-api-detail-keyed'](id, localStorage.getItem("report_token")) + "?format=json";
        }
    } else if (typeStr === "onlinereport"){
        if (isAuthenticated) {
            targetUrl = Urls['onlinereport-api-detail'](id) + "?format=json";
        } else {
            targetUrl = Urls['onlinereport-api-detail-keyed'](id, localStorage.getItem("onlinereport_token")) + "?format=json";
        }
    } else {
        displayErrorMessage("Error - wrong type!");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', targetUrl, true);
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (typeStr === "report"){
                    const selectCategoryInput = document.getElementById("id_category");
                    selectCategoryInput.value = response.category;
                    const descriptionInput = document.getElementById("id_description");
                    descriptionInput.innerText = response.description;
                    const timestampInput = document.getElementById("id_timestamp");
                    timestampInput.value = response.timestamp;
                    const locationNameInput = document.getElementById("id_location_name");
                    locationNameInput.value = response.location_name;
                    const selectLocationTypeInput = document.getElementById("id_location_type");
                    selectLocationTypeInput.value = response.location_type;
                    const geomField = document.getElementById("id_geom");
                    geomField.innerText = JSON.stringify(response.geom);
                    if (response.geom !== ""){
                        const lng = response.geom.coordinates[0];
                        const lat = response.geom.coordinates[1];
                        const lngLat = {'lat': lat, 'lng': lng};
                        window.newMarker = new mapboxgl.Marker()
                        .setLngLat(lngLat)
                        .addTo(window.myMapVar);
                        window.myMapVar.flyTo({
                            center: lngLat
                        });
                    }
                } else if (typeStr === "onlinereport"){
                    // TODO
                } else {
                    displayErrorMessage("Error - wrong type!");
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function updateReport(){
    const typeStr = document.getElementById("id_type_str").value;
    const id = parseInt(document.getElementById("id_report_id").value);
    const isAuthenticated = document.getElementById("id_authenticated").value.toLowerCase() === "true";
    let targetUrl;
    if (typeStr === "report"){
        if (isAuthenticated) {
            targetUrl = Urls['api-report-update'](id) + "?format=json";
        } else {
            targetUrl = Urls['api-report-update-keyed'](id, localStorage.getItem("report_token")) + "?format=json";
        }
    } else if (typeStr === "onlinereport"){
        if (isAuthenticated) {
            targetUrl = Urls['api-onlinereport-update'](id) + "?format=json";
        } else {
            targetUrl = Urls['api-report-update-keyed'](id, localStorage.getItem("onlinereport_token")) + "?format=json";
        }
    } else {
        displayErrorMessage("Error - wrong type!");
        return;
    }

    const formData = new FormData(document.getElementById("id_form_new_report"));
    const currentTimeStamp = formData.get('timestamp');
    const currentInitialTimeStamp = formData.get('initial-timestamp');
    if (!currentTimeStamp.match(/T([0-9][0-9][:])?[0-9][0-9][:][0-9][0-9]Z/i)) {
        formData.set('timestamp', currentTimeStamp + "T00:00Z");
    }
    if (!currentInitialTimeStamp.match(/T([0-9][0-9][:])?[0-9][0-9][:][0-9][0-9]Z/i)) {
        formData.set('initial-timestamp', currentInitialTimeStamp + "T00:00Z");
    }

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 204 || xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const isAuthenticated = document.getElementById("id_authenticated").value.toLowerCase() === "true";
                const typeStr = document.getElementById("id_type_str").value;
                if (typeStr === "report") {
                    if (isAuthenticated) {
                        location.href = Urls['report-add-images'](response.id);
                    } else {
                        location.href = Urls['report-add-images-keyed'](id, localStorage.getItem("report_token")) + "?format=json";
                    }
                } else if (typeStr === "onlinereport") {
                    if (isAuthenticated) {
                        location.href = Urls['onlinereport-add-images'](response.id);
                    } else {
                        location.href = Urls['onlinereport-add-images-keyed'](id, localStorage.getItem("onlinereport_token")) + "?format=json";
                    }
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify(Object.fromEntries(formData)));
}