"use strict";
var TextFormat = TextFormat || {
  taskList : function(){
    document.execCommand('insertUnorderedList',false,null);
    let elem = $(window.getSelection().focusNode).closest('ul');
    elem.addClass('task-list');
  },
  tabulationInsert : function(){
    Content.insertElement($(document.createElement('pre')).addClass('pretab').append("&#9;")[0]);
  },
  backColor : function(color = 'transparent'){
    document.execCommand('backColor',true,color)
  }
};
