document.getElementById("id_btn_performConnectionRequest").addEventListener("click", sendConnectionRequest);
document.getElementById("id_btn_performDeleteConnection").addEventListener("click", deleteConnectionOrRequest);
document.getElementById("id_btn_performAcceptConnectionRequest").addEventListener("click", acceptConnectionRequest);
document.getElementById("id_btn_performDeleteConnectionRequest").addEventListener("click", deleteConnectionOrRequest);
document.getElementById("id_btn_startThread").addEventListener("click", startThread);

if (document.getElementById("id_is_me").value === "True"){
    window.addEventListener("load", function(e) { loadMyConnections("id_connections_container"); }, false);
} else {
    window.addEventListener("load", function(e) { var userId = parseInt(document.getElementById("id_profile_id").value); loadConnections(userId, "id_connections_container"); }, false);
}
