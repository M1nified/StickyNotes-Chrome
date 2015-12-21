'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GLOBALS = {
	pwj_sync: false,
	pwj_pair_code: null
};

var StickyNotes = function StickyNotes() {
	_classCallCheck(this, StickyNotes);

	chrome.app.runtime.onLaunched.addListener((function onLaunched() {
		this.background = new App();
	}).bind(this));
	BackgroundListeners.run();
	Store.run();
	Sync.synchronizeNow();
};

var App = (function () {
	function App() {
		_classCallCheck(this, App);

		console.log('LAUNCH');
		this.initLaunching();
	}

	_createClass(App, [{
		key: 'initLaunching',
		value: function initLaunching() {
			Sync.updateTheWay();
			this.continueLaunching();
		}
	}, {
		key: 'continueLaunching',
		value: function continueLaunching() {
			var _this = this;

			IndexedDB.getNotes().then(function (notes) {
				console.log(notes);
				_this.notes = notes;
				_this.properLaunching();
				Sync.synchronizeNow(notes);
			});
		}
	}, {
		key: 'properLaunching',
		value: function properLaunching() {
			chrome.storage.sync.get("allLaunch", (function (data) {
				if (data && data.allLaunch) {
					Notes.launchNotes(this.notes);
				} else {
					chrome.app.window.create('noteslauncher/noteslauncher.html', { id: "notes_launcher", innerBounds: { width: 430, height: 540 }, frame: { color: "#8C8C8C" } }, (function (createdWindow) {
						createdWindow.contentWindow.notes = this.notes;
					}).bind(this));
				}
			}).bind(this));
		}
	}]);

	return App;
})();

var BackgroundListeners = {
	run: function run() {
		console.log('LISTENERS');
		chrome.runtime.onMessage.addListener(this.runtimeOnMessage);
		chrome.storage.onChanged.addListener(this.storageOnChanged);
	},
	runtimeOnMessage: function runtimeOnMessage(msg, sender, sendResponse) {
		switch (msg.func) {
			case "openNewNote":
				Notes.openNewNote(msg.presetcolor, msg.presetfont);
				break;
			case "syncAll":
				Sync.synchronizeNow();
				break;
			case "syncAllDelayed":
				Sync.synchronize();
				break;
			case "toClipboard":
				toClipboard(msg.val, sendResponse);
				break;
		}
	},
	storageOnChanged: function storageOnChanged(changes, areaName) {
		if (changes.pwj_sync || changes.pwj_pair_code) {
			Sync.updateTheWay();
		}
		if (areaName === 'sync') {
			var keys = Object.keys(changes);
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var key = _step.value;

					if (options[key] !== undefined) {
						options[key] = changes[key].newValue;
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
		}
	}
};
var stickynotes = new StickyNotes();