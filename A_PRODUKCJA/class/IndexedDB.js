'use strict';

var IndexedDB = {
	getNotes: function getNotes() {
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
	},
	putNotes: function putNotes(notes) {
		var openRequest = indexedDB.open("notes");
		openRequest.onsuccess = function (e) {
			var db = e.target.result;
			var tx = db.transaction("notes", "readwrite");
			var store = tx.objectStore("notes");
			var index = store.index("by_id");
			for (var note in notes) {
				if (note.removed === true) {
					try {
						store.delete(note.id);
					} catch (e) {
						console.error(e);
					}
				} else if (note) {
					try {
						store.put(note);
					} catch (e) {
						console.error();
					}
				}
			}
		};
		openRequest.onerror = function (e) {
			console.log("Error");
			console.dir(e);
		};
	},
	clearRemovedNotes: function clearRemovedNotes() {
		var promise = new Promise(function () {
			var openRequest = indexedDB.open("notes");
			openRequest.onsuccess = function (e) {
				var db = e.target.result;
				var tx = db.transaction("notes", "readwrite");
				var store = tx.objectStore("notes");
				var cursorRequest = store.openCursor();

				var items = [];

				cursorRequest.onerror = function (error) {
					console.log(error);
				};
				cursorRequest.onsuccess = function (evt) {
					var cursor = evt.target.result;
					if (cursor) {
						items.push(cursor.value);
						cursor.continue();
					}
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var item = _step.value;

							if (Boolean(item.removed) === true) {
								store.delete(item.id);
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
				};
			};
			openRequest.onerror = function (e) {
				console.log("Error");
				console.dir(e);
			};
		});
		return promise;
	}
};