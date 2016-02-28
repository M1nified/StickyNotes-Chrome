'use strict';

var IndexedDB = {
	openRequest: function openRequest() {
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
				resolve(this.result);
			};
			openRequest.onerror = function (e) {
				console.log("Error");
				console.dir(e);
				reject(e);
			};
		});
		return promise;
	},
	getNotes: function getNotes() {
		var _this = this;

		var promise = new Promise(function (resolve, reject) {
			_this.openRequest().then(function (db) {
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
			});
		});
		return promise;
	},
	getNote: function getNote(id) {
		var _this2 = this;

		var promise = new Promise(function (resolve, reject) {
			_this2.openRequest().then(function (db) {
				var tx = db.transaction("notes", "readonly");
				var store = tx.objectStore("notes");
				var index = store.index("by_id");
				var request = index.get(id);
				request.onsuccess = function () {
					resolve(request.result);
				};
				request.onerror = function (e) {
					reject(e);
				};
			});
		});
		return promise;
	},
	putNotes: function putNotes(notes) {
		var _this3 = this;

		var promise = new Promise(function (resolve, reject) {
			_this3.openRequest().then(function (db) {
				var tx = db.transaction("notes", "readwrite");
				var store = tx.objectStore("notes");
				var index = store.index("by_id");
				var callStack = 0;
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = notes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var note = _step.value;

						if (note) {
							callStack++;
							try {
								store.put(note).onsuccess = function (event) {
									callStack--;
									if (callStack === 0) {
										resolve();
									}
								};
							} catch (e) {
								console.error(e);
								callStack--;
							}
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
			});
		});
		return promise;
	},
	clearRemovedNotes: function clearRemovedNotes() {
		var _this4 = this;

		var promise = new Promise(function (resolve, reject) {
			_this4.openRequest().then(function (db) {
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
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var item = _step2.value;

							if (Boolean(item.removed) === true) {
								store.delete(item.id);
							}
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
				};
			});
		});
		return promise;
	}
};