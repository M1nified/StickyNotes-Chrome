'use strict';
var Speech2Text = {
  running : false,
  language : null,
  recognition : null,
  selectionKeeper : null,
  initiate : function() {
    console.log('initiate');
    let init = () => {
      console.log('init');
      if(this.running === true){
        this.stop();
      }else{
        chrome.storage.sync.get('speechToTextLang',(lang)=>{
          lang = lang.speechToTextLang;
          if(!lang){
            this.showLanguageSelection();
          }else{
            this.language = lang;
            this.start();
          }
        })
      }
    }
    chrome.permissions.request({
      permissions:['audioCapture']
    },(granted) => {
      console.log('granted',granted)
      if(granted){
        init();
      }
    })
  },
  start : function(){
    console.log('start')
    this.selectionKeeper = new SelectionKeeper();
    if('webkitSpeechRecognition' in window){
      this.running = true;
      try{
        this.recognition = this.recognition || new webkitSpeechRecognition();
      }catch(e){
        this.recognition = new webkitSpeechRecognition();
      }
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      this.recognition.onstart = () => {
        console.log('S2T start');
        $("#buttonSpeechToText").addClass('speechToTextOn');
      }
      this.recognition.onresult = (event) => {
        console.log('S2T onresult',event);
        $("#pendingOperations1").show();
        let interim_transcript = '';
        let final_transcript = '';
        this.selectionKeeper.keep();
        for(let i = event.resultIndex; i<event.results.length; ++i){
          if(event.results[i].isFinal){
            final_transcript += event.results[i][0].transcript;
          }else{
            interim_transcript += event.results[i][0].transcript;
          }
        }
        if(final_transcript.trim() !== ""){
          ((innnerSelectionKeeper,text)=>{
            if(innnerSelectionKeeper){
              Content.insertText(text,innnerSelectionKeeper.selection);
            }else{
              //no selection actions
            }
            $("#pendingOperations1").hide();
            saveNoteDelayed();
          })(this.selectionKeeper,final_transcript.trim());
        }
      }
      this.recognition.onerror = (event) => {
        console.error("S2T",event.error);
      }
      this.recognition.onend = () => {
        $("#pendingOperations1").hide();
        if(this.running === true){
          this.recognition.start();
        }
      }
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia({
        audio : true
      },(stream)=>{
        this.recognition.start();
      },(err)=>{
        console.error("S2T DENIED",err);//No permission or no microphone available
      });
    }
  },
  stop : function(){
    $("#buttonSpeechToText").removeClass('speechToTextOn');
    this.running = false;
    this.recognition.stop();
  },
  showLanguageSelection : function(){
    $("#speechToTextLangSelBox").fadeIn(200);
  }
}
