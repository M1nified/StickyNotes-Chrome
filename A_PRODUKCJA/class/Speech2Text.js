'use strict';

var Speech2Text = {
  running: false,
  language: null,
  recognition: null,
  selectionKeeper: null,
  initiate: function initiate() {
    var _this = this;

    console.log('initiate');
    var init = function init() {
      console.log('init');
      if (_this.running === true) {
        _this.stop();
      } else {
        chrome.storage.sync.get('speechToTextLang', function (lang) {
          lang = lang.speechToTextLang;
          if (!lang) {
            _this.showLanguageSelection();
          } else {
            _this.language = lang;
            _this.start();
          }
        });
      }
    };
    chrome.permissions.request({
      permissions: ['audioCapture']
    }, function (granted) {
      console.log('granted', granted);
      if (granted) {
        init();
      }
    });
  },
  start: function start() {
    var _this2 = this;

    console.log('start');
    this.selectionKeeper = new SelectionKeeper();
    if ('webkitSpeechRecognition' in window) {
      this.running = true;
      try {
        this.recognition = this.recognition || new webkitSpeechRecognition();
      } catch (e) {
        this.recognition = new webkitSpeechRecognition();
      }
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      this.recognition.onstart = function () {
        console.log('S2T start');
        $("#buttonSpeechToText").addClass('speechToTextOn');
      };
      this.recognition.onresult = function (event) {
        console.log('S2T onresult', event);
        $("#pendingOperations1").show();
        var interim_transcript = '';
        var final_transcript = '';
        _this2.selectionKeeper.keep();
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
        if (final_transcript.trim() !== "") {
          (function (innnerSelectionKeeper, text) {
            if (innnerSelectionKeeper) {
              Content.insertText(text, innnerSelectionKeeper.selection);
            } else {}
            $("#pendingOperations1").hide();
            saveNoteDelayed();
          })(_this2.selectionKeeper, final_transcript.trim());
        }
      };
      this.recognition.onerror = function (event) {
        console.error("S2T", event.error);
      };
      this.recognition.onend = function () {
        $("#pendingOperations1").hide();
        if (_this2.running === true) {
          _this2.recognition.start();
        }
      };
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia({
        audio: true
      }, function (stream) {
        _this2.recognition.start();
      }, function (err) {
        console.error("S2T DENIED", err);
      });
    }
  },
  stop: function stop() {
    $("#buttonSpeechToText").removeClass('speechToTextOn');
    this.running = false;
    this.recognition.stop();
  },
  showLanguageSelection: function showLanguageSelection() {
    $("#speechToTextLangSelBox").fadeIn(200);
  }
};