/**
 * Client side User Avatar handler.
 */

exports.init = function() {
  var s3_upload = function() {
    var status_elem = document.getElementById("status"),
      url_elem = document.getElementById("avatar_url"),
      preview_elem = document.getElementById("preview"),
      user_id = document.getElementById('user_id').value;

    var s3upload = new S3Upload({
      file_dom_selector: 'files',
      s3_sign_put_url: '/sign-s3',
      s3_object_name: user_id,
      onProgress: function(percent, message) {
        status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
      },
      onFinishS3Put: function(public_url) {
        status_elem.innerHTML = 'Upload completed.';
        url_elem.value = public_url;
        preview_elem.innerHTML = '<img src="' + public_url + '?cache=' + Math.round(Math.random() * 10000) +
          '" style="" />';

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          }
        };
        var currUrl = location.pathname.split('/')[1];
        xmlhttp.open('GET', '/resize-s3?url=' + currUrl, true);
        xmlhttp.send();
      },
      onError: function(status) {
        status_elem.innerHTML = 'Upload error: ' + status;
      }
    });
  };

  (function() {
    var input_element = document.getElementById("files");

    if (input_element !== null) {
      input_element.onchange = s3_upload;
    }
  })();
};
