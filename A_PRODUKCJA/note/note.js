'use strict';

var colors = ['#FFF', '#f7f945', '#FEFF87', '#87E7FF', '#C0A2D8', '#8BE48E', '#53e3de', '#ff9e2b'];
var color = "#FFF";
var savetimeout = null;
var hidemenutimeout = null;
var save = true;
chrome.app.window.current().outerBounds.setMinimumSize(160, 160);
var sortedMenuItemsReady = false;
var speachrecognitionon = false;
var speechToTextActiveLang = "en-US";
var purchasedelementslocal = {};
var grabbed = null;
$(document).ready(function () {
	chrome.storage.sync.get(null, function (data) {
		console.log(data);
	});
	updateColor();
	setTextarea();
	setMenuColors();
	setFonts();
	setSortedMenuItems(function () {
		setWindowActions();
	});
	setSpeechToTextLangsList();
	setLiveListeners();
	setPurchasedItems();
	checkStoreState();

	$(".sortable").on("dragstart", function (event) {
		grabbed = event.target;
	});
	$(".toolbar").on("drop", function (event) {
		event.preventDefault();
		$("#customButtonsEndPoint").before(grabbed);
		grabbed = null;
		saveNoteDelayed();
	}).on("dragover", function (event) {
		event.preventDefault();
	});
	$("#noteBox").on("drop", function (event) {
		if (grabbed) {
			event.preventDefault();
			$("#menuMenu").append(grabbed);
			grabbed = null;
		}
		saveNoteDelayed();
	}).on("dragover", function (event) {
		if (grabbed) {
			event.preventDefault();
		}
	});
	$(".textFormat").click(function () {
		var role = $(this).data("role");
		document.execCommand(role, false, null);
	});
	$("#buttonTaskList").click(function () {
		document.execCommand('insertUnorderedList', false, null);
		var elem = $(window.getSelection().focusNode).closest("ul");
		elem.addClass('task-list');
	});
	$(".fontbutton").each(function () {
		$(this).css("font-family", $(this).attr("font-family")).attr("title", $(this).attr("font-family"));
	});
	$(".fontbutton").click(function (event) {
		$("#noteBox").css("font-family", $(this).attr("font-family"));
		saveNoteDelayed();
	});
	$(".fontsizebutton").click(function (event) {
		$("#noteBox").css("font-size", parseInt($("#noteBox").css("font-size")) + parseInt($(this).attr("font-size-change")));
		saveNoteDelayed();
	});
	$(".menubutton").click(function (event) {
		var menuId = $(this).attr('menu');
		if (!$("#" + menuId).is(':visible')) {
			if ($(".menucollection").is(':visible')) {
				$(".menucollection").not("#" + menuId).hide(function () {
					$("#" + menuId).show("slow");
				});
			} else {
				$("#" + menuId).show("slow");
			}
		} else {
			$(".menucollection").hide("slow");
		}
	});
	$(".menucollection").mouseout(function () {
		clearTimeout(hidemenutimeout);
		hidemenutimeout = setTimeout(function () {
			$(".menucollection").hide("slow");
		}, 1500);
	});
	$(".menucollection").mouseover(function () {
		clearTimeout(hidemenutimeout);
	});
	$("#buttonClose").click(function (event) {
		saveNote(function () {
			window.close();
		});
	}).on('mousedown contextmenu mouseover', function () {
		showWindowActions();
	});
	$("#windowActionsBox").on('mouseout blur', function () {
		hideWindowActionsDelayed();
	}).on('mousein', function () {
		clearTimeout(hideWindowActionsTimeout);
	});
	$("#buttonMinimize").click(function () {
		if (!chrome.app.window.current().isMinimized()) {
			chrome.app.window.current().minimize();
		} else {
			chrome.app.window.current().restore();
		}
	});
	$("#buttonMaximize").click(function () {
		if (!chrome.app.window.current().isMaximized()) {
			chrome.app.window.current().maximize();
		} else {
			chrome.app.window.current().restore();
		}
	});
	$("#buttonAdd").click(function (event) {
		openNewNote();
	});
	$("#buttonDel").click(function (event) {
		$("#removeBox").fadeIn(200);
	});
	$("#removeCancel").click(function (event) {
		$("#removeBox").fadeOut(300);
	});
	$("#removeRemove").click(function (event) {
		closeThisNote();
	});
	$("#buttonCloseAll").click(function (event) {
		var allwindows = chrome.app.window.getAll();
		console.log(allwindows);
		for (var i in allwindows) {
			(function (thewindow) {
				if (typeof thewindow.contentWindow.saveNote === "function") {
					thewindow.contentWindow.saveNote(function () {
						thewindow.close();
					});
				} else {
					thewindow.close();
				}
			})(allwindows[i]);
		}
	});
	$("#buttonSpeachToText").click(function (event) {
		speechToTextInitiate();
	});
	$("#buttonAlwaysOnTop").click(function (event) {
		var is = chrome.app.window.current().isAlwaysOnTop();
		chrome.app.window.current().setAlwaysOnTop(!is);
		buttonYesNoChange(this, !is);
	});
	$("#buttonGoToOptions").click(function () {
		event.preventDefault();
		chrome.app.window.create($(this).attr("href"), { innerBounds: { width: 800, height: 600 } });
	});
	$("#buttonOpenStore").click(function () {
		event.preventDefault();
		chrome.app.window.create($(this).attr("href"), { innerBounds: { width: 800, height: 600 } });
	});
	$("#buttonShareLink").click(function (evt) {
		chrome.storage.sync.get("id_owner", function (data) {
			if (data && data.id_owner) {
				var id_owner = data.id_owner;
				var newnote = {};
				newnote.id = note.id;
				newnote.textarea = $("#notetextarea").html();
				newnote.color = color;
				newnote.fontfamily = $("#noteBox").css("font-family");
				newnote.fontsize = $("#noteBox").css("font-size");
				newnote.date = new Date().valueOf();

				$.post("http://prowebject.com/stickynotes/sharebox/share.php", {
					id_owner: id_owner,
					note: newnote
				}, function (result) {
					if (result) {
						var result = JSON.parse(result);

						chrome.app.window.create('/background/shared.html', { id: note.id + "_shared", innerBounds: { width: 256, height: 320, maxWidth: 256, maxHeight: 320 } }, function (createdWindow) {
							createdWindow.contentWindow.info = result;
							try {
								createdWindow.contentWindow.update();
							} catch (e) {}
						});
					}
				});
			}
		});
	});
	$("#colorPalette").on("click", function (evt) {
		$("#colorPalette").fadeOut(300);
	});
	$(window).resize(function () {
		setTextarea();
		setSortedMenuItems(function () {
			setWindowActions();
		});
	});
	$(window).blur(function () {
		chrome.runtime.sendMessage({ func: "syncAllDelayed" });
		hideWindowActions();
	});
	try {
		color = presetcolor;
		updateColor();
	} catch (e) {}
	if (typeof note != 'undefined' && note != null) {
		$("#notetextarea").html(note.textarea);
		color = note.color || "#FFF";
		updateColor();
	} else {
		note = {};
		note.id = chrome.app.window.current().id;
	}
	$("#notetextarea").on('keypress keyup', function (event) {
		saveNoteDelayed();
	});
	var k17Delay = null;
	var k17 = false;
	var k17selectionstart = null;
	var k17selectionend = null;
	var k17counter = 0;
	$(window).on('keydown keyup', function (event) {
		var k17Down = function k17Down() {
			var notetextarea = $("#notetextarea");
			var noteclickarea = $("#noteclickarea");
			if (k17 === false) {
				k17 = true;
				k17selectionstart = notetextarea.prop("selectionStart");
				k17selectionend = notetextarea.prop("selectionEnd");
				var context = notetextarea.html();
				var scrolltop = notetextarea.scrollTop();
				var context_url = urlize(context, { autoescape: false });
				notetextarea.hide();
				noteclickarea.show().css('height', notetextarea.css('height')).css('width', notetextarea.css('width')).html(context_url).scrollTop(scrolltop);
			}
			clearTimeout(k17Delay);
			k17Delay = setTimeout(k17Up, 1500);
		};
		var k17Up = function k17Up() {
			if (k17) {
				clearTimeout(k17Delay);
				var notetextarea = $("#notetextarea");
				var noteclickarea = $("#noteclickarea");
				var scrolltop = noteclickarea.scrollTop();
				noteclickarea.hide();
				notetextarea.show().scrollTop(scrolltop).prop("selectionStart", k17selectionstart).prop("selectionEnd", k17selectionend);
				k17 = false;
			}
		};

		switch (event.keyCode) {
			case 17:
				switch (event.type) {
					case "keydown":
						if (event.altKey === false && k17counter > 0) {
							k17Down();
						} else {
							k17counter++;
						}
						break;
					case "keyup":
						k17counter = 0;k17Up();
						break;
				}
				break;
			case 85:
				if (event.type == "keyup" && event.ctrlKey && event.shiftKey) {
					document.execCommand("strikeThrough", false, null);
				}
				break;
			case 188:
				if (event.type == "keydown" && event.ctrlKey) {
					event.preventDefault();
					$("#noteBox").css("font-size", parseInt($("#noteBox").css("font-size")) + 1);
					saveNoteDelayed();
				}
				break;
			case 190:
				if (event.type == "keydown" && event.ctrlKey) {
					event.preventDefault();
					$("#noteBox").css("font-size", parseInt($("#noteBox").css("font-size")) - 1);
					saveNoteDelayed();
				}
				break;
		}
	}).on("wheel", function (event) {
		if (event.ctrlKey) {
			event.preventDefault();
			if (event.originalEvent.deltaY > 0) {
				$("#noteBox").css("font-size", parseInt($("#noteBox").css("font-size")) - 1);
			} else if (event.originalEvent.deltaY < 0) {
				$("#noteBox").css("font-size", parseInt($("#noteBox").css("font-size")) + 1);
			}
			saveNoteDelayed();
		}
	});
	$("#notetextarea").on("keydown", function (event) {
		switch (event.keyCode) {
			case 9:
				event.preventDefault();
				insertElem($(document.createElement('pre')).addClass('pretab').append("&#9;")[0]);
				break;
		}
	});
	chrome.app.window.onClosed.addListener(function () {
		if (save) {
			saveNote();
		}
	});
	buttonYesNoChange($("#buttonAlwaysOnTop")[0], chrome.app.window.current().isAlwaysOnTop());
	saveNote();
});
chrome.storage.onChanged.addListener(function (changes, areaName) {
	if (changes.sortedMenuItems !== null) {
		setSortedMenuItems(function () {
			setWindowActions();
		});
	}
	if (changes.purchasedinapp !== null && changes.purchasedinapp !== undefined) {
		setPurchasedItems();
	}
	if (changes.isStoreOpen !== null && changes.isStoreOpen !== undefined) {
		setStoreState(changes.isStoreOpen.newValue);
	}
});
var hideWindowActionsTimeout = null;
var setWindowActions = function setWindowActions() {
	if ($("#toolbar > .button, #windowActionsBox > .button").length * 25 <= $(window).width()) {
		$("#windowActionsBox").removeClass("windowActionsBoxDrop").addClass("windowActionBoxToolbar");
		$("#buttonClose").after($("#windowActionsBox"));
	} else {
		$("#windowActionsBox").removeClass("windowActionBoxToolbar").addClass("windowActionsBoxDrop");
		$("body").append($("#windowActionsBox"));
	}
};
var setLiveListeners = function setLiveListeners() {
	$("body").on("dblclick", "ul.task-list li", function (event) {
		event.preventDefault();
		event.stopPropagation();
		if ($(this).hasClass('done') === true) {
			$(this).removeClass('done');
		} else {
			$(this).addClass('done');
		}
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
var speechToTextInitiate = function speechToTextInitiate() {
	var init = function init() {
		if (speachrecognitionon === true) {
			speechToTextOff();
		} else {
			chrome.storage.sync.get('speechToTextLang', function (lang) {
				console.log(lang);
				lang = lang.speechToTextLang;
				if (!lang) {
					$("#speechToTextLangSelBox").fadeIn(200);
				} else {
					speechToTextActiveLang = lang;
					speechToTextOn();
				}
			});
		}
	};

	chrome.permissions.request({ permissions: ['audioCapture'] }, function (granted) {
		if (granted) {
			init();
		}
	});
};
var recognition;
var speechToTextOn = function speechToTextOn() {
	console.log("try");
	if ('webkitSpeechRecognition' in window) {
		speachrecognitionon = true;
		console.log("on");
		try {
			recognition = recognition || new webkitSpeechRecognition();
		} catch (e) {
			recognition = new webkitSpeechRecognition();
		}

		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = speechToTextActiveLang;

		recognition.onstart = function () {
			$("#buttonSpeachToText").addClass('speachToTextOn');
		};
		recognition.onresult = function (event) {
			$("#pendingOperations1").show();
			var interim_transcript = '';
			var final_transcript = '';
			var range = saveSelection();
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					final_transcript += event.results[i][0].transcript;
				} else {
					interim_transcript += event.results[i][0].transcript;
				}
			}
			if (final_transcript.trim() !== "") {
				(function (range, text) {
					if (range) {
						insertText(text, range);
					} else {}
					$("#pendingOperations1").hide();
					saveNoteDelayed();
				})(range, final_transcript);
			}
		};
		recognition.onerror = function (event) {
			console.log("ERR");
			console.log(event.error);
		};
		recognition.onend = function () {
			$("#pendingOperations1").hide();
			if (speachrecognitionon === true) {
				recognition.start();
			}
		};

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		navigator.getUserMedia({ audio: true }, function (stream) {
			recognition.start();
		}, function (err) {
			console.log("DENIED");
			console.log(err);
		});
	}
};
var speechToTextOff = function speechToTextOff() {
	$("#buttonSpeachToText").removeClass('speachToTextOn');
	speachrecognitionon = false;
	recognition.stop();
};
var setSortedMenuItems = function setSortedMenuItems(callback) {
	chrome.storage.sync.get({ sortedMenuItems: null }, function (data) {
		if (data.sortedMenuItems !== null && data.sortedMenuItems.length > 0) {
			$("#menuMenu").append($("#toolbar > .sortable").not("#" + data.sortedMenuItems.join(",#")));
			$("#customButtonsEndPoint").before($("#" + data.sortedMenuItems.join(",#")));
		} else {
			$("#menuMenu").append($("#toolbar > .sortable"));
		}
		sortedMenuItemsReady = true;
		while ($("#toolbar > .button").length * 25 > $(window).width() - 20 && $("#customButtonsEndPoint").prev(".sortable").length > 0) {
			$("#menuMenu").append($("#customButtonsEndPoint").prev(".sortable"));
			sortedMenuItemsReady = false;
		}
		if (typeof callback === "function") {
			callback();
		}
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
		saveNoteDelayed();
	}
};
var openNewNote = function openNewNote() {
	chrome.runtime.sendMessage({ func: "openNewNote", presetcolor: color, presetfont: { fontfamily: $("#noteBox").css("font-family"), fontsize: $("#noteBox").css("font-size") } });
};
var closeThisNote = function closeThisNote() {
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function (e) {
		var db = e.target.result;
		var tx = db.transaction("notes", "readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		store.put({ id: note.id, removed: true, date: new Date().valueOf() }).onsuccess = function (event) {
			chrome.runtime.sendMessage({ func: "syncAllDelayed" });
			save = false;
			chrome.app.window.current().close();
		};
	};
	openRequest.onerror = function (e) {
		console.log("Error");
		console.dir(e);
	};
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
var setMenuColors = function setMenuColors() {
	$("#menuColors").empty();
	for (var i in colors) {
		$("#menuColors").append('<div class="button left colorbutton" data-color="' + colors[i] + '" style="" title="Set this color!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:' + colors[i] + ';"></div></div>');
	}
	$(".colorbutton").on("click", function () {
		color = $(this).data("color");

		updateColor();
		setMenuColors();
	});
	$("#menuColors").append('<div class="button left colorbutton storedependent" id="BuyBgColors" style="" title="Get more colors!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:#000000; animation:multicolor 5s infinite linear"></div></div>');
	$("#BuyBgColors").on("click", function (elem) {
		chrome.app.window.create("store/purchase.html#bgcolors", { innerBounds: { width: 800, height: 600 } });
	});

	if (purchasedelementslocal.color_palette_background) {
		$("#menuColors").append('<div class="button left buttoncolormap" id="openBackgroundPalette" style="" title="Choose from the palette!"></div>');
		$("#openBackgroundPalette").on("click", function (elem) {
			openBackgroundPalette();
		});
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
var saveNoteDelayedTimeout = null;
var changesInProgress = false;
var saveNoteDelayed = function saveNoteDelayed() {
	changesInProgress = true;
	$("#buttonClose").addClass("buttonclosesaveon-delayed").attr('title', 'Changes detected, stop typing to autosave :)');
	clearTimeout(saveNoteDelayedTimeout);
	saveNoteDelayedTimeout = setTimeout(saveNote, 700);
};
var saveNote = function saveNote(callback) {
	$("#buttonClose").removeClass("buttonclosesaveon-delayed").attr('title', 'Saving!');
	var textarea = $("#notetextarea").html();

	if (sortedMenuItemsReady) {
		var sortedMenuItems = $(".toolbar > .sortable").toArray();
		for (var i in sortedMenuItems) {
			sortedMenuItems[i] = sortedMenuItems[i].id;
		}
		chrome.storage.sync.set({ sortedMenuItems: sortedMenuItems }, function () {
			setSortedMenuItems(function () {
				setWindowActions();
			});
		});
	}
	setSnippet();
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function (e) {
		var db = e.target.result;
		var tx = db.transaction("notes", "readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");

		var request = index.get(note.id);
		request.onsuccess = function () {
			if (request.result === undefined) {
				var newnote = {};
				newnote.id = note.id;
				newnote.textarea = textarea;
				newnote.width = $(window).width();
				newnote.height = $(window).height();
				newnote.top = window.screenY;
				newnote.left = window.screenX;
				newnote.color = color;
				newnote.fontfamily = $("#noteBox").css("font-family");
				newnote.fontsize = $("#noteBox").css("font-size");
				newnote.date = new Date().valueOf();
				newnote.sortedMenuItems = sortedMenuItems;

				var put = store.put(newnote);
				put.onsuccess = function () {
					note = newnote;
					markButtonCloseAsSaved();
					chrome.runtime.sendMessage({ func: "syncAllDelayed" });
					if (callback) {
						callback();
					}
				};
				changesInProgress = false;
			} else {
				var oldnotecopy = JSON.parse(JSON.stringify(request.result));
				request.result.textarea = textarea;
				request.result.width = $(window).width();
				request.result.height = $(window).height();
				request.result.top = window.screenY;
				request.result.left = window.screenX;
				request.result.color = color;
				request.result.fontfamily = $("#noteBox").css("font-family");
				request.result.fontsize = $("#noteBox").css("font-size");
				request.result.sortedMenuItems = sortedMenuItems;
				if (isNotesContentSame(oldnotecopy, request.result) === true) {
					markButtonCloseAsSaved();
					if (callback) {
						callback();
					}
				} else {
					request.result.date = new Date().valueOf();
					console.log("UPDATED");
					var put = store.put(request.result);
					put.onsuccess = function () {
						note = request.result;
						markButtonCloseAsSaved();
						chrome.runtime.sendMessage({ func: "syncAllDelayed" });
						if (callback) {
							callback();
						}
					};
				}
				changesInProgress = false;
			}
		};
	};
	openRequest.onerror = function (e) {
		console.log("Error");
		console.dir(e);
	};
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
					setMenuColors();
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
var setPurchasedItems = function setPurchasedItems() {
	chrome.storage.sync.get("purchasedinapp", function (data) {
		if (data && data.purchasedinapp) {
			var items = data.purchasedinapp;
			var u_color = false;
			for (var i in items) {
				console.log(i);
				console.log(items[i]);
				if (items[i] !== true) {
					continue;
				}
				if (/^color_box_background_.+/.test(i) === true) {
					if (inAppProducts[i] && inAppProducts[i].colors) {
						for (var j in inAppProducts[i].colors) {
							addOptionalBgColor(inAppProducts[i].colors[j]);
						}
					}
					u_color = true;
					continue;
				}
				switch (i) {
					case "color_palette_background":
						purchasedelementslocal["color_palette_background"] = true;
						u_color = true;
						break;

					case "color_background_454f56":
						addOptionalBgColor("#" + i.split("color_background_").join(""));
						u_color = true;
						break;
					case "color_background_ff7171":
						addOptionalBgColor("#" + i.split("color_background_").join(""));
						u_color = true;
						break;
					case "color_background_ff4fc1":
						addOptionalBgColor("#" + i.split("color_background_").join(""));
						u_color = true;
						break;

					case "speech_to_text":
						$("#buttonSpeachToText").css("display", "block");
						break;
				}
			}
			if (u_color) {
				setMenuColors();
			}
		}
	});
};
var addOptionalBgColor = function addOptionalBgColor(color) {
	if (colors.indexOf(color) === -1) {
		colors.push(color);
	}
};