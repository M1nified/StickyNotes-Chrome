"use strict";

var notes = window.notes || [];
$(function () {

	chrome.storage.sync.get(["allLaunch", "isStoreOpen"], function (data) {
		var allLaunch = data.allLaunch;
		if (allLaunch === true) {
			$("#showalways").attr("checked", true);
		} else if (allLaunch === false) {
			$("#showalways").attr("checked", false);
		}
		var isStoreOpen = data.isStoreOpen;
		if (!isStoreOpen) {
			$(".storedependent").css("display", "none");
		}
	});

	if (!notes || !notes.length || notes.length === 0) {
		console.log('GET MYSELF');
		updateNotes();
	} else {
		displayNotes(notes);
	}

	$(".openall").on("click", function () {
		openAllNotes();
	});
	$(".openallclose").on("click", function () {
		openAllNotes(function () {
			window.close();
		});
	});
	$(document).on("click", ".notecolor", function () {
		var id = $(this).data('note');
		var note = jQuery.grep(notes, function (n, i) {
			return n.id === id;
		});
		if (note && note[0]) {
			note = note[0];
			Notes.openNote(note);
		}
	});
	$("#showalways").on("change", function () {
		var val = $(this).is(":checked");
		chrome.storage.sync.set({ allLaunch: val }, function () {});
	});
	$(".addnote").on('click', function () {
		chrome.runtime.sendMessage({ func: "openNewNote" });
	});
	$(".opensettings").on('click', function () {
		chrome.app.window.create("/options/main.html", { innerBounds: { width: 800, height: 600 } });
	});
	$(".openstore").on('click', function () {
		chrome.app.window.create("/store/purchase.html", { innerBounds: { width: 800, height: 600 } });
	});
	$(".opendonate").on('click', function () {});
});
var displayNotes = function displayNotes(notes) {
	var nl = $("#noteslist").empty();
	for (var i in notes) {
		var note = notes[i];
		if (note.removed) {
			continue;
		}
		nl.append('<li><table><tr><td><span class="notecolor" data-note="' + note.id + '" style="background-color:' + note.color + ';"></span></td><td class="notecontent" style="font-family:' + note.fontfamily + '"><div>' + note.textarea + '</div></td><td><span class="openbutton" data-note="' + note.id + '" style="background-color:' + note.color + ';">Open</span></td></tr></li>');
	}
};
var openAllNotes = function openAllNotes(callback) {
	var callbackcounterDecrementTrigger = function callbackcounterDecrementTrigger() {
		callbackcounter--;

		if (callbackcounter === 0 && typeof callback === 'function') {
			callback();
		}
	};
	var callbackcounter = 0;
	console.log('NOTES', notes);
	for (var i in notes) {
		var note = notes[i];
		if (Note.isRemoved(note)) {
			continue;
		}
		callbackcounter++;
		Notes.openNote(note).then(function () {
			callbackcounterDecrementTrigger();
		}).catch(function (err) {
			callbackcounterDecrementTrigger();
		});
	}
};
var updateNotes = function updateNotes(newnotes) {
	if (newnotes && newnotes.length > 0) {
		notes = newnotes;
		displayNotes(newnotes);
	} else {
		IndexedDB.getNotes().then(function (n) {
			var doINeedToRefresh = false;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				var _loop = function _loop() {
					var newnote = _step.value;

					var oldnote = jQuery.grep(notes, function (n, i) {
						return n.id === newnote.id;
					});
					if (oldnote && (Note.isContentTheSame(newnote, oldnote) || newnote.removed !== newnote.removed)) {
						doINeedToRefresh = true;
						return "break";
					}
				};

				for (var _iterator = n[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _ret = _loop();

					if (_ret === "break") break;
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

			notes = n;
			if (doINeedToRefresh) {
				displayNotes(n);
			}
		});
	}
};