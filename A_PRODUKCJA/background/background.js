'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GLOBALS = {
	pwj_sync: false,
	pwj_pair_code: null
};

var StickyNotes = (function () {
	function StickyNotes() {
		_classCallCheck(this, StickyNotes);

		this.setOnLaunched();
		this.listeners = new BackgroundListeners();
		Store.run();
	}

	_createClass(StickyNotes, [{
		key: 'setOnLaunched',
		value: function setOnLaunched() {
			chrome.app.runtime.onLaunched.addListener((function onLaunched() {
				this.background = new App();
			}).bind(this));
		}
	}]);

	return StickyNotes;
})();

StickyNotes.STORE = null;

var App = (function () {
	function App() {
		_classCallCheck(this, App);

		console.log('LAUNCH');
		this.initLaunching();
	}

	_createClass(App, [{
		key: 'initLaunching',
		value: function initLaunching() {
			chrome.storage.sync.get(['pwj_sync', 'pwj_pair_code'], (function initLaunching2(data) {
				if (data && data.pwj_sync && data.pwj_pair_code) {
					GLOBALS.pwj_sync = data.pwj_sync;
					GLOBALS.pwj_pair_code = data.pwj_pair_code;
				} else {
					GLOBALS.pwj_sync = false;
					GLOBALS.pwj_pair_code = null;
				}
				this.continueLaunching();
			}).bind(this));
		}
	}, {
		key: 'continueLaunching',
		value: function continueLaunching() {
			var _this = this;

			IndexedDB.getNotes().then(function (notes) {
				console.log(notes);
				_this.notes = notes;
				_this.properLaunching();
				Sync.synchronize(notes);
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

var BackgroundListeners = function BackgroundListeners() {
	_classCallCheck(this, BackgroundListeners);

	console.log('LISTENERS');
};

var stickynotes = new StickyNotes();