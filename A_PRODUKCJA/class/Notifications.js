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

  idmap: {},
  onClicked: function onClicked(notificationId) {
    var idtranslation = Notifications.idmap[notificationId] || notificationId;
    console.log('CLICK', idtranslation, idtranslation);
    if (/\d+_\d+/.test(idtranslation)) {
      App.openLauncher();
    } else {
      switch (idtranslation) {
        case 'multiple_notes_updated':
          App.openLauncher();
          break;
      }
    }
  },
  simpleInfo: function simpleInfo(message) {
    var opt = {
      type: "basic",
      iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
      title: "Sticky Notes",
      message: message
    };
    chrome.notifications.create(opt);
  },
  notify: function notify(options) {
    var _this = this;

    var id = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    chrome.notifications.create(id, options, function (notificationId) {
      _this.idmap[notificationId] = id;
    });
  },
  notifyAboutUpdatedNotes: function notifyAboutUpdatedNotes(notes) {
    var _this2 = this;

    var notifyAboutSingleNote = function notifyAboutSingleNote() {
      _this2.notify({
        type: "basic",
        iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
        title: 'Sticky Notes',
        message: 'One note was updated',

        isClickable: true
      }, notes.id);
    };
    if (notes && Array.isArray(notes)) {
      if (notes.length > 1) {
        this.notify({
          type: "basic",
          iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
          title: 'Sticky Notes',
          message: notes.length + " notes were updated",

          isClickable: true
        }, 'multiple_notes_updated');
      } else if (notes.length === 1) {
        notes = notes[0];
        notifyAboutSingleNote();
      }
    } else if (notes) {
      notifyAboutSingleNote();
    } else {
      return false;
    }
  },
  notifyAboutRemovedNotes: function notifyAboutRemovedNotes(notes) {
    var _this3 = this;

    var notifyAboutSingleNote = function notifyAboutSingleNote() {
      _this3.notify({
        type: "basic",
        iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
        title: 'Sticky Notes',
        message: 'One note was removed',
        isClickable: false
      }, 'note_removed');
    };
    if (notes && Array.isArray(notes)) {
      if (notes.length > 1) {
        this.notify({
          type: "basic",
          iconUrl: chrome.runtime.getURL("/img/icon_128.png"),
          title: 'Sticky Notes',
          message: notes.length + " notes were removed",
          isClickable: false
        }, 'note_removed');
      } else if (notes.length === 1) {
        notes = notes[0];
        notifyAboutSingleNote();
      }
    } else if (notes) {
      notifyAboutSingleNote();
    } else {
      return false;
    }
  }
};