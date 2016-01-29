var alertMsg = require('./modules/alert-msg.js');
var comment = require('./modules/comment-fixed.js');
var date = require('./modules/date.js');
var forms = require('./modules/forms.js');
var modal = require('./modules/modal.js');
var s3upload = require('./modules/s3upload.js');
var s3handler = require('./modules/s3handler.js');
var headerScroll = require('./modules/header-scroll.js');

alertMsg.init();
modal.init();
date.init();
forms.init();
comment.init();
s3upload.init();
s3handler.init();
headerScroll.init();
