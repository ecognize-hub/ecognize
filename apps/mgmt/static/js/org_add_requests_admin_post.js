$('#addOrgModal').on('show.bs.modal', function (event) {
  if (event.relatedTarget.id !== "btn_createNewOrgFromScratch") {
    document.getElementById("id_input_display_name").value = $(event.relatedTarget).data("org-name");
    document.getElementById("id_input_local_name").value = $(event.relatedTarget).data("org-name");
    document.getElementById("id_input_full_name").value = $(event.relatedTarget).data("org-name");
    document.getElementById("id_input_domain").value = $(event.relatedTarget).data("domain");
    document.getElementById("id_req_id_add").value = $(event.relatedTarget).data("request-id");
  } else {
    document.getElementById("id_req_id_add").value = -1;
  }
});

document.getElementById('id_logoDialog_id').addEventListener('change', handleFileSelect, false);

$('#deleteOrgRequestModal').on('show.bs.modal', function (event) {
  document.getElementById("id_req_id_del").value = $(event.relatedTarget).data("request-id");
});

document.getElementById("id_btn_createOrgGroup").addEventListener("click", function (e){
  const id = parseInt(document.getElementById("id_req_id_add").value);
  createNewOrg(id);
}, false);
document.getElementById("id_btn_deleteOrgRequest").addEventListener("click", function (e){
  const id = parseInt(document.getElementById("id_req_id_del").value);
  createNewOrg(id);
}, false);

var choicesCountries = new Choices('#id_input_countries', {
    removeItemButton: true, silent: true,
});