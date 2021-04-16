function getImages(){
    const imageCtr = document.getElementById("imagecontainer");
    const reportId = imageCtr.getAttribute("data-reportid");

    const xhr = new XMLHttpRequest();
    let targetUrl;
    if (document.getElementById("id_authenticated").value.toLowerCase() === "true") {
        targetUrl = Urls['report-api-images'](thisObjContentTypeId, reportId) + '?format=json'
    } else {
        if (thisObjContentTypeId === reportContentTypeId) {
            targetUrl = Urls['report-api-images-keyed'](thisObjContentTypeId, reportId, localStorage.getItem("report_token")) + '?format=json'
        } else if (thisObjContentTypeId === onlineReportContentTypeId) {
            targetUrl = Urls['onlinereport-api-images-keyed'](thisObjContentTypeId, reportId, localStorage.getItem("onlinereport_token")) + '?format=json'
        } else {
            displayErrorMessage("Error when determining report type while loading report images.");
        }
    }
    xhr.open('GET', targetUrl, true); // TODO why true?
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const jsonData = JSON.parse(xhr.responseText);
                for (var i = 0; i < jsonData.results.length; i++){
                    addImageToBody(jsonData.results[i]);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function fixLinksForUnauthenticatedAccess(){
    if (document.getElementById("id_authenticated").value.toLowerCase() === "false") {
        const finalizeLink = document.getElementById("id_finalize_link");
        const backLink = document.getElementById("id_back_link");
        const secondStepLink = document.getElementById("id_second_step_link");
        if (thisObjContentTypeId === reportContentTypeId) {
            finalizeLink.href = finalizeLink.href + '/' + localStorage.getItem("report_token");
            backLink.href = backLink.href + '/' + localStorage.getItem("report_token");
            secondStepLink.href = secondStepLink.href + '/' + localStorage.getItem("report_token");
        } else if (thisObjContentTypeId === onlineReportContentTypeId) {
            finalizeLink.href = finalizeLink.href + '/' + localStorage.getItem("onlinereport_token");
            backLink.href = backLink.href + '/' + localStorage.getItem("onlinereport_token");
            secondStepLink.href = secondStepLink.href + '/' + localStorage.getItem("onlinereport_token");
        } else {
            displayErrorMessage("Type error when determining report type.");
        }
    }
}

function addImageToBody(imageObj) {
    const imageCtr = document.getElementById("imagecontainer");
    const newCol = document.createElement("div");
    newCol.classList.add("col-3");
    newCol.classList.add("img-wrap");
    newCol.id = "imgwrap-" + imageObj.id;
    const delBtn = document.createElement("span");
    delBtn.classList.add("close");
    delBtn.setAttribute("data-imgid", imageObj.id);
    delBtn.innerHTML = "&times;";
    delBtn.addEventListener("click", deleteImage);
    const newImg = document.createElement("img");
    newImg.src = imageObj.thumbnail;
    newImg.classList.add("img-thumbnail");
    newImg.setAttribute("data-imgid", imageObj.id);
    newCol.appendChild(delBtn);
    newCol.appendChild(newImg);
    imageCtr.appendChild(newCol);
}

function deleteImage(event){
    const imgId = event.target.getAttribute("data-imgid");
    const is_authenticated = document.getElementById("id_authenticated").value.toLowerCase() === "true";
    let url;
    if (is_authenticated) {
        url = Urls['report-api-del-image'](thisObjContentTypeId, imgId);
    } else {
        if (thisObjContentTypeId === reportContentTypeId){
            url = Urls['report-api-del-image-keyed'](thisObjContentTypeId, imgId, localStorage.getItem("report_token"));
        } else if (thisObjContentTypeId === onlineReportContentTypeId){
            url = Urls['report-api-del-image-keyed'](thisObjContentTypeId, imgId, localStorage.getItem("onlinereport_token"));
        } else {
            displayErrorMessage("Type error when trying to finalize report.");
        }
    }
    const csrftoken = getCookie('csrftoken');
    const request = new XMLHttpRequest();
    request.open('DELETE', url, true);
    request.setRequestHeader("X-CSRFToken", csrftoken);
    request.onload = function() {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status === 204) {
                const imgWrap = document.getElementById("imgwrap-" + imgId);
                imgWrap.style.display = "none";
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    request.onerror = function() {
        displayErrorMessage("Delete failed.");
    };
    request.send();
}

function finalizeReport(){
    const is_authenticated = document.getElementById("id_authenticated").value.toLowerCase() === "true";
    let targetUrl;
    if (is_authenticated) {
        if (thisObjContentTypeId === reportContentTypeId) {
            targetUrl = Urls['api-report-finalize'](reportId) + "?format=json";
        } else if (thisObjContentTypeId === onlineReportContentTypeId) {
            targetUrl = Urls['api-onlinereport-finalize'](reportId) + "?format=json";
        } else {
            displayErrorMessage("Type error when trying to finalize report.");
        }
    } else {
        if (thisObjContentTypeId === reportContentTypeId) {
            targetUrl = Urls['api-report-finalize-keyed'](reportId, localStorage.getItem("report_token")) + "?format=json";
        } else if (thisObjContentTypeId === onlineReportContentTypeId) {
            targetUrl = Urls['api-onlinereport-finalize-keyed'](reportId, localStorage.getItem("onlinereport_token")) + "?format=json";
        } else {
            displayErrorMessage("Type error when trying to finalize report.");
        }
    }

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                if (is_authenticated) {
                    window.location.href = Urls['my-reports-list']();
                } else {
                    if (thisObjContentTypeId === reportContentTypeId) {
                        localStorage.removeItem("report_token");
                    } else if (thisObjContentTypeId === onlineReportContentTypeId) {
                        localStorage.removeItem("onlinereport_token");
                    } else {
                        displayErrorMessage("Type error after finalizing report.");
                    }
                    window.location.href = "/"; // TODO change to thanks page
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function uploadImage(event) {
    const form = document.getElementById("uploadForm");
    const is_authenticated = document.getElementById("id_authenticated").value.toLowerCase() === "true";
    let url;
    if (is_authenticated) {
        url = Urls['report-api-add-image'](thisObjContentTypeId, reportId);
    } else {
        if (thisObjContentTypeId === reportContentTypeId){
            url = Urls['report-api-add-image-keyed'](thisObjContentTypeId, reportId, localStorage.getItem("report_token"));
        } else if (thisObjContentTypeId === onlineReportContentTypeId){
            url = Urls['report-api-add-image-keyed'](thisObjContentTypeId, reportId, localStorage.getItem("onlinereport_token"));
        } else {
            displayErrorMessage("Type error when trying to finalize report.");
        }
    }
    const request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.onload = function() {
        if (request.readyState === 4) {
            if (request.status === 201) {
                const jsonData = JSON.parse(request.responseText);
                addImageToBody(jsonData);
            } else {
                displayErrors(JSON.parse(request.responseText));
            }
        }
    };
    request.onerror = function() {
        displayErrorMessage("Upload failed.");
    };
    request.send(new FormData(form)); // create FormData from form that triggered event
}