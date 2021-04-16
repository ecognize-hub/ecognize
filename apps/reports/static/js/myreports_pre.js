function getMainCategory(key) {
    return reportCategoriesDict[key][0];
}

function getSubCategory(key) {
    return reportCategoriesDict[key][1];
}

function getOnlineCategory(key) {
    return onlineReportCategoriesDict[key];
}

function getLocationType(key) {
    return locationTypeDict[key];
}

function getCountryName(key) {
    return countriesDict[key];
}

function createButtons(id){
    return createDetailsModalButton(id) + "&nbsp;&nbsp;" + createDeleteModalButton(id);
}

function createOnlineButtons(id){
    return createOnlineDetailsModalButton(id) + "&nbsp;&nbsp;" + createOnlineDeleteModalButton(id);
}

function createDetailsModalButton(id) {
    return '<a href="#" data-toggle="modal" data-target="#reportDetailModal" data-report="' + id + '"><abbr title="Details"><i title="Details" class="fas fa-info-circle"></i></abbr></a>';
}

function createOnlineDetailsModalButton(id) {
    return '<a href="#" data-toggle="modal" data-target="#onlineReportDetailModal" data-report="' + id + '"><abbr title="Details"><i title="Details" class="fas fa-info-circle"></i></abbr></a>';
}

function createDeleteModalButton(id) {
    return '<a href="#" data-toggle="modal" data-target="#reportDeleteModal" data-type="report" data-report="' + id + '"><abbr title="Delete"><i class="fas fa-trash-alt"></i></abbr></a>';
}

function createOnlineDeleteModalButton(id) {
    return '<a href="#" data-toggle="modal" data-target="#reportDeleteModal" data-type="onlineReport" data-report="' + id + '"><abbr title="Delete"><i class="fas fa-trash-alt"></i></abbr></a>';
}

translators = {
    "mainCategory": getMainCategory,
    "subCategory": getSubCategory,
    "locationType": getLocationType,
    "countryName": getCountryName,
    "onlineCategory": getOnlineCategory,
    "createButtons": createButtons,
    "createOnlineButtons": createOnlineButtons,
    "prettyPrintDateTime": prettyPrintDateTime
}

function loadMyReports() {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-my-reports-list']() + '?format=json';
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('reports', xhr.responseText);
                const responseAsJSON = JSON.parse(xhr.responseText);
                fillTable("id_table_reports", responseAsJSON.results.features.slice(0, 12));
                $('#id_table_reports').pagination({
                    dataSource: JSON.parse(sessionStorage.getItem('reports')),
                    locator: 'results.features',
                    pageSize: 12,
                    callback: function(data, pagination) {
                        fillTable("id_table_reports", data);
                    }
                });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadMyOnlineReports() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', Urls['api-my-onlinereports-list']() + '?format=json', true); // TODO why true
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('onlinereports', xhr.responseText);
                var responseAsJSON = JSON.parse(xhr.responseText);
                fillTable("id_table_onlinereports", responseAsJSON.results.slice(0, 12));
                $('#id_table_onlinereports').pagination({
                    dataSource: function(done){
                        done(JSON.parse(sessionStorage.getItem('onlinereports')).results);
                    },
                    pageSize: 12,
                    callback: function(data, pagination) {
                        fillTable("id_table_onlinereports", data);
                    }
                });
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function deleteReport(){
    const id = document.getElementById("id_button_deleteReport").getAttribute("data-reportid");
    const type = document.getElementById("id_button_deleteReport").getAttribute("data-type");
    const csrftoken = getCookie('csrftoken');
    let targetUrl;
    if (type === "report")
        targetUrl = Urls['report-delete'](id);
    else if (type === "onlineReport"){
        targetUrl = Urls['onlinereport-delete'](id);
    }
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                displaySuccessMessage("Deletion successful.");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
            loadMyReports();
            loadMyOnlineReports();
        }
    };
    xhr.send();
}

window.addEventListener("load", loadMyReports, false);
window.addEventListener("load", loadMyOnlineReports, false);