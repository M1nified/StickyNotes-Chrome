'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GLOBALS = {
	pwj_sync: false,
	pwj_pair_code: null,
	options: {}
};

var StickyNotes = function StickyNotes() {
	var _this = this;

	_classCallCheck(this, StickyNotes);

	chrome.app.runtime.onLaunched.addListener((function onLaunched() {
		this.background = new App();
	}).bind(this));
	BackgroundListeners.run();
	Sync.synchronizeNow();
	Sync.syncLoop();
	chrome.storage.sync.get("autorun", function (data) {
		if (data && data.autorun === true) {
			$(function () {
				console.log('AUTORUN ENABLED');
				_this.background = new App();
			});
		} else {
			console.log('AUTORUN DISABELED');
		}
	});
};

var App = (function () {
	function App() {
		_classCallCheck(this, App);

		console.log('LAUNCH');
		this.initLaunching();
		App.storageCheck();
		Store.run();
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
			var _this2 = this;

			IndexedDB.getNotes().then(function (notes) {
				console.log(notes);
				_this2.notes = notes;
				_this2.properLaunching();
				Sync.synchronizeNow(notes);
			});
		}
	}, {
		key: 'properLaunching',
		value: function properLaunching() {
			chrome.storage.sync.get("allLaunch", (function (data) {
				if (data && data.allLaunch) {
					Notes.launchNotesNewIfEmpty(this.notes);
				} else {
					App.openLauncher.call(this);
				}
			}).bind(this));
		}
	}], [{
		key: 'openLauncher',
		value: function openLauncher() {
			chrome.app.window.create('/noteslauncher/noteslauncher.html', { id: "notes_launcher", innerBounds: { width: 430, height: 540 }, frame: { color: "#8C8C8C" } }, (function (createdWindow) {
				if (this.notes) {
					createdWindow.contentWindow.notes = this.notes;
				}
			}).bind(this));
		}
	}, {
		key: 'storageCheck',
		value: function storageCheck() {
			chrome.storage.sync.get(null, function (data) {
				var fieldstobeset = {};
				if (!data || !data.id_owner) {
					var id_owner = App.randOwnerId();
					fieldstobeset.id_owner = id_owner;
				}
				chrome.storage.sync.set(fieldstobeset);
			});
		}
	}, {
		key: 'randOwnerId',
		value: function randOwnerId() {
			var d = new Date();
			var id = d.valueOf() + '_' + Math.random().toString().slice(2);
			return id;
		}
	}]);

	return App;
})();

var BackgroundListeners = {
	run: function run() {
		console.log('LISTENERS');

		chrome.runtime.onMessage.addListener(this.runtimeOnMessage);
		chrome.storage.onChanged.addListener(this.storageOnChanged);
		chrome.notifications.onClicked.addListener(Notifications.onClicked);
		this.customListener1 = setInterval(function () {
			var windows = chrome.app.window.getAll();
			if (windows.length === 0) {
				Sync.syncLoopStop();
			} else {
				if (!Sync.syncLoopIsGoing) {
					Sync.syncLoop();
				}
			}
		}, 3000);
		this.storeListener1 = setInterval(function () {
			Store.availabilityCheck();
		}, 3600000);
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
		} else if (changes.purchasedinapp) {
			Store.updatePurchasedElements();
		}
	}
};
var stickynotes = new StickyNotes();