document.getElementById("id_btn_startThread").addEventListener("click", startThread, false);
document.getElementById("id_btn_deleteForum").addEventListener("click", deleteForum, false);
document.getElementById("id_btn_updateForum").addEventListener("click", editCustomForum, false);

$('#editForumAccessModal').on('show.bs.modal', function (event) {
  loadMyConnectionsWithPreselect();
  loadOrgsWithPreselect();
});