'use strict';

var InTheNote = InTheNote || {
  changesInProgress: false,
  saveDelayedTimeout: null,
  saveDelayed: function saveDelayed() {
    this.changesInProgress = true;
    $("#buttonClose").addClass("buttonclosesaveon-delayed").attr('title', 'Changes detected, stop typing to autosave :)');
    clearTimeout(this.saveDelayedTimeout);
    this.saveDelayedTimeout = setTimeout(this.save.bind(this), 700);
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
          _this.setSortedMenuItems().then(function () {
            _this.setWindowActions();
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
  update: function update() {
    var promise = new Promise(function (resolve, reject) {
      IndexedDB.getNote(note.id).then(function (newnote) {
        if (changesInProgress === false && Note.isNotesContentSame(newnote, note) !== true && newnote.date > note.date) {
          note = newnote;
          $("#notetextarea").html(note.textarea);
          color = note.color;
          updateColor();
          setTextarea();
          InTheNote.setMenuColors();
          setFonts();
          setSnippet();
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
        resolve();
      });
    });
    return promise;
  },
  setMenuColors: function setMenuColors() {
    var menu = $("#menuColors");

    menu.empty();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = colors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var color_single = _step2.value;

        menu.append('<div class="button left colorbutton" data-color="' + color_single + '" style="" title="Set this color!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:' + color_single + ';"></div></div>');
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

    $(".colorbutton").on('click', function () {
      color = $(this).data("color");
      updateColor();
      InTheNote.setMenuColors();
    });

    menu.append('<div class="button left colorbutton storedependent" id="BuyBgColors" style="" title="Get more colors!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:#000000; animation:multicolor 5s infinite linear"></div></div>');
    $("#BuyBgColors").on('click', function (evt) {
      chrome.app.window.create("store/purchase.html#bgcolors", {
        innerBounds: {
          width: 800,
          height: 600
        }
      });
    });

    if (purchasedelementslocal.color_palette_background) {
      menu.append('<div class="button left buttoncolormap" id="openBackgroundPalette" style="" title="Choose from the palette!"></div>');
      $("#openBackgroundPalette").on('click', function (evt) {
        openBackgroundPalette();
      });
    }
  },
  addOptionalBgColor: function addOptionalBgColor(color) {
    if (colors.indexOf(color) === -1) {
      colors.push(color);
      return true;
    }
    return false;
  },
  setPurchasedItems: function setPurchasedItems() {
    var _this2 = this;

    var promise = new Promise(function (resolve, reject) {
      chrome.storage.sync.get("purchasedinapp", function (data) {
        if (data && data.purchasedinapp) {
          var items = data.purchasedinapp;
          var u_color = false;
          for (var i in items) {
            if (items[i] !== true) {
              continue;
            }
            if (/^color_box_background_.+/.test(i) === true) {
              if (inAppProducts[i] && inAppProducts[i].colors) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = inAppProducts[i].colors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _color = _step3.value;

                    _this2.addOptionalBgColor(_color);
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
              }
              u_color = true;
              continue;
            }
            switch (i) {
              case "color_palette_background":
                purchasedelementslocal["color_palette_background"] = true;
                u_color = true;
                break;

              case "color_background_454f56":
                _this2.addOptionalBgColor("#" + i.split("color_background_").join(""));
                u_color = true;
                break;
              case "color_background_ff7171":
                _this2.addOptionalBgColor("#" + i.split("color_background_").join(""));
                u_color = true;
                break;
              case "color_background_ff4fc1":
                _this2.addOptionalBgColor("#" + i.split("color_background_").join(""));
                u_color = true;
                break;

              case "speech_to_text":
                $("#buttonSpeechToText").css("display", "block");
                break;
            }
          }
          if (u_color) {
            _this2.setMenuColors();
          }
        }
      });
    });
    return promise;
  },
  setSortedMenuItems: function setSortedMenuItems() {
    var promise = new Promise(function (resolve, reject) {
      chrome.storage.sync.get("sortedMenuItems", function (data) {
        var menu = $("#menuMenu");
        if (data.sortedMenuItems !== null && data.sortedMenuItems.length > 0) {
          menu.append($("#toolbar > .sortable").not("#" + data.sortedMenuItems.join(",#")));
          $("#customButtonsEndPoint").before($("#" + data.sortedMenuItems.join(",#")));
        } else {
          menu.append($("#toolbar > .sortable"));
        }
        sortedMenuItemsReady = true;
        while ($("#toolbar > .button").length * 25 > $(window).width() - 20 && $("#customButtonsEndPoint").prev(".sortable").length > 0) {
          menu.append($("#customButtonsEndPoint").prev(".sortable"));
          sortedMenuItemsReady = false;
        }
        resolve();
      });
    });
    return promise;
  },
  setWindowActions: function setWindowActions() {
    if ($("#toolbar > .button, #windowActionsBox > .button").length * 25 <= $(window).width()) {
      $("#windowActionsBox").removeClass("windowActionsBoxDrop").addClass("windowActionBoxToolbar");
      $("#buttonClose").after($("#windowActionsBox"));
    } else {
      $("#windowActionsBox").removeClass("windowActionBoxToolbar").addClass("windowActionsBoxDrop");
      $("body").append($("#windowActionsBox"));
    }
  },
  print: (function (_print) {
    function print() {
      return _print.apply(this, arguments);
    }

    print.toString = function () {
      return _print.toString();
    };

    return print;
  })(function () {
    console.log('print');
    var win = chrome.app.window.current();
    if (win.contentWindow.innerWidth < 500 || win.contentWindow.innerHeight < 500) {
      win.resizeTo(500, 500);
    }
    print();
  })
};