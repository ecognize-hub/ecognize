var event_geom_x = parseFloat(document.getElementById("id_event_geom_x").value);
var event_geom_y = parseFloat(document.getElementById("id_event_geom_y").value);
var markerUrl = document.getElementById("id_marker_url").value;
var onlineEvent = document.getElementById("id_event_online").value;

if (onlineEvent === "False"){
    mapboxgl.accessToken = constants['mapboxtoken'];
    window.myMapVar = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [event_geom_x, event_geom_y],
        zoom: 12
    });
    window.myMapVar.on('load', function() {
        window.myMapVar.addControl(new mapboxgl.NavigationControl());
        window.myMapVar.loadImage(
            markerUrl,
            function(error, image) {
                if (error) throw error;
                window.myMapVar.addImage('mymarker', image);
            }
        );
        window.newMarker = new mapboxgl.Marker()
        .setLngLat([event_geom_x, event_geom_y])
        .addTo(window.myMapVar);
    });
} else {
    document.getElementById("map_outer_div_container").classList.add("d-none");
}

$('#inviteContactToEventModal').on('show.bs.modal', function (e) {
    loadMyConnections();
});

window.addEventListener("load", getMe, false);
window.addEventListener("load", loadParticipants, false);
window.addEventListener("load", loadInvited, false);
if (document.getElementById("id_participating").value === "True" || document.getElementById("id_admin").value === "True"){
    window.addEventListener("load", loadEventThreads, false);
}

document.getElementById("id_btn_inviteContacts").addEventListener("click", inviteConnectionsToEvent);
document.getElementById("id_btn_delete").addEventListener("click", function(e) {deleteEvent();}, false);
document.getElementById("id_btn_startThread").addEventListener("click", startThread);
document.getElementById("id_btn_participate").addEventListener("click", participateInEvent);
document.getElementById("id_btn_cancelParticipation").addEventListener("click", cancelParticipationInEvent);