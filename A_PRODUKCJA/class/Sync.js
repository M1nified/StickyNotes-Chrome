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
    var notes = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    clearTimeout(this.synctimeout);
    this.findTheWay().then(function (syncclass) {
      syncclass.synchronize(notes);
    });
  },
  findTheWay: function findTheWay() {
    var _this2 = this;

    var loop = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var promise = new Promise(function (resolve, reject) {
      if (_this2.pwj_sync === true) {
        resolve(SyncViaProWebJect);
      } else if (_this2.pwj_sync === false) {
        resolve(SyncViaGoogleDrive);
      } else if (loop === false) {
        _this2.updateTheWay().then(function () {
          resolve(_this2.findTheWay(true));
        });
      } else {
          reject();
        }
    });
    return promise;
  },
  updateTheWay: function updateTheWay() {
    var _this3 = this;

    var way = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var promise = new Promise(function (resolve, reject) {
      if (!way) {
        chrome.storage.sync.get(["pwj_sync", "pwj_pair_code"], function (data) {
          if (data && data.pwj_sync && data.pwj_pair_code) {
            _this3.pwj_sync = data.pwj_sync;
            _this3.pwj_pair_code = data.pwj_pair_code;
          } else {
            _this3.pwj_sync = false;
            _this3.pwj_pair_code = null;
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
    key: "synchronize",
    value: function synchronize(_notes) {
      var _this4 = this;

      console.log(this.name);
      var promise = new Promise(function (resolve, reject) {
        _this4.offline = _notes;
        if (!_notes) {
          IndexedDB.getNotes().then(function (n) {
            _this4.offline = n;
            resolve();
          });
        } else {
          resolve();
        }
      });
      return promise;
    }
  }, {
    key: "cmp",
    value: function cmp() {
      console.log(this);
      console.log('ONLINE', this.online);
      console.log('OFFLINE', this.offline);

      var notes = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.online[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var noteonline = _step.value;

          var id = noteonline.id;

          noteonline.last_update = parseInt(noteonline.last_update);
          if (!Boolean(noteonline.removed) && (!this.offline[id] || this.offline[id].date < noteonline.date || this.offline[id].date < noteonline.last_update)) {
            notes[id] = noteonline;
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.offline[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var off = _step2.value;

          var id = off.id;
          if (!notes[id] && Boolean(off.removed) !== true) {
            notes[id] = off;
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

      this.final = notes;
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
    key: "synchronize",
    value: function synchronize(_notes) {
      var _this6 = this;

      _get(Object.getPrototypeOf(SyncViaProWebJect), "synchronize", this).call(this, _notes).then(function () {
        _this6.getOnline().then(function () {
          _this6.cmp();
          IndexedDB.putNotes(_this6.final);
          _this6.sendOnline();
        });
      });
    }
  }, {
    key: "getOnline",
    value: function getOnline() {
      var _this7 = this;

      var promise = new Promise(function (resolve, reject) {
        $.ajax({
          url: 'http://prowebject.com/stickynotes/web/panel/backend/getNotes.php',
          dataType: 'json',
          method: 'post',
          data: { pair_code: Sync.pwj_pair_code }
        }).done(function (data) {
          _this7.online = [];
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var note = _step3.value;

              var obj = undefined;
              try {
                obj = JSON.parse(note.note_object);
                _this7.online.push(obj);
              } catch (e) {
                obj = null;
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

          resolve();
        });
      });
      return promise;
    }
  }, {
    key: "sendOnline",
    value: function sendOnline() {
      var _this8 = this;

      var promise = new Promise(function () {
        var d = { notes: _this8.final, pair_code: Sync.pwj_pair_code, clear: true };
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
    key: "synchronize",
    value: function synchronize(_notes) {
      var _this10 = this;

      _get(Object.getPrototypeOf(SyncViaGoogleDrive), "synchronize", this).call(this, _notes).then(function () {
        SyncFileSystem.requestFileSystem().then(SyncFileSystem.getFileEntries).then(SyncFileSystem.getNotesFromEntries).then(function (notes) {
          _this10.online = notes;
          _this10.cmp();
          console.log(_this10.final);
          IndexedDB.putNotes(_this10.final);
          SyncFileSystem.putNotes(_this10.final);
        });
      });
    }
  }, {
    key: "listenForChanges",
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
    key: "onFileStatusChanged",
    value: function onFileStatusChanged(details) {
      if (/note_(\w|_)+/.test(details.fileEntry.name) && details.direction === "remote_to_local") {
        updateFileSingle(details.fileEntry);
      } else if (details.fileEntry.name === "purchasedinapp" && details.direction === "remote_to_local") {
        updatePurchasedElements();
      }
    }
  }]);

  return SyncViaGoogleDrive;
})(SyncMethod);