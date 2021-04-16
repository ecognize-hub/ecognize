function getCountryName(key) {
    return countriesDict[key];
}

function prettyPrintCountries(){
    const country_table_entries = document.querySelectorAll(".countrycode");
    for (var i = 0; i < country_table_entries.length; i++){
        country_table_entries[i].innerHTML = getCountryName(country_table_entries[i].innerHTML);
    }
}

window.addEventListener("load", prettyPrintCountries, false);