'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function errorHandler(e) {
	var msg = e.name;
	if (e.message) {
		msg += ' (' + e.message + ')';
	}
	console.error('Error(handled): ' + msg);
}
function toArray(list) {
	return Array.prototype.slice.call(list || [], 0);
}
function isNotesContentSame(note1, note2) {
	var arethesame = true;
	var differences = {};
	if (note1.textarea !== note2.textarea) {
		differences.textarea = true;
	}
	if (note1.color !== note2.color) {
		differences.color = true;
	}
	if (note1.fontfamily !== note2.fontfamily) {
		differences.fontfamily = true;
	}
	if (note1.fontsize !== note2.fontsize) {
		differences.fontsize = true;
	}
	if (Object.keys(differences).length == 0) {
		return true;
	} else {
		return differences;
	}
}
function getTime() {
	var d = new Date();
	return "" + d.getHours() + ":" + retMM(d);
}
function toTimeStamp(ms) {
	var d = new Date(ms);
	return "" + d.getDate() + "." + d.getMonth() + "." + d.getFullYear() + " " + d.getHours() + ":" + retMM(d) + ":" + retSS(d);
}
function retMM(date) {
	var m = date.getMinutes();
	var mm = m < 10 ? "0" + m : m;
	return mm;
}
function retSS(date) {
	var s = date.getMinutes();
	var ss = s < 10 ? "0" + s : s;
	return ss;
}

function saveSelection() {
	if (window.getSelection) {
		var sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			return sel.getRangeAt(0);
		}
	} else if (document.selection && document.selection.createRange) {
		return document.selection.createRange();
	}
	return null;
}

function restoreSelection(range) {
	if (range) {
		if (window.getSelection) {
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (document.selection && range.select) {
			range.select();
		}
	}
}

function insertText(text, selection) {
	var range = saveSelection();
	if (selection) {
		range = selection;
	}

	range.deleteContents();
	var elem = document.createTextNode(text);
	range.insertNode(elem);
	var sel = window.getSelection();
	range.setStartAfter(elem);
	range.setEndAfter(elem);
	sel.removeAllRanges();
	sel.addRange(range);
}
function insertElem(elem) {
	var range = saveSelection();
	range.deleteContents();
	range.insertNode(elem);
	var sel = window.getSelection();
	range.setStartAfter(elem);
	range.setEndAfter(elem);
	sel.removeAllRanges();
	sel.addRange(range);
}
var DropMenu = function DropMenu() {
	var menu = this;
	menu.elements = [];
	menu.boss = [];
	menu.hidetimeout = null;
	menu.addBoss = function (targets) {
		if (typeof targets == 'array' || (typeof targets === 'undefined' ? 'undefined' : _typeof(targets)) == 'object') {
			$.each(targets, function (i, target) {
				console.log(target);
				$(target).on('mousedown contextmenu', function (event) {
					menu.show(event);
				});
			});
			return true;
		}
		return false;
	};
	menu.addElement = function (elems) {
		if (typeof elems == 'array' || (typeof elems === 'undefined' ? 'undefined' : _typeof(elems)) == 'object') {
			$.each(elems, function (i, elem) {
				menu.elements.push(elem);
			});
			return true;
		}
		return false;
	};
	menu.show = function (event) {
		if (event) {
			console.log(event);
			var id = Math.random().toString().slice(2);
			var x = event.clientX;
			var y = event.clientY;
			var menubox = '<div class="drop_menu" id="' + id + '" style="position:fixed;">';
			for (i in menu.elements) {
				menubox += menu.elements[i];
			}
			menubox += "</div>";
			console.log(menubox);
			$('body').append(menubox);
			menubox = $("#" + id);
			if (menubox.height() + y + 15 > $(window).height()) {
				y = $(window).height() - menubox.height() - 15;
			}
			if (menubox.width() + x + 25 > $(window).width()) {
				x = $(window).width() - menubox.width() - 25;
			}
			menubox.css('top', y);
			menubox.css('left', x);
			menu.hidetimeout = setTimeout(function () {}, 2000);
			menubox.on('mouseover', function () {
				clearTimeout(menu.hidetimeout);
				menu.hidetimeout = setTimeout(function () {}, 2000);
			});
		}
	};
	menu.hide = function () {};
	return this;
};
var x = 0;