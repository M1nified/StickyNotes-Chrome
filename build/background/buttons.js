"use strict";

$(document).on('click', '.copybutton', function copyToClipboard() {
  var target = $(this).data('target');
  $("#" + target).select();
  document.execCommand('copy');
  console.log("COPPIERD");
});