function requestOrgAddition(){
    const formElem = document.getElementById("id-orgAdditionRequestForm");
    const formData = new FormData(formElem);

    const targetUrl = "{% url 'api-req-org-addition-create' %}?format=json";

    const csrftoken = getCookie('csrftoken');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                window.location.href = "{% url 'req-org-addition-success' %}";
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(JSON.stringify(formData));
}