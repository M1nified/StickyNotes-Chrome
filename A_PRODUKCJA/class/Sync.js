'use strict';

var Sync = {
  synchronize: function synchronize() {
    var _this = this;

    var notes = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    clearTimeout(this.synctimeout);
    this.synctimeout = setTimeout(function () {
      _this.synchronizeNow(notes);
    }, 3000);
  },
  synchronizeNow: function synchronizeNow() {
    var _this2 = this;

    var notes = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var promise = new Promise(function (resolve, reject) {
      clearTimeout(_this2.synctimeout);
      _this2.findTheWay().then(function (syncclass) {
        syncclass.synchronize(notes).then(function () {
          resolve();
        }).catch(function (err) {
          log.error(err);
        });
      }).catch(function (err) {
        log.error(err);
      });
    });
    return promise;
  },
  syncLoop: function syncLoop() {
    var _this3 = this;

    var timeout = arguments.length <= 0 || arguments[0] === undefined ? 10000 : arguments[0];

    this.syncLoopIsGoing = true;
    clearTimeout(this.syncLoopTimeout);
    this.syncLoopTimeout = setTimeout(function () {
      _this3.synchronizeNow().then(function () {
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