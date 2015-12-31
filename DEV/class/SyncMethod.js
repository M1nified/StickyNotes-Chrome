class SyncMethod{
  static synchronize(_notes){
    // console.log('SYNCHRONIZE as ',this.name);
    let promise = new Promise((resolve,reject)=>{
      if(!_notes){
        IndexedDB.getNotes().then((n)=>{
          this.offline = n;
          // console.log('OFFLINE:',this.offline);
          resolve();
        })
      }else{
        this.offline = _notes;
        resolve();
      }
    })
    return promise;
  }
  static cmp(){//cmp this.online with this.offline and store final version as this.final
    // console.log(this);
    // console.log('ONLINE',this.online);
    // console.log('OFFLINE',this.offline);
    // let notesoffline = {};
    // for(let off of this.offline){
    //   notesoffline[off.id] = off;
    // }
    var notes = {};
    this.updated = [];
    this.removed = [];
    let offlinemap = (function(notesarray){
      let obj = {};
      for(let note of notesarray){
        obj[note.id] = note;
      }
      return obj;
    })(this.offline);
    for(let noteonline of this.online){//wstawianie aktualnych w online
      // console.log(noteonline);
      let id = noteonline.id;
      // noteonline = JSON.parse(noteonline);
      noteonline.last_update = parseInt(noteonline.last_update);
      try{
        // console.log(`ON | OFF : ${noteonline.date} | ${offlinemap[id].date}`)
      }catch(e){
        // console.error('CMP LOG ERROR');
      }
      // console.log('ON:',noteonline);
      // console.log('OFF:',offlinemap[id]);
      if(/*!Boolean(noteonline.removed) && */(!offlinemap[id] || offlinemap[id].date < noteonline.date /*|| offlinemap[id].date < noteonline.last_update*/)){
        notes[id]=noteonline;
        if(Note.isRemoved(noteonline)){
          this.removed.push(id);
        }else{
          this.updated.push(id);
        }
      }
    }
    for(let off of this.offline){//wstawianie pozostalych offline
      let id = off.id;
      if(!notes[id] /*&& Boolean(off.removed)!==true*/){
        notes[id]=off;
      }
    }
    // console.log('ONLINE:',this.online);
    // console.log('OFFLINE:',this.offline);
    this.final = notes;
  }
  static notifyUpdates(){
    if(this.final && Object.keys(this.final).length>0){
      let launcher = chrome.app.window.get("notes_launcher");
      if(launcher){
        // console.log('LAUNCHER WINDOW',launcher);
        try{
          launcher.contentWindow.updateNotes();
        }catch(err){
          console.log('Launcher has not been loaded yet.',err);
        }
      }
    }
    if(this.updated && this.updated.length>1){
      Notifications.notifyAboutUpdatedNotes(this.updated);
    }else if(this.updated && this.updated.length===1){
      Notifications.notifyAboutUpdatedNotes(this.updated[0]);
    }
    if(this.removed && this.removed.length>1){
      Notifications.notifyAboutRemovedNotes(this.updated);
    }else if(this.removed && this.removed.length===1){
      Notifications.notifyAboutRemovedNotes(this.updated[0]);
    }
  }
}
