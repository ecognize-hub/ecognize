document.getElementById("id_btn_deletePost").addEventListener("click", deletePost);
document.getElementById("id_btn_deleteThread").addEventListener("click", deleteThread);
document.getElementById("id_form_sendMsg").addEventListener("submit", function(e){ e.preventDefault(); const threadId = parseInt(document.getElementById("id_thread_id").value); sendMessageToThread(threadId, 'id_msg_textarea'); });

$('#deletePostModal').on('show.bs.modal', function (event) {
    const postIdInputField = document.getElementById("id_post_id");
    postIdInputField.value = event.relatedTarget.getAttribute("data-postId");
});

ClassicEditor
    .create( document.querySelector( '#id_msg_textarea' ),  {
        removePlugins: [ 'BlockQuote', 'EasyImage', 'Image', 'ImageCaption', 'ImageStyle', 'ImageToolbar', 'ImageUpload', 'MediaEmbed' ],
        toolbar: [ 'heading', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'indent', 'outdent', 'undo', 'redo',  ]
    } )
    .then( editor => {
        ckEditor = editor;
    } )
    .catch( error => {
        console.error( error );
    } );