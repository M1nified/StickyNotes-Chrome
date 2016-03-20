"use strict";

var TextFormat = TextFormat || {
  taskList: function taskList() {
    document.execCommand('insertUnorderedList', false, null);
    var elem = $(window.getSelection().focusNode).closest('ul');
    elem.addClass('task-list');
  },
  tabulationInsert: function tabulationInsert() {
    Content.insertElement($(document.createElement('pre')).addClass('pretab').append("&#9;")[0]);
  },
  backColor: function backColor() {
    var color = arguments.length <= 0 || arguments[0] === undefined ? 'transparent' : arguments[0];

    document.execCommand('backColor', true, color);
  }
};