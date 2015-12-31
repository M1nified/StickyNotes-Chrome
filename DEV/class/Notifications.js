'use strict';
var Notifications = {
  notifyNewNote : function(note){
  	let opt = {
  		type:"basic",
  		iconUrl:chrome.runtime.getURL("/img/icon_128.png"),
  		title:"New note stored! (" + getTime() + ")",
  		message:"Click app icon to load it. ("+note.textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0,40)+")"
  	}
  	chrome.notifications.create(note.id,opt,function(){});
  },
  notifyUpdatedNote : function(note){
  	let opt = {
  		type:"basic",
  		iconUrl:chrome.runtime.getURL("/img/icon_128.png"),
  		title:"A note has been updated! (" + getTime() + ")",
  		message:"Click app icon to load it. ("+note.textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0,40)+")"
  	}
  	chrome.notifications.create(note.id,opt,function(){});
  },
  //new functions
  idmap : {},//map of ids and roles
  onClicked : function(notificationId){
    let idtranslation = Notifications.idmap[notificationId] || notificationId;
    console.log('CLICK',idtranslation,idtranslation);
    if(/\d+_\d+/.test(idtranslation)){
      // Notes.openNote()
      App.openLauncher();
    }else{
      switch(idtranslation){
        case 'multiple_notes_updated' :
        App.openLauncher();
        break;
      }
    }
  },
  simpleInfo : function(message){
    let opt = {
      type : "basic",
      iconUrl : chrome.runtime.getURL("/img/icon_128.png"),
      title : "Sticky Notes",
      message
    }
    chrome.notifications.create(opt)
  },
  notify : function(options,id=null){
    chrome.notifications.create(id,options,(notificationId)=>{
      this.idmap[notificationId] = id;
    })
  },
  notifyAboutUpdatedNotes : function(notes){//notes - Array of notes or single note
    let notifyAboutSingleNote = () => {
      this.notify({
        type : "basic",
        iconUrl : chrome.runtime.getURL("/img/icon_128.png"),
        title : 'Sticky Notes',
        message : 'One note was updated',
        //contextMessage : 'Click to show',
        isClickable : true
      },notes.id)
    };
    if(notes && Array.isArray(notes)){
      if(notes.length>1){
        this.notify({
          type : "basic",
          iconUrl : chrome.runtime.getURL("/img/icon_128.png"),
          title : 'Sticky Notes',
          message : `${notes.length} notes were updated`,
          //contextMessage : 'Click to open launcher',
          isClickable : true
        },'multiple_notes_updated')
      }else if(notes.length === 1){
        notes = notes[0];
        notifyAboutSingleNote();
      }
    }else if(notes){
      notifyAboutSingleNote();
    }else{
      return false;
    }
  },
  notifyAboutRemovedNotes : function(notes){
    let notifyAboutSingleNote = () => {
      this.notify({
        type : "basic",
        iconUrl : chrome.runtime.getURL("/img/icon_128.png"),
        title : 'Sticky Notes',
        message : 'One note was removed',
        isClickable : false
      },'note_removed')
    };
    if(notes && Array.isArray(notes)){
      if(notes.length>1){
        this.notify({
          type : "basic",
          iconUrl : chrome.runtime.getURL("/img/icon_128.png"),
          title : 'Sticky Notes',
          message : `${notes.length} notes were removed`,
          isClickable : false
        },'note_removed')
      }else if(notes.length === 1){
        notes = notes[0];
        notifyAboutSingleNote();
      }
    }else if(notes){
      notifyAboutSingleNote();
    }else{
      return false;
    }
  }
}
