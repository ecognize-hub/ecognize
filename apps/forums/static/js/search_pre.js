var forumId;

function getRoundUserAvatarThumbnail(avatarUrl){
    return '<img alt="avatar" class="border rounded-circle" src="' + avatarUrl + '" width="50" height="50" />';
}

function getLinkedThreadTitle(threadObj){
    return '<a href="' + Urls['thread-detail'](forumId, threadObj.id) + '"><h5>' + threadObj.subject + '</h5>';
}

function getLinkedAvatarThumbnail(userObj){
    var baseUrl = Urls['userprofile-detail'](userObj.id);
    return '<a href="' + baseUrl + '">' + getRoundUserAvatarThumbnail(userObj.thumbnail) + '</a>';
}

translators = {
    "avatarThumbnail": getRoundUserAvatarThumbnail,
    "linkedAvatarThumbnail": getLinkedAvatarThumbnail,
    "prettyPrintDateTime": prettyPrintDateTime,
    "linkedTitle": getLinkedThreadTitle
}

function loadThreads(paramsDict) {
    const xhr = new XMLHttpRequest();
    const forumId = document.getElementById("id_forum_id").value;
    const targetUrl = Urls['api-forum-threads-search'](forumId) + '?format=json';

    xhr.open('POST', targetUrl, true);
    const csrftoken = getCookie('csrftoken');
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const jsonData = JSON.parse(xhr.responseText);
                const container = document.getElementById("id_search_results_container");
                container.innerHTML = "";

                document.getElementById("id_search_results_heading").classList.remove("d-none");
                document.getElementById("id_search_results_columns").classList.remove("d-none");

                if (jsonData.results.length === 0){
                    container.innerHTML = "<i>No results found.</i>";
                    document.getElementById("id_search_results_columns").classList.add("d-none");
                }
                const threadRenderFunc = Handlebars.templates["threadpreview.hbs"];
                for (var i = 0; i < jsonData.results.length; i++){
                    const thisThread = jsonData.results[i];
                    const newThreadId = "id_thread_" + thisThread.id;

                    const hbContext = {};
                    hbContext['domId'] = newThreadId;
                    hbContext['author'] = thisThread.author;
                    hbContext['last_post_user'] = thisThread.last_post_user;
                    hbContext['authorProfileLink'] = Urls['userprofile-detail'](thisThread.author.id);
                    hbContext['lastPostUserProfileLink'] = Urls['userprofile-detail'](thisThread.last_post_user.id);
                    hbContext['thread'] = thisThread;
                    hbContext['started_timestamp'] = prettyPrintDateTime(thisThread.started_timestamp);
                    hbContext['last_post_datetime'] = prettyPrintDateTime(thisThread.last_post_datetime);
                    hbContext['threadLink'] = Urls['thread-detail'](forumId, thisThread.id);

                    const newThreadPreview = createElementFromHTML(threadRenderFunc(hbContext));
                    container.appendChild(newThreadPreview);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify(paramsDict));
}

function doThreadSearch(){
    //gather values:
    let paramsDict = {'forum_id': document.getElementById("id_forum_id").value};

    if (document.getElementById("id_search_mode_or").checked){
        paramsDict['search_mode'] = "OR";
    } else if (document.getElementById("id_search_mode_and").checked){
        paramsDict['search_mode'] = "AND";
    } else {
        displayErrorMessage("Error with search mode, please choose a valid option.");
        return;
    }

    const search_terms = document.getElementById("id_search_terms").value;

    if (search_terms.length === 0){
        displayErrorMessage("Please enter search terms.");
        return;
    }

    const split_search_terms = search_terms.split(" ");
    for (var i = 0; i < split_search_terms.length; i++){
        if (split_search_terms[i].length < 4){
            displayErrorMessage("No search term may be shorter than 4 characters.");
            return;
        }
    }

    paramsDict['search_terms'] = search_terms;

    if (document.getElementById("id_search_field_title").checked){
        paramsDict['search_field_title'] = true;
    }
    if (document.getElementById("id_search_field_body").checked){
        paramsDict['search_field_body'] = true;
    }

    loadThreads(paramsDict);
}