'use strict';

var SyncFileSystem = {
  requestFileSystem: function requestFileSystem() {
    var promise = new Promise(function (resolve, reject) {
      try {
        chrome.syncFileSystem.requestFileSystem(function (fs) {
          if (chrome.runtime.lastError || !fs) {
            reject();
          } else {
            resolve(fs);
          }
        });
      } catch (e) {
        console.log(e);
        reject();
      }
    });
    return promise;
  },
  getFileEntries: function getFileEntries(fileSystem) {
    var promise = new Promise(function (resolve, reject) {
      var dirReader = fs.root.createReader();
      var fileEntries = [];
      var readEntries = function readEntries() {
        dirReader.readEntries(function (results) {
          if (!results.length) {
            resolve(fileEntries);
          } else {
              fileEntries.concat(toArray(results));
              readEntries();
            }
        }, function (e) {
          console.log(e);
          reject();
        });
      };
      readEntries();
    });
    return promise;
  }
};