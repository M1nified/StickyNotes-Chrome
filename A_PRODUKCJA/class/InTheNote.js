'use strict';

var InTheNote = InTheNote || {
  changesInProgress: false,
  saveDelayedTimeout: null,
  saveDelayed: function saveDelayed() {
    this.changesInProgress = true;
    $("#buttonClose").addClass("buttonclosesaveon-delayed").attr('title', 'Changes detected, stop typing to autosave :)');
    clearTimeout(this.saveDelayedTimeout);
    this.saveDelayedTimeout = setTimeout(this.save, 700);
  },
  save: function save() {
    var _this = this;

    var promise = new Promise(function (resolve, reject) {
      $("#buttonClose").removeClass("buttonclosesaveon-delayed").attr('title', 'Saving!');
      var textarea = $("#notetextarea").html();
      if (sortedMenuItemsReady) {
        var sortedMenuItems = $(".toolbar > .sortable").toArray();
        for (var i in sortedMenuItems) {
          sortedMenuItems[i] = sortedMenuItems[i].id;
        }
        chrome.storage.sync.set({ sortedMenuItems: sortedMenuItems }, function () {
          setSortedMenuItems(function () {
            setWindowActions();
          });
        });
      }
      setSnippet();
      IndexedDB.getNote(note.id).then(function (oldnote) {
        var cleannote = {
          id: note.id,
          textarea: textarea,
          width: $(window).width(),
          height: $(window).height(),
          top: window.screenY,
          left: window.screenX,
          color: color,
          fontfamily: $("#noteBox").css("font-family"),
          fontsize: $("#noteBox").css("font-size"),
          date: new Date().valueOf(),
          sortedMenuItems: sortedMenuItems
        };
        var newnote = null;
        if (oldnote === undefined) {
          newnote = cleannote;
        } else {
          newnote = JSON.parse(JSON.stringify(oldnote));
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = Object.keys(newnote)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var key = _step.value;

              if (key !== 'date' && cleannote[key] !== undefined) {
                newnote[key] = cleannote[key];
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

          if (Note.isContentTheSame(newnote, oldnote) === true) {
            markButtonCloseAsSaved();
            newnote = null;
            resolve();
          } else {
            newnote.date = new Date().valueOf();
            console.log("UPDATE");
          }
        }
        _this.changesInProgress = false;
        if (newnote) {
          IndexedDB.putNotes([newnote]).then(function () {
            console.log("UPDATED");
            note = newnote;
            markButtonCloseAsSaved();
            chrome.runtime.sendMessage({ func: "syncAllDelayed" });
            resolve();
          }, function () {
            reject();
          });
        } else {
          resolve();
        }
      });
    });
    return promise;
  },
  share: function share(evt) {
    chrome.storage.sync.get("id_owner", function (data) {
      if (data && data.id_owner) {
        var id_owner = data.id_owner;
        var newnote = {};
        newnote.id = note.id;
        newnote.textarea = $("#notetextarea").html();
        newnote.color = color;
        newnote.fontfamily = $("#noteBox").css("font-family");
        newnote.fontsize = $("#noteBox").css("font-size");
        newnote.date = new Date().valueOf();

        $.post("http://prowebject.com/stickynotes/sharebox/share.php", {
          id_owner: id_owner,
          note: newnote
        }, function (result) {
          if (result) {
            var result = JSON.parse(result);

            chrome.app.window.create('/background/shared.html', { id: note.id + "_shared", innerBounds: { width: 256, height: 320, maxWidth: 256, maxHeight: 320 } }, function (createdWindow) {
              createdWindow.contentWindow.info = result;
              try {
                createdWindow.contentWindow.update();
              } catch (e) {}
            });
          }
        });
      }
    });
  },
  remove: function remove() {
    var promise = new Promise(function (resolve, reject) {
      Note.remove(note.id).then(function () {
        chrome.runtime.sendMessage({ func: 'syncAllDelayed' });
        save = false;
        chrome.app.window.current().close();
      });
    });
    return promise;
  }
};