window.addEventListener("load", function(e) { window.forumId = parseInt(document.getElementById("id_forum_id").value); }, false)
document.getElementById("id_button_search").addEventListener("click", doThreadSearch);

var input = document.getElementById("id_search_terms");
input.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("id_button_search").click();
  }
});