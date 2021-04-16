document.getElementById("id_btn_doProfileSearch").addEventListener("click", doProfileSearch);
document.getElementById("id_btn_performConnectionRequest").addEventListener("click", performConnectionRequest);
document.getElementById("id_btn_performDeleteConnectionRequest").addEventListener("click", performDeleteConnectionRequest);
document.getElementById("id_btn_performDeleteConnection").addEventListener("click", performDeleteConnection);
document.getElementById("id_btn_performAcceptConnectionRequest").addEventListener("click", performAcceptConnectionRequest);

window.addEventListener("load", function(e) { loadMyConnections("id_connections_container"); }, false);
window.addEventListener("load", loadMySentConnectionRequests, false);
window.addEventListener("load", loadMyReceivedConnectionRequests, false);

var input = document.getElementById("id_search_box");
input.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("id_btn_doProfileSearch").click();
  }
});

var choicesCountries = new Choices('#choices-countries', {
    removeItemButton: true, silent: true,
});
var choicesTypes = new Choices('#choices-types', {
    removeItemButton: true, silent: true,
});

$('#addUserAsConnectionModal').on('show.bs.modal', function (event) {
  document.getElementById("id_profile_id").value = $(event.relatedTarget).data("arg-id");
});

$('#deleteConnectionRequestModal').on('show.bs.modal', function (event) {
  document.getElementById("id_request_id").value = $(event.relatedTarget).data("arg-id");
});

$('#deleteConnectionModal').on('show.bs.modal', function (event) {
  document.getElementById("id_connection_id").value = $(event.relatedTarget).data("arg-id");
});

$('#acceptConnectionModal').on('show.bs.modal', function (event) {
  document.getElementById("id_accept_id").value = $(event.relatedTarget).data("arg-id");
});