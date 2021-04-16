var objId = document.getElementById("id_options_id").value;

// TODO need to use mapbox.places-permanent for licensing reason; need to contact sales
/*
function reverse_geocode(coords, addressFieldId) {
    var xhr = new XMLHttpRequest();
    var targetUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + coords[0] + ',' + coords[1] + ".json?access_token=pk.eyJ1IjoiZWNvcmYiLCJhIjoiY2tka2sydGVkMHBkejJybzh2cWNxb3FvYyJ9.J991VKbGs1Hw4ciDpHMKfw";
    xhr.open('GET', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var responseAsJSON = JSON.parse(xhr.responseText);
                document.getElementById(addressFieldId).value = responseAsJSON.features[0].place_name;
            }
        }
    };
    xhr.send();
}
*/

mapboxgl.accessToken = constants['mapboxtoken'];
window.myMapVar = new mapboxgl.Map({
    container: objId + '_map',
    style: 'mapbox://styles/mapbox/streets-v11'
});
window.myMapVar.addControl(
    window.geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    minLength: 5
    })
);
window.myMapVar.addControl(new mapboxgl.NavigationControl());
window.myMapVar.on('load', function () {

    document.getElementById(objId + "_map").style.width = "100%";
    //document.getElementById(objId + "_map").style.height = "100%";
    document.getElementsByClassName("mapboxgl-canvas-container")[0].style.width = "100%";
    //document.getElementsByClassName("mapboxgl-canvas-container")[0].style.height = "100%";

    window.myMapVar.resize();

    const inputField = document.getElementById("id_" + options.name);
    const currentValue = inputField.value;
    if (currentValue != undefined && currentValue != null && currentValue !== ''){
        const currentValueAsJSON = JSON.parse(currentValue);
        const lng = currentValueAsJSON.coordinates[0];
        const lat = currentValueAsJSON.coordinates[1];
        const lngLat = {'lat': lat, 'lng': lng};
        window.newMarker = new mapboxgl.Marker()
        .setLngLat(lngLat)
        .addTo(window.myMapVar);
        window.myMapVar.flyTo({
            center: lngLat
        });
    }
});

window.geocoder.on('result', function(result) {
    if (window.newMarker != undefined && window.newMarker != null){
        window.newMarker.remove();
    }
    window.newMarker = new mapboxgl.Marker()
        .setLngLat(result.result.geometry.coordinates)
        .addTo(window.myMapVar);
    const hiddenInput = document.getElementById(objId);
    hiddenInput.value = "{\"type\":\"Point\",\"coordinates\":[" + result.result.geometry.coordinates[0] + "," + result.result.geometry.coordinates[1] + "]}";

    const addressField = document.getElementById("id_address");
    if (addressField != undefined && addressField != null){
        addressField.value = result.result.place_name;
    }
})

window.myMapVar.on('click', (e) => {
    const coords = `lat: ${e.lngLat.lat} <br> lng: ${e.lngLat.lng}`;

    // create the popup
    const popup = new mapboxgl.Popup().setText(coords);

    // create the marker
    if (window.newMarker != undefined && window.newMarker != null){
        window.newMarker.remove();
    }

    window.newMarker = new mapboxgl.Marker()
        .setLngLat(e.lngLat)
        .addTo(window.myMapVar);
    const hiddenInput = document.getElementById(objId);
    hiddenInput.value = "{\"type\":\"Point\",\"coordinates\":[" + e.lngLat.lng + "," + e.lngLat.lat + "]}";
  });