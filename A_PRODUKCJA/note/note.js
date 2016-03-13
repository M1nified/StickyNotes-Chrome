'use strict';

var colors = ['#FFF', '#f7f945', '#FEFF87', '#87E7FF', '#C0A2D8', '#8BE48E', '#53e3de', '#ff9e2b'];
var color = "#FEFF87";

var hidemenutimeout = null;
var save = true;
chrome.app.window.current().outerBounds.setMinimumSize(160, 160);
var sortedMenuItemsReady = false;
var speechrecognitionon = false;
var speechToTextActiveLang = "en-US";
var purchasedelementslocal = {};
var grabbed = null;
var runIndependently = function runIndependently(func) {
	setTimeout(func, 0);
};
$(document).ready(function () {
	chrome.storage.sync.get(null, function (data) {
		console.log(data);
	});
	runIndependently(updateColor);
	runIndependently(setTextarea);
	runIndependently(InTheNote.setMenuColors);
	runIndependently(setFonts);
	runIndependently(function () {
		InTheNote.setSortedMenuItems().then(function () {
			InTheNote.setWindowActions();
		});
	});
	runIndependently(setSpeechToTextLangsList);
	runIndependently(setLiveListeners);
	runIndependently(InTheNote.setPurchasedItems);
	runIndependently(checkStoreState);

	try {
		color = presetcolor;
		updateColor();
	} catch (e) {}

	if (typeof note != 'undefined' && note != null) {
		$("#notetextarea").html(note.textarea);
		color = note.color || "#FEFF87";
		updateColor();
	} else {
		note = {};
		note.id = chrome.app.window.current().id;
	}

	buttonYesNoChange($("#buttonAlwaysOnTop")[0], chrome.app.window.current().isAlwaysOnTop());

	InTheNote.save();
});
var hideWindowActionsTimeout = null;
var setLiveListeners = function setLiveListeners() {
	$("body").on("dblclick", "ul.task-list li", function (event) {
		event.preventDefault();
		event.stopPropagation();
		if ($(this).hasClass('done') === true) {
			$(this).removeClass('done');
		} else {
			$(this).addClass('done');
		}
		InTheNote.saveDelayed();
		var selection = window.getSelection();

		selection.removeAllRanges();
	});
	$("body").on("dblclick", "ul.task-list li span", function (event) {
		event.preventDefault();
		event.stopPropagation();
	});
};

var showWindowActions = function showWindowActions() {
	if (!$("#windowActionsBox").is(":visible")) {
		$("#windowActionsBox").show("fast");
	}
};
var markButtonCloseAsSaved = function markButtonCloseAsSaved() {
	$("#buttonClose").removeClass("buttonclosesaveon buttonclosesaveon-delayed").attr('title', 'Saved, click to Hide!');
};
var hideWindowActionsDelayed = function hideWindowActionsDelayed() {
	clearTimeout(hideWindowActionsTimeout);
	hideWindowActionsTimeout = setTimeout(function () {
		hideWindowActions();
	}, 1500);
};
var hideWindowActions = function hideWindowActions() {
	clearTimeout(hideWindowActionsTimeout);
	$("#windowActionsBox").hide("fast");
};
var setSpeechToTextLangsList = function setSpeechToTextLangsList() {
	for (var i in speechToTextLangs) {
		var l = speechToTextLangs[i];
		if (l.length === 2) {
			$("#speechToTextLangSelBox>ul").append("<li code=\"" + l[1] + "\">" + l[0] + "</li>");
		} else if (l.length > 2) {
			for (var di = 1; di < l.length; di++) {
				var d = l[di];
				$("#speechToTextLangSelBox>ul").append("<li code=\"" + d[0] + "\">" + l[0] + " (" + d[1] + ")" + "</li>");
			}
		}
	}
	$("#speechToTextLangSelBox>ul>li").click(function () {
		var langcode = $(this).attr('code');
		chrome.storage.sync.set({ speechToTextLang: langcode }, function () {});
		$("#speechToTextLangSelBox").fadeOut(300);
	});
};
var buttonYesNoChange = function buttonYesNoChange(button, value) {
	if (value) {
		$(button).removeClass('buttonNo').addClass('buttonYes');
	} else {
		$(button).removeClass('buttonYes').addClass('buttonNo');
	}
};
var updateColor = function updateColor(save, nc) {
	var c = color;
	if (typeof nc !== 'undefined') {
		c = nc;
	}
	if (typeof save === 'undefined') {
		save = true;
	}
	if (typeof c === "number") {
		c = colors[c];
	}
	$(".globalBox").css("background-color", c);
	$("#buttonColor .dot").css("background-color", c);
	if (save) {
		InTheNote.saveDelayed();
	}
};
var openNewNote = function openNewNote() {
	chrome.runtime.sendMessage({ func: "openNewNote", presetcolor: color, presetfont: { fontfamily: $("#noteBox").css("font-family"), fontsize: $("#noteBox").css("font-size") } });
};
var setTextarea = function setTextarea() {
	var h = $(window).height() - 10;
	var w = $(window).width() - 10;
	h -= $("#notetextarea").position().top;

	$("#noteBox>*").css("height", h);
	$("#noteBox>*").css("width", w);
};
var setFonts = function setFonts() {
	try {
		$("#noteBox").css("font-family", presetfont.fontfamily);
	} catch (e) {}
	try {
		$("#noteBox").css("font-size", presetfont.fontsize);
	} catch (e) {}
	if (note) {
		$("#noteBox").css("font-family", note.fontfamily);
		$("#noteBox").css("font-size", note.fontsize);
	}
};
var openBackgroundPalette = function openBackgroundPalette() {
	$("#colorPalette").fadeIn(200);
	$("#colormap>area").on("click", function (evt) {
		color = $(this).attr("alt");

		updateColor();
	}).on("mouseover", function (evt) {
		updateColor(false, $(this).attr("alt"));
	});
	$("#colormap").on("mouseout", function (evt) {
		updateColor();
	});
};
var setSnippet = function setSnippet() {
	document.title = $("#notetextarea").text().slice(0, 40);
};
var updateNote = function updateNote() {
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function (e) {
		var db = e.target.result;
		var tx = db.transaction("notes", "readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		var request = index.get(note.id);
		request.onsuccess = function () {
			if (request && request.result) {
				var newnote = request.result;
				if (changesInProgress === false && isNotesContentSame(newnote, note) !== true && newnote.date > note.date) {
					note = newnote;
					$("#notetextarea").html(note.textarea);
					color = note.color;
					updateColor();
					setTextarea();
					InTheNote.setMenuColors();
					setFonts();
					setSnippet();
				}
			}
		};
	};
	openRequest.onerror = function (e) {
		console.log("Error");
		console.dir(e);
	};
};
var checkStoreState = function checkStoreState() {
	chrome.storage.local.get("isStoreOpen", function (data) {
		if (data) {
			setStoreState(data.isStoreOpen);
		}
	});
};
var setStoreState = function setStoreState(state) {
	if (state) {
		$(".storedependent").removeClass("offcosnostore");
	} else {
		$(".storedependent").addClass("offcosnostore");
	}
};