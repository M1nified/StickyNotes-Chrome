'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IndexedDB = (function () {
	function IndexedDB() {
		_classCallCheck(this, IndexedDB);
	}

	_createClass(IndexedDB, null, [{
		key: "getNotes",
		value: function getNotes() {
			var promise = new Promise(function (resolve, reject) {
				var openRequest = indexedDB.open("notes", 4);
				openRequest.onupgradeneeded = function (e) {
					console.log("IndexedDB upgrade needed.");
					console.log(e);
					var db = e.target.result;
					db.onerror = function (event) {
						reject(event.taget.errorCode);
					};
					try {
						var store = db.createObjectStore("notes", { keyPath: "id" });
						var idIndex = store.createIndex("by_id", "id", { unique: true });
					} catch (e) {
						console.log(e);
						reject(e);
					}
				};
				openRequest.onsuccess = function (e) {
					console.log("Success! (1)");

					var db = this.result;
					db.onerror = function (event) {
						reject(event.target.errorCode);
					};
					var tx = null;
					try {
						tx = db.transaction("notes", "readwrite");
					} catch (e) {
						console.log(e);
						return false;
					}
					var store = tx.objectStore("notes");
					var index = store.index("by_id");

					var items = [];

					tx.oncomplete = function (evt) {
						resolve(items);
					};
					var cursorRequest = store.openCursor();
					cursorRequest.onerror = function (error) {
						console.log(error);
					};
					cursorRequest.onsuccess = function (evt) {
						var cursor = evt.target.result;
						if (cursor) {
							items.push(cursor.value);
							cursor.continue();
						}
					};
				};
				openRequest.onerror = function (e) {
					console.log("Error");
					console.dir(e);
					reject(e);
				};
			});
			return promise;
		}
	}, {
		key: "putNotes",
		value: function putNotes(notes) {}
	}, {
		key: "clearRemoved",
		value: function clearRemoved() {}
	}]);

	return IndexedDB;
})();