document.getElementById("id_btn_doGroupSearch").addEventListener("click", doGroupSearch);
document.getElementById("id_btn_createNewGroup").addEventListener("click", createNewGroup);
document.getElementById("id_btn_performDeleteGroup").addEventListener("click", performDeleteGroup);

var input = document.getElementById("id_search_box");
input.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("id_btn_doGroupSearch").click();
  }
});

var choicesCountries = new Choices('#choices-countries', {
    removeItemButton: true, silent: true,
});

$('#id_deleteGroupModal').on('show.bs.modal', function (event) {
  document.getElementById("id_group_id").value = $(event.relatedTarget).data("arg-id");
});