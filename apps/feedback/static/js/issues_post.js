window.addEventListener("load", getMe, false);
window.addEventListener("load", loadAllIssues, false);
document.getElementById("id_btn_openIssue").addEventListener("click", openNewIssue, false);
document.getElementById("features-tab").addEventListener("click", function(e){ document.getElementById("feature_requests_container").classList.remove("d-none"); document.getElementById("bugs_container").classList.add("d-none"); }, false);
document.getElementById("bugs-tab").addEventListener("click", function(e){ document.getElementById("feature_requests_container").classList.add("d-none"); document.getElementById("bugs_container").classList.remove("d-none"); }, false);