"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SyncMethod = (function () {
  function SyncMethod() {
    _classCallCheck(this, SyncMethod);
  }

  _createClass(SyncMethod, null, [{
    key: "synchronize",
    value: function synchronize(_notes) {
      var _this = this;

      var promise = new Promise(function (resolve, reject) {
        if (!_notes) {
          IndexedDB.getNotes().then(function (n) {
            _this.offline = n;

            resolve();
          });
        } else {
          _this.offline = _notes;
          resolve();
        }
      });
      return promise;
    }
  }, {
    key: "cmp",
    value: function cmp() {
      var notes = {};
      this.updated = [];
      this.removed = [];
      var offlinemap = (function (notesarray) {
        var obj = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = notesarray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var note = _step.value;

            obj[note.id] = note;
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

        return obj;
      })(this.offline);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.online[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var noteonline = _step2.value;

          var id = noteonline.id;

          noteonline.last_update = parseInt(noteonline.last_update);
          try {} catch (e) {}

          if (!offlinemap[id] || offlinemap[id].date < noteonline.date) {
              notes[id] = noteonline;
              if (Note.isRemoved(noteonline)) {
                this.removed.push(id);
              } else {
                this.updated.push(id);
              }
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.offline[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var off = _step3.value;

          var id = off.id;
          if (!notes[id]) {
              notes[id] = off;
            }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this.final = notes;
    }
  }, {
    key: "notifyUpdates",
    value: function notifyUpdates() {
      if (this.final && Object.keys(this.final).length > 0) {
        var launcher = chrome.app.window.get("notes_launcher");
        if (launcher) {
          try {
            launcher.contentWindow.updateNotes();
          } catch (err) {
            console.log('Launcher has not been loaded yet.', err);
          }
        }
      }
    }
  }]);

  return SyncMethod;
})();