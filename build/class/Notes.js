'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Notes = (function () {
  function Notes() {
    _classCallCheck(this, Notes);
  }

  _createClass(Notes, null, [{
    key: 'randomId',
    value: function randomId() {
      var d = new Date();
      return d.valueOf() + "_" + Math.random().toString().slice(2);
    }
  }, {
    key: 'openNewNote',
    value: function openNewNote(presetcolor, presetfont) {
      chrome.app.window.create('/note/note.html', {
        id: this.randomId(),
        frame: 'none',
        bounds: { width: 250, height: 240 },
        resizable: true
      }, function openNewNoteCallback(createdWindow) {
        createdWindow.contentWindow.note = null;
        createdWindow.contentWindow.presetcolor = presetcolor || null;
        createdWindow.contentWindow.presetfont = presetfont || null;
        chrome.app.window.get(createdWindow.id).onClosed.addListener(function onNoteClosed() {
          syncAll();
        });
      });
    }
  }, {
    key: 'openNote',
    value: function openNote(note) {
      var promise = new Promise(function (resolve, reject) {
        try {
          if (!note) {
            throw "openNote, no note object";
          }
          var currentWindow = chrome.app.window.get(note.id);
          if (currentWindow) {
            console.log('SHOW');
            currentWindow.show();
            resolve();
          } else {
            console.log('MAKE');
            chrome.app.window.create('/note/note.html', {
              id: note.id,
              frame: 'none'
            }, function (createdWindow) {
              createdWindow.contentWindow.note = note;
              chrome.app.window.get(note.id).onClosed.addListener(function chromeAppWindowOnClosed() {
                syncAll();
              });
              resolve();
            });
          }
        } catch (e) {
          reject(e);
        }
      });
      return promise;
    }
  }, {
    key: 'launchNotes',
    value: function launchNotes(notes) {
      if (!notes) {
        return false;
      }
      var allremoved = true;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = notes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var note = _step.value;

          if (!Note.isRemoved(note)) {
            allremoved = false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (!notes || notes.length === 0 || allremoved) {
        return false;
      }
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = notes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var note = _step2.value;

          if (!Note.isRemoved(note)) {
            this.openNote(note);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return true;
    }
  }, {
    key: 'launchNotesNewIfEmpty',
    value: function launchNotesNewIfEmpty(notes) {
      if (this.launchNotes(notes) === false) {
        this.openNewNote();
      }
      return true;
    }
  }, {
    key: 'updateDisplayedNotes',
    value: function updateDisplayedNotes() {}
  }, {
    key: 'updateDisplayedNote',
    value: function updateDisplayedNote() {}
  }]);

  return Notes;
})();