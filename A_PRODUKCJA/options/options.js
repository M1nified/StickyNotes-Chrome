"use strict";

$(document).ready(function () {
	displayNotifications1();
	displayStartupPanel();
	loadPWJsyncManager();
	displayAutostart1();
	setCheckboxListeners();
	setSpeechToTextLangs();
	loadNotesManager();
	loadSharedNotesManager();
	loadSyncStorageNotes();
	loadGDriveFilesManager();
	loadServiceMenu();
	loadImportExportMenu();
});
var displayNotifications1 = function displayNotifications1() {
	chrome.storage.sync.get("notifications1", function (data) {
		if (data && data.notifications1) {
			$("#notifications1").attr("checked", data.notifications1);
		} else {
			$("#notifications1").attr("checked", true);
			chrome.storage.sync.set({ notifications1: true });
		}
	});
};
var displayStartupPanel = function displayStartupPanel() {
	chrome.storage.sync.get("allLaunch", function (allLaunch) {
		allLaunch = allLaunch.allLaunch;
		if (allLaunch === true) {
			$("#startuppanel1").attr("checked", false);
		} else {
			$("#startuppanel1").attr("checked", true);
		}
	});
};
var displayPWJsyncManager = function displayPWJsyncManager() {
	chrome.storage.sync.get(["pwj_sync", "pwj_pair_code"], function (data) {
		$("#pwj_login").empty();
		if (data) {
			if (data.pwj_sync && data.pwj_pair_code) {
				$("#pwj_pair_code").attr('value', data.pwj_pair_code);
				$("#pwj_sync").attr('checked', data.pwj_sync);
			}
		}
	});
};
var loadPWJsyncManager = function loadPWJsyncManager() {
	displayPWJsyncManager();
	$("#pwj_sync").on('change', function (evt) {
		if (this.checked) {
			chrome.storage.sync.get("pwj_pair_code", function (data) {
				if (!data || !data.pwj_pair_code) {
					var code = ('xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx-' + Date.now()).replace(/[xy]/g, function (c) {
						var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0,
						    v = c == 'x' ? r : r & 0x3 | 0x8;
						return v.toString(16);
					});
					chrome.storage.sync.set({ pwj_sync: true, pwj_pair_code: code }, function (d) {
						displayPWJsyncManager();
					});
				} else {
					chrome.storage.sync.set({ pwj_sync: true }, function (d) {
						displayPWJsyncManager();
					});
				}
			});
		} else {
			chrome.storage.sync.set({ pwj_sync: false, pwj_login: null });
		}
	});
};
var displayAutostart1 = function displayAutostart1() {
	chrome.storage.sync.get("autorun", function (data) {
		console.log('displayAutostart1', data);
		if (data && typeof data.autorun === 'boolean') {
			$("#autostart1").attr("checked", data.autorun);
		}
	});
};
var setSpeechToTextLangs = function setSpeechToTextLangs() {
	chrome.storage.sync.get("purchasedinapp", function (data) {
		if (!data || !data.purchasedinapp || !data.purchasedinapp.speech_to_text) {
			$(".s2t").css("display", "none");
		}
	});

	for (var i in speechToTextLangs) {
		var l = speechToTextLangs[i];
		if (!l) {
			continue;
		}
		if (l.length === 2) {
			$("#speechToTextLang").append("<option code=\"" + l[1] + "\">" + l[0] + "</option>");
		} else if (l.length > 2) {
			for (var di = 1; di < l.length; di++) {
				var d = l[di];
				$("#speechToTextLang").append("<option code=\"" + d[0] + "\">" + l[0] + " (" + d[1] + ")" + "</option>");
			}
		}
	}
	chrome.storage.sync.get('speechToTextLang', function (lang) {
		lang = lang.speechToTextLang;
		if (lang) {
			console.log($("#speechToTextLang>option[code=" + lang + "]")[0]);
			$("#speechToTextLang>option[code=" + lang + "]").attr("selected", "selected");
		}
	});
	$("#speechToTextLang").on("change", function () {
		var l = $("#speechToTextLang>option:selected").attr("code");
		chrome.storage.sync.set({ speechToTextLang: l }, function () {});
	});
};
var setCheckboxListeners = function setCheckboxListeners() {
	$("input[type=checkbox]:not(.prevent)").on("change", function () {
		var data = {};
		data[$(this).data('name')] = $(this).data('negate') ? !this.checked : this.checked;
		console.log(data);
		chrome.storage.sync.set(data);
	});
};
var loadNotesManager = function loadNotesManager() {
	$(".localNotes tbody").empty().append("<li>Loading...</li>");
	var openRequest = indexedDB.open("notes");
	openRequest.onupgradeneeded = function (e) {
		var db = openRequest.result;
		var store = db.createObjectStore("notes", { keyPath: "id" });
		var idIndex = store.createIndex("by_id", "id", { unique: true });
	};
	openRequest.onsuccess = function (e) {
		console.log("Success!");
		var db = e.target.result;
		var tx = db.transaction("notes", "readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");

		var items = [];

		tx.oncomplete = function (evt) {
			$(".localNotes tbody").empty();
			for (var i in items) {
				var noterow = "<td>" + items[i].id + "</td><td>" + (items[i].textarea ? items[i].textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0, 40) : ' ') + "</td><td>" + toTimeStamp(items[i].date) + "</td>";
				$(".localNotes tbody").append("<tr>" + noterow + "</tr>");
			}
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
	};
};
var loadSharedNotesManager = function loadSharedNotesManager() {
	chrome.storage.sync.get("id_owner", function (data) {
		var id_owner = data.id_owner;
		$.get("http://prowebject.com/stickynotes/sharebox/getNotesByUser.php?id_owner=" + id_owner, function (result) {
			$(".sharedNotes tbody").empty();
			var items = null;
			try {
				items = JSON.parse(result);
			} catch (e) {}
			if (items) {
				for (i in items) {
					if (!items[i].note) {
						continue;
					}
					var noterow = "<td><a class='clicker removeSharedNote' link='" + items[i].link_remove + "'>DELETE</a></td><td><a target='_blank' href='" + items[i].link_note + "'>" + items[i].id_note + "</a></td><td>" + items[i].note.textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0, 40) + "</td><td>" + toTimeStamp(parseInt(items[i].note.date)) + "</td>";
					$(".sharedNotes tbody").append("<tr>" + noterow + "</tr>");
				}
			}
			$("a.removeSharedNote").on("click", function () {
				$.get($(this).attr('link'), function (req) {
					loadSharedNotesManager();
				});
			});
		});
	});
};
var loadSyncStorageNotes = function loadSyncStorageNotes() {
	$(".syncStorageNotes tbody").empty().append("<li>Loading...</li>");
	chrome.storage.sync.get(null, function (data) {
		var allonlinekeys = Object.keys(data);
		var notes = [];
		var notesJSON = {};
		$(".syncStorageNotes tbody").empty();
		for (i in allonlinekeys) {
			if (/note_\w+/.test(allonlinekeys[i])) {
				var noterow = "<td><button class='copyFromSyncStorageToIndexedDB' noteID='" + data[allonlinekeys[i]].id + "'>IMPORT</button></td><td><button class='removeFromSyncStorage' noteID='" + data[allonlinekeys[i]].id + "'>REMOVE</button></td><td>" + data[allonlinekeys[i]].id + "</td><td>" + data[allonlinekeys[i]].textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0, 40) + "</td><td>" + toTimeStamp(data[allonlinekeys[i]].date) + "</td>";
				$(".syncStorageNotes tbody").append("<tr>" + noterow + "</tr>");
			}
		}
		$("button.copyFromSyncStorageToIndexedDB").on("click", function () {
			console.log();
			var id = $(this).attr("noteID");
			chrome.storage.sync.get("note_" + id, function (data) {
				var note = data["note_" + id];
				if (note) {
					console.log(data["note_" + id]);
					var openRequest = indexedDB.open("notes");
					openRequest.onsuccess = function (e) {
						var db = e.target.result;
						var tx = db.transaction("notes", "readwrite");
						var store = tx.objectStore("notes");
						var index = store.index("by_id");

						var request = index.get(note.id);
						request.onsuccess = function () {
							var put = store.put(note);
							put.onsuccess = function () {
								loadNotesManager();
							};
						};
					};
				}
			});
		});
		$("button.removeFromSyncStorage").on("click", function () {
			console.log();
			var id = $(this).attr("noteID");
			chrome.storage.sync.remove("note_" + id, function (data) {
				loadSyncStorageNotes();
			});
		});
	});
};
var loadGDriveFilesManager = function loadGDriveFilesManager() {
	chrome.syncFileSystem.requestFileSystem(function (fs) {
		var dirReader = fs.root.createReader();
		var entries = [];
		var getFiles = function getFiles() {
			dirReader.readEntries(function (results) {
				console.log("run");
				console.log(results);
				if (results && results.length) {
					results.forEach(function (elem, index) {
						entries.push(elem);
					});
					getFiles();
				} else {
					fillTable(entries);
				}
			});
		};
		getFiles();
	});
	var fillTable = function fillTable(fe) {
		console.log(fe);
		fe.forEach(function (elem, index) {
			console.log(index);
			$(".gDriveFiles>tbody").append("<tr><td>" + index + "</td><td></td><td>" + elem.name + "</td><td></td></tr>");
		});
	};
};
var loadImportExportMenu = function loadImportExportMenu() {
	$("#downloadNotes").on("click", function () {
		chrome.fileSystem.chooseEntry({ type: "saveFile", suggestedName: "sticky_notes.sticky_notes" }, function (fileEntry) {
			var openRequest = indexedDB.open("notes");
			openRequest.onsuccess = function (e) {
				var db = e.target.result;
				var tx = db.transaction("notes", "readwrite");
				var store = tx.objectStore("notes");
				var index = store.index("by_id");
				var items = [];
				tx.oncomplete = function (evt) {
					fileEntry.createWriter(function (fileWriter) {
						var truncated = false;
						fileWriter.onwriteend = function (e) {
							if (!truncated) {
								this.truncate(this.position);
								truncated = true;
							}
						};
						var blob = new Blob([JSON.stringify(items)], { type: 'text/plain' });
						fileWriter.write(blob);
					}, function () {});
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
			};
		});
	});
	$("#uploadNotes").on("click", function () {
		chrome.fileSystem.chooseEntry({ type: "openFile", suggestedName: "sticky_notes.sticky_notes" }, function (fileEntry) {
			fileEntry.file(function (file) {
				var reader = new FileReader();
				reader.onloadend = function () {
					var notes = null;
					try {
						notes = JSON.parse(this.result);
					} catch (e) {
						errorHandler(e);
					}
					console.log(notes);
					if (notes) {
						IndexedDB.putNotes(notes);
					}
				};
				reader.readAsText(file);
			});
		});
	});
};
var closeAllNotes = function closeAllNotes() {
	var allwindows = chrome.app.window.getAll();
	console.log(allwindows);
	for (var _i in allwindows) {
		(function (thewindow) {
			thewindow.contentWindow.saveNote(function () {
				thewindow.close();
			});
		})(allwindows[_i]);
	}
};
var loadServiceMenu = function loadServiceMenu() {
	$("button.memoryFullReset").on("click", memoryFullReset);
	$("button.memoryIndexedDBClear").on("click", memoryIndexedDBClear);
	$("button.memoryChromeLocalStorageClear").on("click", memoryChromeLocalStorageClear);
	$("button.memoryChromeSyncStorageClear").on("click", memoryChromeSyncStorageClear);
};
var memoryFullReset = function memoryFullReset() {
	memoryIndexedDBClear();

	memoryChromeSyncStorageClear();
	memoryChromeLocalStorageClear();
};
var memoryIndexedDBClear = function memoryIndexedDBClear() {
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function (e) {
		var db = e.target.result;
		var tx = db.transaction("notes", "readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		var items = [];
		tx.oncomplete = function (evt) {};
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
			for (var i in items) {
				store.delete(items[i].id);
			}
		};
	};
	openRequest.onerror = function (e) {
		console.log("Error");
		console.dir(e);
	};
};
var memoryChromeLocalStorageClear = function memoryChromeLocalStorageClear() {
	chrome.storage.local.clear(function () {});
};
var memoryChromeSyncStorageClear = function memoryChromeSyncStorageClear() {
	chrome.storage.sync.clear(function () {});
};