'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SyncViaProWebJect = (function (_SyncMethod) {
  _inherits(SyncViaProWebJect, _SyncMethod);

  function SyncViaProWebJect() {
    _classCallCheck(this, SyncViaProWebJect);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SyncViaProWebJect).apply(this, arguments));
  }

  _createClass(SyncViaProWebJect, null, [{
    key: 'synchronize',
    value: function synchronize(_notes) {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        _get(Object.getPrototypeOf(SyncViaProWebJect), 'synchronize', _this2).call(_this2, _notes).then(function () {
          _this2.getOnline().then(function () {
            _this2.cmp();
            IndexedDB.putNotes(_this2.final);
            _this2.sendOnline();
            _this2.notifyUpdates();
            resolve();
          });
        });
      });
      return promise;
    }
  }, {
    key: 'getOnline',
    value: function getOnline() {
      var _this3 = this;

      var promise = new Promise(function (resolve, reject) {
        $.ajax({
          url: 'http://prowebject.com/stickynotes/web/panel/backend/getNotes.php',
          dataType: 'json',
          method: 'post',
          data: { pair_code: Sync.pwj_pair_code },
          error: function error(err) {
            console.error('prowebject.com error', err);
          }
        }).done(function (data) {
          _this3.online = [];
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var note = _step.value;

              var obj = undefined;
              try {
                obj = JSON.parse(note.note_object);
                _this3.online.push(obj);
              } catch (e) {
                obj = null;
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

          resolve();
        }).fail(function (err) {
          console.error('prowebject.com error', err);

          resolve();
        });
      });
      return promise;
    }
  }, {
    key: 'sendOnline',
    value: function sendOnline() {
      var _this4 = this;

      var promise = new Promise(function (resolve, reject) {
        var d = { notes: _this4.final, pair_code: Sync.pwj_pair_code, clear: true };
        $.ajax({
          url: 'http://prowebject.com/stickynotes/web/panel/backend/putNotes.php',
          method: 'post',
          dataType: 'text',
          data: d,
          error: function error(err) {
            console.error('prowebject.com error', err);
          }
        }).done(function (data) {
          resolve();
        }).fail(function (err) {
          console.error('prowebject.com error', err);

          resolve();
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
      var _this6 = this;

      var promise = new Promise(function (resolve, reject) {
        _get(Object.getPrototypeOf(SyncViaGoogleDrive), 'synchronize', _this6).call(_this6, _notes).then(function () {
          SyncFileSystem.requestFileSystem().then(SyncFileSystem.getFileEntries).then(SyncFileSystem.getNotesFromEntries).then(function (notes) {
            _this6.online = notes || [];
            _this6.cmp();

            IndexedDB.putNotes(_this6.final).catch(function (e) {});
            SyncFileSystem.putNotes(_this6.final);
            _this6.notifyUpdates();
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