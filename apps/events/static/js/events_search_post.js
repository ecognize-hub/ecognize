document.getElementById("id_tab_offline_events").addEventListener("click", function(e) {toggleOnlineOrOfflineEvents('offline');}, false);
document.getElementById("id_tab_online_events").addEventListener("click", function(e) {toggleOnlineOrOfflineEvents('online');}, false);
document.getElementById("id_btn_search").addEventListener("click", function(e) {doSearch();}, false);

var markerUrl = document.getElementById("id_marker_url").value

function showMap(err, data) {
    if (err) {
        displayErrorMessage("Couldn't find this place!");
    } else {
        map.fitBounds(data.lbounds);
    }
}

var userCountry = document.getElementById("id_userCountry").value;

mapboxgl.accessToken = constants['mapboxtoken'];
window.myMapVar = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});
window.myMapVar.on('load', function() {
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: userCountry
    });
    geocoder.on('result', function(e) {
      geocoder.clear();
      document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0].blur();
    });
    window.myMapVar.addControl(geocoder);
    window.myMapVar.addControl(new mapboxgl.NavigationControl());
    window.myMapVar.loadImage(
        markerUrl,
        function(error, image) {
            if (error) throw error;
            window.myMapVar.addImage('mymarker', image);
        }
    );
    geocoder.query(userCountry, showMap);
});

var startPicker = $('#datepickerstart').datetimepicker({
                    format: 'YYYY-MM-DD',
                    buttons: {showToday: true, showClear: true, showClose: true},
                    icons: {clear: "fas fa-trash-alt", today: "fas fa-calendar-check"}
                });
var endPicker = $('#datepickerend').datetimepicker({
                    format: 'YYYY-MM-DD',
                    buttons: {showToday: true, showClear: true, showClose: true},
                    icons: {clear: "fas fa-trash-alt", today: "fas fa-calendar-check"}
                });

var choicesTypesOffline = new Choices('#choices-types-offline', {
    removeItemButton: true, silent: true,
});

var choicesTypesOnline = new Choices('#choices-types-online', {
    removeItemButton: true, silent: true,
});