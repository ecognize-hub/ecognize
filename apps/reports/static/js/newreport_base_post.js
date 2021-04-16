window.addEventListener("load", function (e){ getCaptcha("id_captcha_key", "id_captcha_image"); } , false);
window.addEventListener("load", fetchAndLoadReport, false);

$(function () {
    $('#id_datetimepicker').datetimepicker({format: 'YYYY-MM-DD', 'date': moment(document.getElementById("id_timestamp").value, 'YYYY-MM-DD')});
});

window.addEventListener("load", function (e){
    const mode = document.getElementById("id_mode").value;
    if (mode === "new"){
        document.getElementById("id_create_report").addEventListener("click", createNewReport, false);
    } else if (mode === "update") {
        document.getElementById("id_create_report").addEventListener("click", updateReport, false);
    }
}, false);