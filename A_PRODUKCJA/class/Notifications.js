'use strict';

var Notifications = {
  notifyNewNote: function notifyNewNote(note) {
    var opt = {
      type: "basic",
      iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
      title: "New note stored! (" + getTime() + ")",
      message: "Click app icon to load it. (" + note.textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0, 40) + ")"
    };
    chrome.notifications.create(note.id, opt, function () {});
  },
  notifyUpdatedNote: function notifyUpdatedNote(note) {
    var opt = {
      type: "basic",
      iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
      title: "A note has been updated! (" + getTime() + ")",
      message: "Click app icon to load it. (" + note.textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0, 40) + ")"
    };
    chrome.notifications.create(note.id, opt, function () {});
  },
  simpleInfo: function simpleInfo(message) {
    var opt = {
      type: "basic",
      iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
      title: "Sticky Notes",
      message: message
    };
    chrome.notifications.create(opt);
  }
};