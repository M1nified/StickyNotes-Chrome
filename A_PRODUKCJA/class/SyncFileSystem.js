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
    console.log(fileSystem);
    var promise = new Promise(function (resolve, reject) {
      var dirReader = fileSystem.root.createReader();
      var fileEntries = [];
      var readEntries = function readEntries() {
        console.log(fileEntries);
        dirReader.readEntries(function (results) {
          console.log(results);
          if (!results.length) {
            console.log(fileEntries);
            resolve(fileEntries);
          } else {
              fileEntries = fileEntries.concat(results);

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
  },
  getNotesFromEntries: function getNotesFromEntries(fileEntries) {
    var promise = new Promise(function (resolve, reject) {
      var notes = [];
      var readstacksize = 0;
      var loopedcount = 0;
      if (!fileEntries || fileEntries.length === 0) {
        resolve([]);
      } else {
        fileEntries.forEach(function (fileEntry, index) {
          loopedcount++;
          if (/note_(\w|_)+/.test(fileEntry.name)) {
            readstacksize++;
            fileEntry.file(function (file) {
              var reader = new FileReader();

              reader.onloadend = function (event) {
                readstacksize--;

                var json = null;
                try {
                  json = JSON.parse(this.result);
                } catch (e) {
                  json = null;
                }
                if (json !== null) {
                  notes.push(json);
                }

                if (loopedcount === fileEntries.length && readstacksize === 0) {
                  resolve(notes);
                }
              };
              reader.onerror = function (event) {
                readstacksize--;
                console.error('FileReader onerror triggered: E10', event);
                if (loopedcount === fileEntries.length && readstacksize === 0) {
                  resolve(notes);
                }
              };
              reader.readAsText(file);
            });
          } else {
            if (loopedcount === fileEntries.length && readstacksize === 0) {
              resolve(notes);
            }
          }
        });
      }
    });
    return promise;
  },
  putNotes: function putNotes(notes) {
    var _this2 = this;

    this.requestFileSystem().then(function (fs) {
      console.log(notes);
      for (var i in notes) {
        var note = notes[i];
        console.log("PUT NOTE: ", note);
        (function (note) {
          var _this = this;

          fs.root.getFile('note_' + note.id, { create: true }, function (fileEntry) {
            if (note.removed) {
              fileEntry.remove(function () {}, function (e) {
                console.error('fileEntry.remove() ERROR:', e);
              });
            } else {
                _this.writeToFile(fileEntry, JSON.stringify(note));
              }
          });
        }).call(_this2, note);
      }
    });
  },
  writeToFile: function writeToFile(fileEntry, content) {
    console.log('writeToFile', fileEntry);
    fileEntry.createWriter(function (fileWriter) {
      var truncated = false;
      fileWriter.onwriteend = function (e) {
        if (!truncated) {
          this.truncate(this.position);
          truncated = true;
        }
      };
      fileWriter.onerror = function (error) {
        console.error('writeToFile Failed', error);
      };
      var blob = new Blob([content], { type: 'text/plain' });
      fileWriter.write(blob);
    }, function createWriterError(error) {
      console.error('createWriter Failed', error);
    });
  }
};