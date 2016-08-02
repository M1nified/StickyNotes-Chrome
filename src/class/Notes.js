'use strict';
class Notes{
  static randomId(){
    let d = new Date();
    return d.valueOf()+"_"+Math.random().toString().slice(2);
  }
  static openNewNote(presetcolor,presetfont){
    chrome.app.window.create('/note/note.html',{
      id:this.randomId(),
      frame:'none',
      bounds:{width:250,height:240},
      resizable:true
    },function openNewNoteCallback(createdWindow){
      createdWindow.contentWindow.note = null;
  		createdWindow.contentWindow.presetcolor = presetcolor || null;
  		createdWindow.contentWindow.presetfont = presetfont || null;
  		chrome.app.window.get(createdWindow.id).onClosed.addListener(function onNoteClosed(){
  			syncAll();
  		})
    })
  }
  static openNote(note){
    let promise = new Promise((resolve,reject)=>{
      try{
        if(!note){
          throw "openNote, no note object";
        }
        let currentWindow = chrome.app.window.get(note.id);
        if(currentWindow){
          console.log('SHOW');
          currentWindow.show();
          resolve();
        }else{
          console.log('MAKE');
          chrome.app.window.create('/note/note.html',{
            id:note.id,
            frame:'none'
          },(createdWindow)=>{
            createdWindow.contentWindow.note = note;
            chrome.app.window.get(note.id).onClosed.addListener(function chromeAppWindowOnClosed(){
  						syncAll();
  					})
            resolve();
          });
        }
      }catch(e){
        reject(e);
      }
    })
    return promise;
  }
  static launchNotes(notes){
    if(!notes){
      return false;
    }
    let allremoved = true;
    for(let note of notes){
      if(!Note.isRemoved(note)){
        allremoved = false;
      }
      // if(note.removed){
      //   notes.splice(notes.indexOf(note),1);
      // }
    }
    if(!notes || notes.length === 0 || allremoved){
      return false;
    }
    for(let note of notes){
      if(!Note.isRemoved(note)){
        this.openNote(note)
      }
    }
    return true;
  }
  static launchNotesNewIfEmpty(notes){
    if(this.launchNotes(notes) === false){
      this.openNewNote();
    }
    return true;
  }
  static updateDisplayedNotes(){

  }
  static updateDisplayedNote(){

  }
}
