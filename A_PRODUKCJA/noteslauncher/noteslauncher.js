"use strict";

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

	var nl = $("#noteslist");
	for (var i in notes) {
		var note = notes[i];
		if (note.removed) {
			continue;
		}
		nl.append('<li><table><tr><td><span class="notecolor" data-note="' + note.id + '" style="background-color:' + note.color + ';"></span></td><td class="notecontent" style="font-family:' + note.fontfamily + '"><div>' + note.textarea + '</div></td><td><span class="openbutton" data-note="' + note.id + '" style="background-color:' + note.color + ';">Open</span></td></tr></li>');
	}

	$(".openall").on("click", function () {
		openAllNotes();
	});
	$(".openallclose").on("click", function () {
		openAllNotes(function () {
			chrome.app.window.current().close();
		});
	});
	$(".notecolor").on("click", function () {
		var id = $(this).data('note');
		var note = jQuery.grep(notes, function (n, i) {
			return n.id === id;
		});
		if (note && note[0]) {
			note = note[0];
			(function (note) {
				chrome.app.window.create('/note/note.html', { id: note.id, frame: 'none' }, function (createdWindow) {
					createdWindow.contentWindow.note = note;
					chrome.app.window.get(note.id).onClosed.addListener(function () {
						syncAll();
					});
				});
			})(note);
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
var openAllNotes = function openAllNotes(callback) {
	var callbackcounter = 0;
	for (var i in notes) {
		callbackcounter++;
		var note = notes[i];
		if (note.removed === true) {
			continue;
		}
		(function (note) {
			chrome.app.window.create('/note/note.html', { id: note.id, frame: 'none' }, function (createdWindow) {
				createdWindow.contentWindow.note = note;
				chrome.app.window.get(note.id).onClosed.addListener(function () {
					syncAll();
				});
				callbackcounter--;
				if (callbackcounter === 0 && typeof callback === 'function') {
					callback();
				}
			});
		})(note);
	}
};