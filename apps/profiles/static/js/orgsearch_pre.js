function getOrgLogoThumbnail(thumbUrl){
    return '<img alt="logo" class="rounded of-contain" src="' + thumbUrl + '" width="120" height="60"/>';
}

function getOrgProfileLink(id){
    const orgUrl = Urls['org-detail'](id);
    return '<a href="' + orgUrl + '"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

function getLinkedOrgName(orgObj){
    const orgUrl = Urls['org-detail'](orgObj.id);
    return '<a href="' + orgUrl + '">' + orgObj.display_name + '</a>';
}

function getLinkedOrgLocalName(orgObj){
    if (orgObj.local_name != undefined && orgObj.local_name != null && orgObj.local_name !== ""){
        const orgUrl = Urls['org-detail'](orgObj.id);
        return '<a href="' + orgUrl + '">' + orgObj.local_name + '</a>';
    } else {
        return "";
    }
}

translators = {
    "logoPreview": getOrgLogoThumbnail,
    "orgProfileLink": getOrgProfileLink,
    "linkedOrgName": getLinkedOrgName,
    "linkedOrgLocalName": getLinkedOrgLocalName
}

function renderOrgPreview(orgObj, idToAppend){
    const orgRenderFunc = Handlebars.templates["orgpreview.hbs"];
    const orgId = orgObj['id'];
    const domId = "id_org_" + orgId;

    const hbContext = {};
    hbContext['org'] = orgObj;
    hbContext['domId'] = domId;
    hbContext['orgPageUrl'] = Urls['org-detail'](orgId);

    const newOrgPreview = createElementFromHTML(orgRenderFunc(hbContext));

    const whereToAppend = document.getElementById(idToAppend);
    whereToAppend.appendChild(newOrgPreview);
}

function renderOrgSearchResults(resultObj, containerId){
    document.getElementById(containerId).innerHTML = "";
    const orgsArray = resultObj.results;

    for (var i = 0; i < orgsArray.length; i++){
        renderOrgPreview(orgsArray[i], containerId);
    }
}

function doOrgSearch() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-orggroups-search-global']() + "?format=json";
    const chosenCountries = choicesCountries.getValue().map(a => a.value).join(",");
    const chosenTypes = choicesTypes.getValue().map(a => a.value).join(",");
    const searchString = document.getElementById("id_search_box").value;
    xhr.open('GET', targetUrl + "&search=" + searchString + "&countries=" + chosenCountries + "&types=" + chosenTypes, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const responseAsJSON = JSON.parse(xhr.responseText);
                renderOrgSearchResults(responseAsJSON, "id_searchresults_container");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}