function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function formDataToJSON( formData ) {
  let output = {};
  formData.forEach(
    ( value, key ) => {
      // Check if property already exist
      if ( Object.prototype.hasOwnProperty.call( output, key ) ) {
        let current = output[ key ];
        if ( !Array.isArray( current ) ) {
          // If it's not an array, convert it to an array.
          current = output[ key ] = [ current ];
        }
        current.push( value ); // Add the new value to the array.
      } else {
        output[ key ] = value;
      }
    }
  );
  return JSON.stringify( output );
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    if (typeof text == 'string'){
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
  if (text instanceof Array) {
    for (let i = 0; i < text.length; i++) {
        text[i] = escapeHtml(text[i]);
    }
    return text;
  }
  if (typeof text == 'number'){
    return text;
  }
  if (typeof text == 'boolean'){
    return text;
  }
}

function getObjIndexByKeyRecursive(obj, key){
    if (key === "")
        return "";

    if (key === ".")
        return obj;

    const keySplit = key.split(".");
    const currentKey = keySplit[0];

    if (keySplit.length === 1){
        if (typeof obj !== 'undefined' && obj != null && typeof obj === 'object' && obj.hasOwnProperty(currentKey)){
            return obj[currentKey];
        } else {
            return "";
        }
    } else {
        const remainingKey = keySplit.slice(1).join('.');
        if (typeof obj !== 'undefined' && obj != null && typeof obj === 'object' && obj.hasOwnProperty(currentKey)){
            return getObjIndexByKeyRecursive(obj[currentKey], remainingKey);
        } else {
            return "";
        }
    }
}

/**
Recursively iterates over all the children of the parent node and checks for data-label attributes.
If it finds a data-label, it extracts the label and tries to access the data keyed by the label in
the jsonData array. If there is data by that key, the innerHTML of the element with the label gets filled.
*/
function fillChildren(parentElemId, jsonData){
    const parentElem = document.getElementById(parentElemId);
    const childElements = parentElem.getElementsByTagName("*");

    for (let i = 0; i < childElements.length; i++){
        const label = childElements[i].getAttribute('data-label');

        if (label != null && label !== ''){ // if a label has been set
            const translatorFuncName = childElements[i].getAttribute('data-translator');
            const shouldEscape = childElements[i].getAttribute('data-escape');
            const data = getObjIndexByKeyRecursive(jsonData, label);
            if (typeof data != 'undefined' && data != null && data !== ""){ // if the label is present in the jsonDataArray
                if (translatorFuncName != null && translatorFuncName !== ''){
                    const translatorFunc = window.translators[translatorFuncName];
                    if (shouldEscape != null && shouldEscape === "false" ){
                        childElements[i].innerHTML = translatorFunc(data);
                    } else {
                        childElements[i].innerHTML = escapeHtml(translatorFunc(data));
                    }
                } else {
                    if (shouldEscape != null && shouldEscape === "false" ){
                        childElements[i].innerHTML = data;
                    } else {
                        childElements[i].innerHTML = escapeHtml(data);
                    }
                }
            } else {
                childElements[i].innerHTML = "";
            }
        }
    }
}

function dictToParamList(obj) {
    const str = [];
    for(let p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
}

function prettyPrintDateTime(timeStr){
    return moment(timeStr).format('DD.MM.YYYY, HH:mm');
}

function formatTimeForServer(timeStr){
    return moment(timeStr).format('YYYY-MM-DDThh:mm:ssZ');
}

/**
tableId: The id of the table element to fill. needs to contain a thead with labels and a tbody where to put data
jsonDataArray: the array of datapoints to be fed into the table
*/
function fillTable(tableId, jsonDataArray){
    const table_elem = document.getElementById(tableId);
    const thead_elem = table_elem.getElementsByTagName('thead')[0];
    const headings = thead_elem.getElementsByTagName('tr')[0].getElementsByTagName('th');
    const tbody_elem = table_elem.getElementsByTagName('tbody')[0];
    const old_tbody_id = tbody_elem.id;

    const newtBody = document.createElement('tbody');
    for (let i = 0; i < jsonDataArray.length; i++){
        const newtr = document.createElement('tr');
        newtBody.appendChild(newtr);

        for (let j = 0; j < headings.length; j++){
            const newtd = document.createElement('td');

            const label = headings[j].getAttribute('data-label');
            const translatorFuncName = headings[j].getAttribute('data-translator');
            const shouldEscape = headings[j].getAttribute('data-escape');
            if (label != null && label !== ''){ // if a label has been set
                const data = getObjIndexByKeyRecursive(jsonDataArray[i], label);
                if (data != null && data !== ''){ // if the label is present in the jsonDataArray
                        if (translatorFuncName != null && translatorFuncName !== ''){
                            const translatorFunc = window.translators[translatorFuncName];
                            if (shouldEscape != null && shouldEscape === "false" ){
                                newtd.innerHTML = translatorFunc(data);
                            } else {
                                newtd.innerHTML = escapeHtml(translatorFunc(data));
                            }
                        } else {
                            if (shouldEscape != null && shouldEscape === "false" ){
                                newtd.innerHTML = data;
                            } else {
                                newtd.innerHTML = escapeHtml(data);
                            }
                        }
                    }
            }
            newtr.appendChild(newtd);
        }
    }

    table_elem.replaceChild(newtBody, tbody_elem);
    newtBody.id = old_tbody_id;
}

function expandAndHighlightActiveNavMenu(){
    let parentElement;
    let childElement;
    let foundPrefix = false;
    if (location.pathname.startsWith("/reports/")){
        parentElement = document.querySelector('[href="#collapseReports"]');
        childElement = document.getElementById("collapseReports");
        foundPrefix = true;
    }
    if (location.pathname.startsWith("/events/")){
        parentElement = document.querySelector('[href="#collapseEvents"]');
        childElement = document.getElementById("collapseEvents");
        foundPrefix = true;
    }
    if (location.pathname.startsWith("/profile/rankings/")){
        parentElement = document.querySelector('[href="#collapseRankings"]');
        childElement = document.getElementById("collapseRankings");
        foundPrefix = true;
    }
    if (location.pathname.startsWith("/profile/org")){
        parentElement = document.querySelector('[href="#collapseGroupsAndOrgs"]');
        childElement = document.getElementById("collapseGroupsAndOrgs");
        foundPrefix = true;
    }
    if (location.pathname.startsWith("/profile/user_group")){
        parentElement = document.querySelector('[href="#collapseGroupsAndOrgs"]');
        childElement = document.getElementById("collapseGroupsAndOrgs");
        foundPrefix = true;
    }
    if (foundPrefix) {
        parentElement.classList.remove("collapsed");
        parentElement.setAttribute("aria-expanded", "true");
        childElement.classList.add("show");
        var activeLink = document.querySelector('[href="' + location.pathname + '"]');
        // TODO highlight currently active link
    }
}

function getMe(){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-me']() +  "?format=json";

    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('me', xhr.responseText);
            }
        }
    };
    xhr.send();
}

function getCaptcha(captchaKeyInputId, captchaImgId){
    const xhr = new XMLHttpRequest();
    const targetUrl = location.origin + "/api/captcha/";

    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                document.getElementById(captchaKeyInputId).value = result.captcha_key;
                document.getElementById(captchaImgId).src = "data:" + result.image_type + ";" + result.image_decode + "," + result.captcha_image;
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function displayErrors(responseObj){
    const errorsList = document.getElementById("id_ul_errors");
    errorsList.innerText = "";
    const errorCodeContainerSpan = document.getElementById("id_span_status_code_container");
    errorCodeContainerSpan.classList.remove("d-none");
    const errorCodeSpan = document.getElementById("id_span_status_code");
    errorCodeSpan.innerText = responseObj.status_code;

    let errorKeys = Object.keys(responseObj.errors);

    for (var i = 0; i < errorKeys.length; i++){
        const newErrorListItem = document.createElement("li");
        const errorKey = errorKeys[i];
        const errorVal = responseObj.errors[errorKey];
        // TODO check errorVal type via typeof - might be array or string. below code is only valid for arrays.
        if (Array.isArray(errorVal)) {
            if (errorVal.length === 0) {
                if (errorKey !== "non_field_errors") {
                    newErrorListItem.innerText = errorKey + ": " + "No error details specified.";
                } else {
                    newErrorListItem.innerText = "No error details specified.";
                }
            } else if (errorVal.length === 1) {
                if (errorKey !== "non_field_errors") {
                    newErrorListItem.innerText = errorKey + ": " + errorVal[0];
                } else {
                    newErrorListItem.innerText = errorVal[0];
                }
            } else {
                const newInnerUl = document.createElement("ul");
                for (let j = 0; j < errorVal.length; j++) {
                    let newInnerListItem = document.createElement("li");
                    if (errorKey !== "non_field_errors") {
                        newInnerListItem.innerText = errorKey + ": " + errorVal[j];
                    } else {
                        newInnerListItem.innerText = errorVal[j];
                    }
                    newInnerUl.appendChild(newInnerListItem);
                }
                newErrorListItem.appendChild(newInnerUl);
            }
        }
        if (typeof errorVal === 'string' || errorVal instanceof String){
            if (errorKey !== "non_field_errors") {
                newErrorListItem.innerText = errorKey + ": " + errorVal;
            } else {
                newErrorListItem.innerText = errorVal;
            }
        }
        errorsList.appendChild(newErrorListItem);
    }
    $("#errorModal").modal();
}

function displayErrorMessage(errorMsg){
    const errorCodeContainerSpan = document.getElementById("id_span_status_code_container");
    errorCodeContainerSpan.classList.add("d-none");
    const errorMsgContainer = document.getElementById("id_p_error_message");
    errorMsgContainer.innerText = "";
    errorMsgContainer.innerText = errorMsg;
    $("#errorModal").modal();
}

function displaySuccessMessage(successMsg){
    const successMsgContainer = document.getElementById("successModalLabel");
    successMsgContainer.innerText = "";
    successMsgContainer.innerText = successMsg;
    $("#successModal").modal();
}

function getThanks(typeKey, objId, containerId){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-thanks'](typeKey, objId);

    xhr.open('GET', targetUrl, true);
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                document.getElementById(containerId).innerText = result['thanks'];
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function toggleThanks(typeKey, objId, thanksNoContainerId, buttonId){
    const thanksButton = document.getElementById(buttonId);
    if (thanksButton.childNodes[0].classList.contains("fa-handshake-slash")) { // thanked
        removeThanks(typeKey, objId, thanksNoContainerId, buttonId);
    } else { // not thanked
        addThanks(typeKey, objId, thanksNoContainerId, buttonId);
    }
}

function addThanks(typeKey, objId, thanksNoContainerId, buttonId){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-thanks'](typeKey, objId);

    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                const thanksContainer = document.getElementById(thanksNoContainerId);
                let currentThanks = 0;
                if (thanksContainer.innerText !== "") {
                    currentThanks = parseInt(thanksContainer.innerText);
                }
                thanksContainer.innerText = "" + (currentThanks + 1);
                const thanksBtn = document.getElementById(buttonId);
                thanksBtn.innerHTML = '<i title="Unthank" class="fas fa-handshake-slash"></i>&nbsp;-1';
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({action: 'add'}));
}

function removeThanks(typeKey, objId, thanksNoContainerId, buttonId){
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-thanks'](typeKey, objId);

    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                const thanksContainer = document.getElementById(thanksNoContainerId);
                let currentThanks = 0;
                if (thanksContainer.innerText !== "") {
                    currentThanks = parseInt(thanksContainer.innerText);
                }
                thanksContainer.innerText = "" + (currentThanks - 1);
                const thanksBtn = document.getElementById(buttonId);
                thanksBtn.innerHTML = '<i title="Thank the author for this" class="far fa-handshake"></i>&nbsp;+1';
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify({action: 'delete'}));
}



window.addEventListener("load", expandAndHighlightActiveNavMenu);