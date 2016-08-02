'use strict';
class SelectionKeeper {
  constructor() {
    this._selection = null;

  }
  get selection(){
    return this._selection;
  }
  keep(){
    this._selection = Content.getSelection();
  }
  restore(){
    if(this._selection){
      Content.restoreSelection(this._selection);
      return true;
    }else{
      return false;
    }
  }
}
var Content = Content || {
  //SELECTION
  getSelection : function(){
    if(window.getSelection){
      let selection = window.getSelection();//selection is now local variable
      if(selection.getRangeAt && selection.rangeCount){
        return selection.getRangeAt(0);
      }
    }
  },
  restoreSelection : function(rangeToRestore){
    if(rangeToRestore){
      if(window.getSelection){
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeToRestore);
      }else if(document.selection && rangeToRestore.select){
        rangeToRestore.select;
      }
    }
  },
  //INSERTIONS
  insertText : function(text,range = null){
    let elem = document.createTextNode(text);
    this.insertElement(elem,range);
  },
  insertElement(elem, range = null){
    range = range || this.getSelection();
    range.deleteContents();
    range.insertNode(elem);
    let sel = window.getSelection();
    range.setStartAfter(elem);
    range.setEndAfter(elem);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
