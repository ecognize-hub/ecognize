function createLinkedName(forumObj){
    const id = forumObj.id;
    const targetUrl = Urls['forum-details'](id);

    return '<li><h5><a href="' + targetUrl + '">' + forumObj.name + '</a></h5></li>';
}

function renderForumPreview(forumObj, containerDomId){
    const forumRenderFunc = Handlebars.templates["forumpreview.hbs"];
    const newForumId = "id_forum_" + forumObj.id;

    const hbContext = {};
    hbContext['forumLink'] = Urls['forum-details'](forumObj.id);
    hbContext['forumName'] = forumObj.name;
    hbContext['domId'] = newForumId;

    const newForumPreview = createElementFromHTML(forumRenderFunc(hbContext));

    document.getElementById(containerDomId).appendChild(newForumPreview);
}

translators = {
    "createLinkedName": createLinkedName
}

function loadPublicForums() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forums-list-public']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const forumsContainer = document.getElementById("public_forums_container");
                forumsContainer.innerHTML = "";
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    renderForumPreview(responseAsJSON.results[i], forumsContainer.id);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMyOccupationalForums() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forums-list-occupational-group']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const forumsContainer = document.getElementById("occupational_forums_container");
                forumsContainer.innerHTML = "";
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    renderForumPreview(responseAsJSON.results[i], forumsContainer.id);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMyOrgForum() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forums-list-my-org']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const forumsContainer = document.getElementById("org_forum_container");
                forumsContainer.innerHTML = "";
                renderForumPreview(responseAsJSON, forumsContainer.id);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMyParentOrgForum() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forums-list-parent']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const forumsContainer = document.getElementById("parent_forum_container");
                forumsContainer.innerHTML = "";
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    renderForumPreview(responseAsJSON.results[i], forumsContainer.id);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMyCustomForums() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-forums-list-custom']() + "?format=json";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                const forumsContainer = document.getElementById("custom_forum_container");
                forumsContainer.innerHTML = "";
                for (var i = 0; i < responseAsJSON.results.length; i++){
                    renderForumPreview(responseAsJSON.results[i], forumsContainer.id);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

window.addEventListener("load", loadMyOccupationalForums, false);
window.addEventListener("load", loadPublicForums, false);
window.addEventListener("load", loadMyOrgForum, false);
window.addEventListener("load", loadMyCustomForums, false);
window.addEventListener("load", loadMyParentOrgForum, false);