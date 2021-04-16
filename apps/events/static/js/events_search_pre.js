function loadEvents(paramsDict) {
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls['api-events-national-search']() + '?format=json&' + dictToParamList(paramsDict);

    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('events', xhr.responseText);
                renderEventDataSetAsLayer_Mapbox(xhr.responseText);
                const jsonData = JSON.parse(xhr.responseText);
                let container;
                if (document.getElementById('id_tab_online_events').classList.contains("active")){
                    container = document.getElementById("online_events_container");
                } else {
                    container = document.getElementById("offline_events_container");
                }
                container.innerHTML = "";
                const eventRenderFunc = Handlebars.templates["eventpreview.hbs"];
                for (var i = 0; i < jsonData.results.features.length; i++){
                    const event = jsonData.results.features[i];
                    const id = "col_event_" + event.id;

                    const hbContext = {};
                    const badges = [eventCategoriesDict[event.properties.category]];
                    hbContext['eventLink'] = Urls['view-events-detail'](event.id);
                    hbContext['title'] = event.properties.title;
                    hbContext['badges'] = badges;
                    hbContext['colWidth'] = 12;
                    if (event.properties.online){
                        hbContext['address'] = event.properties.online_address;
                    } else {
                        hbContext['address'] = event.properties.address;
                    }
                    hbContext['datetime_start'] = prettyPrintDateTime(event.properties.datetime_start);
                    hbContext['datetime_end'] = prettyPrintDateTime(event.properties.datetime_end);
                    hbContext['domId'] = id;

                    const newEventPreview = createElementFromHTML(eventRenderFunc(hbContext));
                    container.appendChild(newEventPreview);
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function doSearch(){
    let chosen_start_date, chosen_end_date;

    //gather values:
    const chosen_start_input_val = $('#datepickerstart').datetimepicker("date");
    if (typeof chosen_start_input_val === "undefined" || chosen_start_input_val == null){
        chosen_start_date = "";
    } else {
        chosen_start_date = chosen_start_input_val.format('YYYY-MM-DD');
    }

    const chosen_end_date_input_val = $('#datepickerend').datetimepicker('date');
    if (typeof chosen_end_date_input_val === "undefined" || chosen_end_date_input_val == null){
        chosen_end_date = "";
    } else {
        chosen_end_date = chosen_end_date_input_val.format('YYYY-MM-DD');
    }

    let chosen_types;
    if (document.getElementById('id_tab_offline_events').classList.contains("active")){
        chosen_types = choicesTypesOffline.getValue().map(a => a.value).join(",");
    }
    if (document.getElementById('id_tab_online_events').classList.contains("active")){
        chosen_types = choicesTypesOnline.getValue().map(a => a.value).join(",");
    }

    let paramsDict = {'sdate': chosen_start_date, 'edate': chosen_end_date, 'types': chosen_types}
    if (document.getElementById('id_tab_offline_events').classList.contains("active")){
        paramsDict['online'] = "false";
    }
    if (document.getElementById('id_tab_online_events').classList.contains("active")){
        paramsDict['online'] = "true";
    }
    loadEvents(paramsDict);
}

function typeToHumanReadable(type){
    return eventCategoriesDict[type];
}

function createEventDetailsLink(eventId){
    return '<a href="' + Urls['view-events-detail'](eventId) + '"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

function createEventLinkedName(eventObj){
    return '<a href="' + Urls['view-events-detail'](eventObj.id) + '">' + eventObj.properties.title + '</a>';
}

translators = {
    "prettyPrintDateTime": prettyPrintDateTime,
    "typeToHumanReadable": typeToHumanReadable,
    "createEventDetailsLink": createEventDetailsLink,
    "linkedName": createEventLinkedName
}

function renderEventDataSetAsLayer_Mapbox(jsonStr){
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
            layers: ['search_results'] // replace this with the name of the layer
        });

        if (!features.length) {
            return;
        }

        const feature = features[0];

        const popup = new mapboxgl.Popup({offset: [0, -15]})
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<h6>' + categoriesDict[feature.properties.category] + ": " + feature.properties.title + '</h6><p>on ' + prettyPrintDateTime(feature.properties.datetime_start) + ' (<a href="#" data-toggle="modal" data-target="#reportDetailModal" data-report="' + feature.id + '">Details</a>)</p>') // CHANGE THIS TO REFLECT THE PROPERTIES YOU WANT TO SHOW
            .setLngLat(feature.geometry.coordinates)
            .addTo(window.myMapVar);
    });
}

function toggleOnlineOrOfflineEvents(onlineOrOffline){
    let i;
    const offlineElements = document.getElementsByClassName("offline_elements");
    const onlineElements = document.getElementsByClassName("online_elements");
    if (onlineOrOffline === "online"){
        document.getElementById('id_tab_offline_events').classList.remove('active');
        document.getElementById('id_tab_online_events').classList.add('active');
        for (i = 0; i < offlineElements.length; i++){
            offlineElements[i].classList.add("d-none");
        }
        for (i = 0; i < onlineElements.length; i++){
            onlineElements[i].classList.remove("d-none");
        }
    }
    if (onlineOrOffline === "offline"){
        document.getElementById('id_tab_offline_events').classList.add('active');
        document.getElementById('id_tab_online_events').classList.remove('active');
        for (i = 0; i < offlineElements.length; i++){
            offlineElements[i].classList.remove("d-none");
        }
        for (i = 0; i < onlineElements.length; i++){
            onlineElements[i].classList.add("d-none");
        }
    }
}