window.addEventListener("load", loadReportComments, false);
document.getElementById("id_btn_postNewComment").addEventListener("click", startThread);

mapboxgl.accessToken = constants['mapboxtoken'];
window.myMapVar = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});
window.myMapVar.on('load', function() {
    window.myMapVar.addControl(new mapboxgl.NavigationControl());
    window.myMapVar.loadImage(
        document.getElementById("id_marker_url").value,
        function(error, image) {
            if (error) throw error;
            window.myMapVar.addImage('mymarker', image);
        });
    //loadReportById(window.location.pathname.split("/")[4]);
    window.myMapVar.flyTo({
        center: [parseFloat(document.getElementById("id_geomX").value), parseFloat(document.getElementById("id_geomY").value)],
        zoom: 4
    });
    window.newMarker = new mapboxgl.Marker()
        .setLngLat([document.getElementById("id_geomX").value, document.getElementById("id_geomY").value])
        .addTo(window.myMapVar);
});