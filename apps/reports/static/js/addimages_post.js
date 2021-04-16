var thisObjContentTypeId = parseInt(document.getElementById("id_input_content_type").value);
var reportId = parseInt(document.getElementById("id_input_object_id").value);
var reportContentTypeId = parseInt(document.getElementById("id_reportContentTypeId").value);
var onlineReportContentTypeId = parseInt(document.getElementById("id_onlineReportContentTypeId").value);

document.getElementById("id_btn_finalize").addEventListener("click", finalizeReport);

function attachFormSubmitEvent(formId){
    document.getElementById(formId).addEventListener("submit", function(event) {event.preventDefault(); uploadImage(event);  });
}

window.addEventListener("load", getImages, false);
window.addEventListener("load", fixLinksForUnauthenticatedAccess, false);
attachFormSubmitEvent("uploadForm");