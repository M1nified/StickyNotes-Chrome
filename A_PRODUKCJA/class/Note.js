"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Note = (function () {
  function Note() {
    _classCallCheck(this, Note);
  }

  _createClass(Note, [{
    key: "isRemoved",
    value: function isRemoved() {
      Note.isRemoved(this);
    }
  }], [{
    key: "isContentTheSame",
    value: function isContentTheSame(note1, note2) {
      var arethesame = true;
      var differences = {};
      if (note1.textarea !== note2.textarea) {
        differences.textarea = true;
      }
      if (note1.color !== note2.color) {
        differences.color = true;
      }
      if (note1.fontfamily !== note2.fontfamily) {
        differences.fontfamily = true;
      }
      if (note1.fontsize !== note2.fontsize) {
        differences.fontsize = true;
      }
      if (Object.keys(differences).length == 0) {
        return true;
      } else {
        return differences;
      }
    }
  }, {
    key: "isRemoved",
    value: function isRemoved(note) {
      return note && (note.removed === true || note.removed === "true");
    }
  }, {
    key: "remove",
    value: function remove(id) {
      return IndexedDB.putNotes([{
        id: note.id,
        removed: true,
        date: new Date().valueOf()
      }]);
    }
  }]);

  return Note;
})();