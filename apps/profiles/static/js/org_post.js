$('#addUserAsConnectionModal').on('show.bs.modal', function (event) {
  document.getElementById("id_profile_id").value = $(event.relatedTarget).data("profile-id");
});