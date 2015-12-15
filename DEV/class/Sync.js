'use strict';
class Sync {
  static synchronize(notes=null){
    clearTimeout(this.synctimeout);
    this.synctimeout = setTimeout(()=>{
      this.synchronizeNow(notes)
    },0)
  }
  static synchronizeNow(notes=null){
    clearTimeout(this.synctimeout);
    this.findTheWay().then((syncclass)=>{
      syncclass.synchronize(notes);
    })
  }
  static findTheWay(loop = false){
    let promise = new Promise((resolve,reject)=>{
      if(this.pwj_sync === true){
        resolve(SyncViaProWebJect);
      }else if(this.pwj_sync === false){
        resolve(SyncViaGoogleDrive)
      }else if(loop===false){
        chrome.storage.sync.get(["pwj_sync","pwj_pair_code"],(data)=>{
          if(data && data.pwj_sync && data.pwj_pair_code){
            this.pwj_sync = data.pwj_sync;
      			this.pwj_pair_code = data.pwj_pair_code;
      		}else{
      			this.pwj_sync = false;
      			this.pwj_pair_code = null;
      		}
          resolve(this.findTheWay(true));
        })
      }else{
        reject();
      }
    })
    return promise;
  }
}
class SyncMethod{
  static synchronize(_notes){
    console.log(this.name);
    let promise = new Promise((resolve,reject)=>{
      this.offline = _notes;
      if(!_notes){
        IndexedDB.getNotes().then((n)=>{
          this.offline = n;
          resolve();
        })
      }else{
        resolve();
      }
    })
    return promise;
  }
  static cmp(){
    console.log(this);
    console.log('ONLINE',this.online);
    console.log('OFFLINE',this.offline);
    // let notesoffline = {};
    // for(let off of this.offline){
    //   notesoffline[off.id] = off;
    // }
    var notes = {};
    for(let on of this.online){//wstawianie aktualnych w online
      let id = on.note_object.id;
      on.note_object = JSON.parse(on.note_object);
      on.last_update = parseInt(on.last_update);
      if(!Boolean(on.note_object.removed) && (!this.offline[id] || this.offline[id].date < on.note_object.date || this.offline[id].date < on.last_update)){
        notes[id]=on.note_object;
      }
    }
    for(let off of this.offline){//wstawianie pozostalych online
      let id = off.id;
      if(!notes[id] && Boolean(off.removed)!==true){
        notes[id]=off;
      }
    }
    this.final = notes;
  }
}
class SyncViaProWebJect extends SyncMethod{
  static synchronize(_notes){
    super.synchronize(_notes).then(()=>{
      this.getOnline().then(()=>{
        this.cmp();
        IndexedDB.putNotes(this.final);
        this.sendOnline();
      })
    })
  }
  static getOnline(){
    var promise = new Promise((resolve,reject)=>{
      $.ajax({
    		url:'http://prowebject.com/stickynotes/web/panel/backend/getNotes.php',
    		dataType:'json',
    		method:'post',
    		data:{pair_code:Sync.pwj_pair_code}
    	}).done((data)=>{
        this.online = data;
        resolve();
      })
    })
    return promise;
  }
  static sendOnline(){
    var promise = new Promise(()=>{
      let d = {notes:this.final,pair_code:Sync.pwj_pair_code,clear:true};
    	$.ajax({
    		url:'http://prowebject.com/stickynotes/web/panel/backend/putNotes.php',
    		method:'post',
    		dataType:'text',
    		data:d
    	}).done(function(data){
    		console.log(data)
    		IndexedDB.clearRemoved();
    		//notes were saved
    	})
    });
    return promise;
  }
  static cmp(){
    super.cmp();
  }
}
class SyncViaGoogleDrive extends SyncMethod{
  static synchronize(_notes){
    super.synchronize(_notes).then(()=>{
      console.log(this.offline);
    })
  }
}
