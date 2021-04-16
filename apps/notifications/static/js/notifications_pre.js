function setReadStatus(notificationId, read){
    const readBool = (read === "true");
    const xhr = new XMLHttpRequest();
    const targetUrl = Urls["api-notification-toggle-readstatus"](notificationId);
    const csrftoken = getCookie('csrftoken');
    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                const readStateButton = document.getElementById("id_toggle_read_" + notificationId);
                const link = document.getElementById("link_" + notificationId);
                const timestamp = document.getElementById("timestamp_" + notificationId);

                if (!readBool) {
                    readStateButton.setAttribute("data-read-state", "true");
                    readStateButton.title = "Mark unread";
                } else {
                    readStateButton.setAttribute("data-read-state", "false");
                    readStateButton.title = "Mark read";
                }
                    readStateButton.classList.toggle("fa-check");
                    readStateButton.classList.toggle("fa-eye-slash");
                    link.classList.toggle("text-secondary");
                    link.classList.toggle("text-primary");
                    timestamp.classList.toggle("text-secondary");
                    timestamp.classList.toggle("text-primary");
            } else {
                displayErrors(JSON.parse(xhr.responseText));
            }
        }
    };
    if (!readBool) {
        xhr.send(JSON.stringify({'action': 'read'}));
    } else {
        xhr.send(JSON.stringify({'action': 'unread'}));
    }
}