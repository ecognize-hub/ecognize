document.getElementById("id_btn_doReportSearch").addEventListener("click", doReportSearch);
document.getElementById("id_btn_doOnlineReportSearch").addEventListener("click", doOnlineSearch);

mapboxgl.accessToken = constants['mapboxtoken'];
window.myMapVar = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [18.91, 13.69],
    zoom: 1
});
window.myMapVar.on('load', function() {
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: document.getElementById("id_userCountry").value
    });
    geocoder.on('result', function(e) {
      geocoder.clear();
      document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0].blur();
    });
    window.myMapVar.addControl(geocoder);
    window.myMapVar.addControl(new mapboxgl.NavigationControl());
    window.myMapVar.loadImage(
        document.getElementById("id_marker_url").value,
        function(error, image) {
            if (error) throw error;
            window.myMapVar.addImage('mymarker', image);
        });
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

var onlineStartPicker = $('#datepickerstart_online').datetimepicker({
                    format: 'YYYY-MM-DD',
                    buttons: {showToday: true, showClear: true, showClose: true},
                    icons: {clear: "fas fa-trash-alt", today: "fas fa-calendar-check"}
                });
var onlineEndPicker = $('#datepickerend_online').datetimepicker({
                    format: 'YYYY-MM-DD',
                    buttons: {showToday: true, showClear: true, showClose: true},
                    icons: {clear: "fas fa-trash-alt", today: "fas fa-calendar-check"}
                });

var choicesCountries = new Choices('#choices-countries', {
    removeItemButton: true, silent: true,
});

var choicesCategories = new Choices('#choices-categories', {
    removeItemButton: true, silent: true,
});

var choicesOnlineCategories = new Choices('#choices-online-categories', {
    removeItemButton: true, silent: true,
});

var choicesSpecifics = new Choices('#choices-locationtypes', {
    removeItemButton: true, silent: true,
});

function doReportSearch(){
    //gather values:
    const chosen_countries = choicesCountries.getValue().map(a => a.value).join(",");
    let chosen_start_date, chosen_end_date;
    const chosen_start_input_val = $('#datepickerstart').datetimepicker("date");;
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
    const chosen_categories = choicesCategories.getValue().map(a => a.value).join(",");
    const chosen_specifics = choicesSpecifics.getValue().map(a => a.value).join(",");

    const paramsDict = {'country': chosen_countries, 'sdate': chosen_start_date, 'edate': chosen_end_date, 'categories': chosen_categories, 'details': chosen_specifics}

    loadAllReportsToMap(paramsDict);
}

// fill data into modal from API
$('#reportDetailModal').on('show.bs.modal', function (event) {
    const elem = $(event.relatedTarget); // Button that triggered the modal
    const id = elem.data('report');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    const modal = $(this);
    fillReportModalWithDetails(modal, id);
});

$('#onlineReportDetailModal').on('show.bs.modal', function (event) {
    const elem = $(event.relatedTarget); // Button that triggered the modal
    const id = elem.data('report');
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    const modal = $(this);
    fillReportModalWithOnlineDetails(modal, id);

});

function doOnlineSearch(){
    //gather values:
    let chosen_start_date, chosen_end_date;
    const chosen_start_input_val = $('#datepickerstart_online').datetimepicker("date");
    if (typeof chosen_start_input_val === "undefined" || chosen_start_input_val == null){
        chosen_start_date = "";
    } else {
        chosen_start_date = chosen_start_input_val.format('YYYY-MM-DD');
    }
    const chosen_end_date_input_val = $('#datepickerend_online').datetimepicker('date');
    if (typeof chosen_end_date_input_val === "undefined" || chosen_end_date_input_val == null){
        chosen_end_date = "";
    } else {
        chosen_end_date = chosen_end_date_input_val.format('YYYY-MM-DD');
    }
    const chosen_categories = choicesOnlineCategories.getValue().map(a => a.value).join(",");

    const paramsDict = {'sdate': chosen_start_date, 'edate': chosen_end_date, 'categories': chosen_categories}

    loadAllOnlineReports(paramsDict);
}

function fillReportModalWithDetails(modal , prov_id){
    const jsonData = JSON.parse(sessionStorage.getItem('reports'));
    const chosenReport = (jsonData.results.features.filter(({id}) => id === prov_id))[0];
    $('#reportModalLabel').html("Report of " + reportCategoriesDict[chosenReport.properties.category][0] + " issue (" + reportCategoriesDict[chosenReport.properties.category][1] + ") in " + countriesDict[chosenReport.properties.country]);
    fillChildren("id_modal_table", chosenReport);

    const images = chosenReport.properties.images;
    // clean up old images:
    $('#carousel-inner').html('');
    //add new images:
    for (var i = 0; i < images.length; i++){
        if (i === 0) {
            $('#carousel-inner').append('<div class="carousel-item active"><img alt="report image" class="d-block w-100" src="' +  images[i].image + '"></div>');
        }
        else {
            $('#carousel-inner').append('<div class="carousel-item"><img alt="report image" class="d-block w-100" src="' +  images[i].image + '"></div>');
        }
    }
}

function fillReportModalWithOnlineDetails(modal , prov_id){
    const jsonData = JSON.parse(sessionStorage.getItem('onlinereports'));
    const chosenReport = (jsonData.results.filter(({id}) => id === prov_id))[0];
    $('#reportModalLabel').html("Report of " + onlineReportCategoriesDict[chosenReport.category]);
    fillChildren("id_onlineModal_table", chosenReport);

    const images = chosenReport.images;
    // clean up old images:
    $('#carousel-inner').html('');
    //add new images:
    for (var i = 0; i < images.length; i++){
        if (i === 0) {
            $('#carousel-inner').append('<div class="carousel-item active"><img alt="report image" class="d-block w-100" src="' +  images[i].image + '"></div>');
        }
        else {
            $('#carousel-inner').append('<div class="carousel-item"><img alt="report image" class="d-block w-100" src="' +  images[i].image + '"></div>');
        }
    }
}