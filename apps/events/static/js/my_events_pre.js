function getCurrentDateTime(){
    return moment().format('YYYY-MM-DDTHH:mm:ss');
}

function loadMyEvents() {
    const xhr = new XMLHttpRequest();
    const now = moment();
    const targetUrl = Urls['api-events-mine-list']() + '?format=json';
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                sessionStorage.setItem('my_events', xhr.responseText);
                const jsonData = JSON.parse(xhr.responseText);
                const containerUpcoming = document.getElementById("events_container_upcoming");
                const containerPast = document.getElementById("events_container_past");
                containerUpcoming.innerHTML = "";
                containerPast.innerHTML = "";
                const eventRenderFunc = Handlebars.templates["eventpreview.hbs"];
                for (var i = 0; i < jsonData.results.features.length; i++){
                    const event = jsonData.results.features[i];
                    const id = "col_event_" + event.id;

                    const hbContext = {};
                    const badges = [eventCategoriesDict[event.properties.category], getOrganizerStatusBadge(event.properties)];
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

                    if (now.isAfter(event.properties.datetime_start)){
                        containerPast.appendChild(newEventPreview);
                    } else {
                        containerUpcoming.appendChild(newEventPreview);
                    }
                }
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send();
}

function createEventDetailsLink(eventId){
    const targetUrl = Urls['view-events-detail'](eventId);
    return '<a href="' + targetUrl + '"><i class="fas fa-fw fa-external-link-alt"></i></a>';
}

function typeToHumanReadable(type){
    return eventCategoriesDict[type];
}

function createEventLinkedName(eventObj){
    return '<a href="' + Urls['view-events-detail'](eventObj.id) + '">' + eventObj.properties.title + '</a>';
}

function getOrganizerStatusBadge(eventObj){
    const meId = JSON.parse(sessionStorage.getItem('me')).id;
    if (eventObj.admin.id === meId){
        return "Organizer";
    } else if (meId in eventObj.cohosts){
        return "Co-host"
    } else {
        return "";
    }
}

translators = {
    "prettyPrintDateTime": prettyPrintDateTime,
    "typeToHumanReadable": typeToHumanReadable,
    "createEventDetailsLink": createEventDetailsLink,
    "linkedName": createEventLinkedName,
    "organizerBadge": getOrganizerStatusBadge
}

window.addEventListener("load", getMe, false);
window.addEventListener("load", loadMyEvents, false);

function togglePastOrUpcomingEvents(pastOrUpcoming){
    if (pastOrUpcoming === "past"){
        document.getElementById('id_tab_upcoming').classList.remove('active');
        document.getElementById('id_tab_past').classList.add('active');
        document.getElementById('id_row_past').classList.remove('d-none');
        document.getElementById('id_row_upcoming').classList.add('d-none');
    }
    if (pastOrUpcoming === "upcoming"){
        document.getElementById('id_tab_upcoming').classList.add('active');
        document.getElementById('id_tab_past').classList.remove('active');
        document.getElementById('id_row_past').classList.add('d-none');
        document.getElementById('id_row_upcoming').classList.remove('d-none');
    }
}