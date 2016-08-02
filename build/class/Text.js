'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectionKeeper = (function () {
  function SelectionKeeper() {
    _classCallCheck(this, SelectionKeeper);

    this._selection = null;
  }

  _createClass(SelectionKeeper, [{
    key: 'keep',
    value: function keep() {
      this.selection = Text.getSelection();
    }
  }, {
    key: 'restore',
    value: function restore() {
      if (this.selection) {
        Text.restoreSelection(this.selection);
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'selection',
    get: function get() {
      return this._selection;
    }
  }]);

  return SelectionKeeper;
})();

var Content = Content || {
  getSelection: function getSelection() {
    if (window.getSelection) {
      var selection = window.getSelection();
      if (selection.getRangeAt && selection.rangeCount) {
        return selection.getRangeAt(0);
      }
    }
  },
  restoreSelection: function restoreSelection(rangeToRestore) {
    if (rangeToRestore) {
      if (window.getSelection) {
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeToRestore);
      } else if (document.selection && rangeToRestore.select) {
        rangeToRestore.select;
      }
    }
  },

  insertText: function insertText(text) {
    var range = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var elem = document.createTextNode(text);
    this.insertElement(elem, range);
  },
  insertElement: function insertElement(elem) {
    var range = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    range = range || this.getSelection();
    range.deleteContents();
    range.insertNode(elem);
    var sel = window.getSelection();
    range.setStartAfter(elem);
    range.setEndAfter(elem);
    sel.removeAllRanges();
    sel.addRange(range);
  }
};