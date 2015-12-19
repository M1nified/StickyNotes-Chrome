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
  static launchNotes(notes){
    if(!notes){
      this.openNewNote();
      return;
    }
    for(let note of notes){
      if(note.removed){
        notes.splice(notes.indexOf(note),1);
      }
    }
    if(!notes || notes.length === 0){
      this.openNewNote();
      return;
    }
    for(let note of notes){
      ((note)=>{
        chrome.app.window.create('/note/note.html',{
          id:note.id,
          frame:'none'
        },function launchNoteCallback(createdWindow){
          createdWindow.contentWindow.note = note;
					chrome.app.window.get(note.id).onClosed.addListener(function(){
						syncAll();
					})
        })
      })(note)
    }
  }
  static updateDisplayedNotes(){

  }
  static updateDisplayedNote(){

  }
}
