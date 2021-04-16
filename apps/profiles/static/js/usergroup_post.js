document.getElementById("id_btn_startThread").addEventListener("click", startThread);
document.getElementById("id_btn_requestToJoin").addEventListener("click", requestToJoin);
document.getElementById("id_btn_leaveGroup_confirm").addEventListener("click", leaveGroup);
document.getElementById("id_btn_abortJoinRequest").addEventListener("click", abortRequestToJoin);
document.getElementById("id_btn_admitUser").addEventListener("click", function(e){const profileId = parseInt(e.target.getAttribute("data-profile-id")); admitRequestToJoin(profileId); });
document.getElementById("id_btn_denyUser").addEventListener("click", function(e){const profileId = parseInt(e.target.getAttribute("data-profile-id")); denyRequestToJoin(profileId); });
document.getElementById("id_btn_deleteUser").addEventListener("click", function(e){const profileId = parseInt(e.target.getAttribute("data-profile-id")); removeUserFromGroup(profileId); });
document.getElementById("id_btn_inviteContacts").addEventListener("click", inviteConnectionsToJoinGroup);
document.getElementById("id_btn_performDeleteGroup").addEventListener("click", deleteGroup);

$('#admitUserModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const profileId = invoker.getAttribute("data-arg-id");

    document.getElementById("id_btn_admitUser").setAttribute("data-profile-id", profileId);
});

$('#denyUserModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const profileId = invoker.getAttribute("data-arg-id");

    document.getElementById("id_btn_denyUser").setAttribute("data-profile-id", profileId);
});

$('#deleteUserFromGroupModal').on('show.bs.modal', function (e) {
    const invoker = e.relatedTarget;
    const profileId = invoker.getAttribute("data-arg-id");

    document.getElementById("id_btn_deleteUser").setAttribute("data-profile-id", profileId);
});

$('#inviteContactToGroupModal').on('show.bs.modal', function (e) {
    loadMyConnections();
});