document.getElementById("id_button_deleteReport").addEventListener("click", deleteReport);

function fillModalWithDetails(modal, prov_id){
    const jsonData = JSON.parse(sessionStorage.getItem('reports'));
    const chosenReport = (jsonData.results.features.filter(({id}) => id === prov_id))[0];
    const images = chosenReport.properties.images;
    $('#reportModalLabel').text(reportCategoriesDict[chosenReport.properties.category][1]);

    fillChildren("id_modal_table", chosenReport);

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

function fillModalWithOnlineDetails(modal, prov_id){
    const jsonData = JSON.parse(sessionStorage.getItem('onlinereports'));
    const chosenReport = (jsonData.results.filter(({id}) => id === prov_id))[0];
    const images = chosenReport.images;
    $('#onlineReportDetailModalLabel').text(onlineReportCategoriesDict[chosenReport.category]);

    fillChildren("id_online_modal_table", chosenReport);

    // clean up old images:
    $('#carousel-inner').html('');
    //add new images:
    for (var i = 0; i < images.length; i++){
        if (i === 0) {
            $('#onlineCarousel-inner').append('<div class="carousel-item active"><img alt="report image" class="d-block w-100" src="' +  images[i].image + '"></div>');
        }
        else {
            $('#onlineCarousel-inner').append('<div class="carousel-item"><img alt="report image" class="d-block w-100" src="' +  images[i].image + '"></div>');
        }
    }
}

// fill data into details modal from API
$('#reportDetailModal').on('show.bs.modal', function (event) {
    const elem = $(event.relatedTarget); // Button that triggered the modal
    const id = elem.data('report'); // Extract info from data-* attributes

    const modal = $(this);
    fillModalWithDetails(modal, id);
});

$('#onlineReportDetailModal').on('show.bs.modal', function (event) {
    const elem = $(event.relatedTarget); // Button that triggered the modal
    const id = elem.data('report'); // Extract info from data-* attributes

    const modal = $(this);
    fillModalWithOnlineDetails(modal, id);
});

// fill data into deletion modal from API
$('#reportDeleteModal').on('show.bs.modal', function (event) {
    const elem = $(event.relatedTarget); // Button that triggered the modal
    const id = elem.data('report'); // Extract info from data-* attributes
    const type = elem.data('type'); // Extract info from data-* attributes

    const span = document.getElementById("id_span_delete_id");
    const innerText = document.createTextNode(id);
    document.getElementById("id_button_deleteReport").setAttribute("data-reportid", id);
    document.getElementById("id_button_deleteReport").setAttribute("data-type", type);
    span.appendChild(innerText);
});