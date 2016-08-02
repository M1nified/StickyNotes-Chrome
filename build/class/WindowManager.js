'use strict';

var WindowManager = {
  closeAllWindows: function closeAllWindows() {
    var allwindows = chrome.app.window.getAll();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = allwindows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var win = _step.value;

        (function (thewindow) {
          if (typeof thewindow.contentWindow.saveNote === 'function') {
            thewindow.contentWindow.saveNote(function () {
              thewindow.close();
            });
          } else {
            thewindow.close();
          }
        })(win);
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
  },
  alwaysOnTopSwap: function alwaysOnTopSwap() {
    var is = chrome.app.window.current().isAlwaysOnTop();
    chrome.app.window.current().setAlwaysOnTop(!is);
    return !is;
  },
  openLink: function openLink() {
    var link = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var url = $(this).attr("href") || link;
    if (!url) {
      return false;
    }
    chrome.app.window.create(url, { innerBounds: { width: 800, height: 600 } });
    return true;
  }
};