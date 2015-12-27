'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sync = {
  synchronize: function synchronize() {
    var _this = this;

    var notes = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    clearTimeout(this.synctimeout);
    this.synctimeout = setTimeout(function () {
      _this.synchronizeNow(notes);
    }, 10000);
  },
  synchronizeNow: function synchronizeNow() {
    var _this2 = this;

    var notes = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var promise = new Promise(function (resolve, reject) {
      clearTimeout(_this2.synctimeout);
      _this2.findTheWay().then(function (syncclass) {
        console.log('after the way');
        syncclass.synchronize(notes).then(function () {
          resolve();
        });
      });
    });
    return promise;
  },
  syncLoop: function syncLoop() {
    var _this3 = this;

    var timeout = arguments.length <= 0 || arguments[0] === undefined ? 10000 : arguments[0];

    console.log('timeout:', timeout);
    this.syncLoopIsGoing = true;
    clearTimeout(this.syncLoopTimeout);
    this.syncLoopTimeout = setTimeout(function () {
      console.log('before synchronizeNow');
      _this3.synchronizeNow().then(function () {
        console.log('after synchronizeNow');
        _this3.syncLoop(timeout);
      });
    }, timeout);
  },
  syncLoopStop: function syncLoopStop() {
    this.syncLoopIsGoing = false;
    clearTimeout(this.syncLoopTimeout);
  },
  findTheWay: function findTheWay() {
    var _this4 = this;

    var loop = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var promise = new Promise(function (resolve, reject) {
      if (_this4.pwj_sync === true) {
        resolve(SyncViaProWebJect);
      } else if (_this4.pwj_sync === false) {
        resolve(SyncViaGoogleDrive);
      } else if (loop === false) {
        _this4.updateTheWay().then(function () {
          resolve(_this4.findTheWay(true));
        });
      } else {
          reject();
        }
    });
    return promise;
  },
  updateTheWay: function updateTheWay() {
    var _this5 = this;

    var way = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var promise = new Promise(function (resolve, reject) {
      if (!way) {
        chrome.storage.sync.get(["pwj_sync", "pwj_pair_code"], function (data) {
          if (data && data.pwj_sync && data.pwj_pair_code) {
            _this5.pwj_sync = data.pwj_sync;
            _this5.pwj_pair_code = data.pwj_pair_code;
          } else {
            _this5.pwj_sync = false;
            _this5.pwj_pair_code = null;
          }
          resolve(true);
        });
      } else {
        reject();
      }
    });
    return promise;
  }
};

var SyncMethod = (function () {
  function SyncMethod() {
    _classCallCheck(this, SyncMethod);
  }

  _createClass(SyncMethod, null, [{
    key: 'synchronize',
    value: function synchronize(_notes) {
      var _this6 = this;

      console.log('SYNCHRONIZE as ', this.name);
      var promise = new Promise(function (resolve, reject) {
        if (!_notes) {
          IndexedDB.getNotes().then(function (n) {
            _this6.offline = n;
            console.log('OFFLINE:', _this6.offline);
            resolve();
          });
        } else {
          _this6.offline = _notes;
          resolve();
        }
      });
      return promise;
    }
  }, {
    key: 'cmp',
    value: function cmp() {
      console.log(this);
      console.log('ONLINE', this.online);
      console.log('OFFLINE', this.offline);

      var notes = {};
      this.updated = [];
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
          try {
            console.log('ON | OFF : ' + noteonline.date + ' | ' + offlinemap[id].date);
          } catch (e) {
            console.error('CMP LOG ERROR');
          }
          console.log('ON:', noteonline);
          console.log('OFF:', offlinemap[id]);
          if (!Boolean(noteonline.removed) && (!offlinemap[id] || offlinemap[id].date < noteonline.date)) {
              notes[id] = noteonline;
              this.updated.push(id);
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
    key: 'notifyUpdates',
    value: function notifyUpdates() {
      if (this.final && Object.keys(this.final).length > 0) {
        var launcher = chrome.app.window.get("notes_launcher");
        if (launcher) {
          console.log('LAUNCHER WINDOW', launcher);
          launcher.contentWindow.updateNotes();
        }
      }
      if (this.updated && this.updated.length > 1) {
        Notifications.simpleInfo(this.updated.length + ' notes were updated');
      }
    }
  }]);

  return SyncMethod;
})();

var SyncViaProWebJect = (function (_SyncMethod) {
  _inherits(SyncViaProWebJect, _SyncMethod);

  function SyncViaProWebJect() {
    _classCallCheck(this, SyncViaProWebJect);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SyncViaProWebJect).apply(this, arguments));
  }

  _createClass(SyncViaProWebJect, null, [{
    key: 'synchronize',
    value: function synchronize(_notes) {
      var _this8 = this;

      var promise = new Promise(function (resolve, reject) {
        _get(Object.getPrototypeOf(SyncViaProWebJect), 'synchronize', _this8).call(_this8, _notes).then(function () {
          _this8.getOnline().then(function () {
            _this8.cmp();
            IndexedDB.putNotes(_this8.final);
            _this8.sendOnline();
            _this8.notifyUpdates();
            resolve();
          });
        });
      });
      return promise;
    }
  }, {
    key: 'getOnline',
    value: function getOnline() {
      var _this9 = this;

      var promise = new Promise(function (resolve, reject) {
        $.ajax({
          url: 'http://prowebject.com/stickynotes/web/panel/backend/getNotes.php',
          dataType: 'json',
          method: 'post',
          data: { pair_code: Sync.pwj_pair_code }
        }).done(function (data) {
          _this9.online = [];
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var note = _step4.value;

              var obj = undefined;
              try {
                obj = JSON.parse(note.note_object);
                _this9.online.push(obj);
              } catch (e) {
                obj = null;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          resolve();
        });
      });
      return promise;
    }
  }, {
    key: 'sendOnline',
    value: function sendOnline() {
      var _this10 = this;

      var promise = new Promise(function () {
        var d = { notes: _this10.final, pair_code: Sync.pwj_pair_code, clear: true };
        $.ajax({
          url: 'http://prowebject.com/stickynotes/web/panel/backend/putNotes.php',
          method: 'post',
          dataType: 'text',
          data: d
        }).done(function (data) {
          console.log(data);
          IndexedDB.clearRemovedNotes();
        });
      });
      return promise;
    }
  }]);

  return SyncViaProWebJect;
})(SyncMethod);

var SyncViaGoogleDrive = (function (_SyncMethod2) {
  _inherits(SyncViaGoogleDrive, _SyncMethod2);

  function SyncViaGoogleDrive() {
    _classCallCheck(this, SyncViaGoogleDrive);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SyncViaGoogleDrive).apply(this, arguments));
  }

  _createClass(SyncViaGoogleDrive, null, [{
    key: 'synchronize',
    value: function synchronize(_notes) {
      var _this12 = this;

      var promise = new Promise(function (resolve, reject) {
        _get(Object.getPrototypeOf(SyncViaGoogleDrive), 'synchronize', _this12).call(_this12, _notes).then(function () {
          SyncFileSystem.requestFileSystem().then(SyncFileSystem.getFileEntries).then(SyncFileSystem.getNotesFromEntries).then(function (notes) {
            _this12.online = notes || [];
            _this12.cmp();
            console.log('FINAL NOTES:', _this12.final);
            IndexedDB.putNotes(_this12.final);
            SyncFileSystem.putNotes(_this12.final);
            _this12.notifyUpdates();
            resolve();
          });
        });
      });
      return promise;
    }
  }, {
    key: 'listenForChanges',
    value: function listenForChanges() {
      if (this.listening) {
        return;
      }
      this.listening = true;
      chrome.syncFileSystem.onFileStatusChanged.addListener((function (details) {
        this.onFileStatusChanged(details);
      }).bind(this));
    }
  }, {
    key: 'onFileStatusChanged',
    value: function onFileStatusChanged(details) {
      if (/note_(\w|_)+/.test(details.fileEntry.name) && details.direction === "remote_to_local") {
        updateFileSingle(details.fileEntry);
      }
    }
  }]);

  return SyncViaGoogleDrive;
})(SyncMethod);