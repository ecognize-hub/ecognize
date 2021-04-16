const allNotifButtons = document.getElementsByClassName("mark-read-unread-button");
for (var i = 0; i < allNotifButtons.length; i++){
    const notifButton = allNotifButtons[i];
    notifButton.addEventListener("click", function (e){
        const notificationId = e.target.getAttribute("data-id");
        const readStatus = e.target.getAttribute("data-read-state");
        setReadStatus(notificationId, readStatus);
    }, false);
}