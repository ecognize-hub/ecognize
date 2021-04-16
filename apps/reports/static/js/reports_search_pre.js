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

function createDetailsModalButton(id) {
    return '<a href="#" data-toggle="modal" data-type="report" data-target="#reportDetailModal" data-report="' + id + '"><i data-toggle="tooltip" data-placement="top" title="Details" class="fas fa-info-circle"></i></a>';
}

function createOnlineDetailsModalButton(id) {
    return '<a href="#" data-toggle="modal" data-type="onlinereport" data-target="#onlineReportDetailModal" data-report="' + id + '"><i data-toggle="tooltip" data-placement="top" title="Details" class="fas fa-info-circle"></i></a>';
}

translators = {
    "mainCategory": getMainCategory,
    "subCategory": getSubCategory,
    "onlineCategory": getOnlineCategory,
    "locationType": getLocationType,
    "countryName": getCountryName,
    "createDetailsButton": createDetailsModalButton,
    "createOnlineDetailsModalButton": createOnlineDetailsModalButton,
    "prettyPrintDateTime": prettyPrintDateTime
}

function loadAllReportsToMap(paramsDict) {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['reports-search']();
    xhr.open('GET', targetUrl + '?format=json&' + dictToParamList(paramsDict), true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('reports', xhr.responseText);
                renderReportDataSetAsLayer_Mapbox(xhr.responseText);

                /*$('#id_resultstable').pagination({
                    dataSource: JSON.parse(sessionStorage.getItem('reports')),
                    locator: 'results.features',
                    pageSize: 8,  // TODO if too many selections are done above, even pagination does not help... will need flex-grow around table
                    callback: function(data, pagination) {
                        fillTable("id_resultstable", data);
                    }
                });*/
                fillTable("id_resultstable", JSON.parse(sessionStorage.getItem('reports')).results.features);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadReportById(id) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/reports/api/id/' + id + '/geojson', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('reports', xhr.responseText);
                const asArray = '{"count":1,"next":null,"previous":null,"results":{"type":"FeatureCollection","features":[' + xhr.responseText + ']}}';
                renderReportDataSetAsLayer_Mapbox(asArray);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function loadAllOnlineReports(paramsDict) {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['onlinereports-search']();
    xhr.open('GET', targetUrl + '?format=json&' + dictToParamList(paramsDict), true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('onlinereports', xhr.responseText);

                /*$('#id_resultstable').pagination({
                    dataSource: JSON.parse(sessionStorage.getItem('reports')),
                    locator: 'results.features',
                    pageSize: 8,  // TODO if too many selections are done above, even pagination does not help... will need flex-grow around table
                    callback: function(data, pagination) {
                        fillTable("id_resultstable", data);
                    }
                });*/
                fillTable("id_onlineresultstable", JSON.parse(xhr.responseText).results);
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function renderReportDataSetAsLayer_Mapbox(jsonStr){
    const jsonData = JSON.parse(jsonStr).results;
    if (window.myMapVar.getLayer("search_results")) {
        window.myMapVar.removeLayer("search_results");
    }
    if (window.myMapVar.getSource("search_results")) {
        window.myMapVar.removeSource("search_results");
    }
    window.myMapVar.addSource('search_results', { type: 'geojson', data: jsonData});
    window.myMapVar.addLayer({
                "id": "search_results",
                "type": "symbol",
                "source": "search_results",
                "layout": {
                    "icon-image": "mymarker",
                    "icon-size": 1
                }
        });
    window.myMapVar.on('click', function(e) {
        const features = window.myMapVar.queryRenderedFeatures(e.point, {
            layers: ['search_results']
        });

        if (!features.length) {
            return;
        }

        const feature = features[0];

        const popup = new mapboxgl.Popup({offset: [0, -15]})
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<h6>' + reportCategoriesDict[feature.properties.category][0] + ": " + reportCategoriesDict[feature.properties.category][1] + '</h6><p>on ' + prettyPrintDateTime(feature.properties.timestamp) + ' (<a href="#" data-toggle="modal" data-target="#reportDetailModal" data-report="' + feature.id + '">Details</a>)</p>') // CHANGE THIS TO REFLECT THE PROPERTIES YOU WANT TO SHOW
            .setLngLat(feature.geometry.coordinates)
            .addTo(window.myMapVar);
    });
}