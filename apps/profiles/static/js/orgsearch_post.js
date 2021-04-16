document.getElementById("id_btn_doOrgSearch").addEventListener("click", doOrgSearch);

var input = document.getElementById("id_search_box");
input.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("id_btn_doOrgSearch").click();
  }
});

var choicesCountries = new Choices('#choices-countries', {
    removeItemButton: true, silent: true,
});
var choicesTypes = new Choices('#choices-types', {
    removeItemButton: true, silent: true,
});