'use strict';
var Sync = {
  synchronize : function(notes=null){//this one is delayed to prevent spam
    clearTimeout(this.synctimeout);
    this.synctimeout = setTimeout(()=>{
      this.synchronizeNow(notes)
    },10000)
  },
  synchronizeNow : function(notes=null){
    let promise = new Promise((resolve,reject)=>{
      clearTimeout(this.synctimeout);
      this.findTheWay().then((syncclass)=>{
        console.log('after the way');
        syncclass.synchronize(notes).then(()=>{
          resolve();
        })
      })
    })
    return promise;
  },
  syncLoop : function(timeout=10000){
    console.log('timeout:',timeout);
    this.syncLoopIsGoing = true;
    clearTimeout(this.syncLoopTimeout);
    this.syncLoopTimeout = setTimeout(()=>{
      console.log('before synchronizeNow');
      this.synchronizeNow().then(()=>{
        console.log('after synchronizeNow');
        this.syncLoop(timeout);
      })
    },timeout)
  },
  syncLoopStop : function(){
    this.syncLoopIsGoing = false;
    clearTimeout(this.syncLoopTimeout);
  },
  findTheWay : function(loop = false){
    let promise = new Promise((resolve,reject)=>{
      if(this.pwj_sync === true){
        resolve(SyncViaProWebJect);
      }else if(this.pwj_sync === false){
        resolve(SyncViaGoogleDrive)
      }else if(loop===false){
        this.updateTheWay().then(()=>{
          resolve(this.findTheWay(true));
        })
        // chrome.storage.sync.get(["pwj_sync","pwj_pair_code"],(data)=>{
        //   if(data && data.pwj_sync && data.pwj_pair_code){
        //     this.pwj_sync = data.pwj_sync;
      	// 		this.pwj_pair_code = data.pwj_pair_code;
      	// 	}else{
      	// 		this.pwj_sync = false;
      	// 		this.pwj_pair_code = null;
      	// 	}
        //   resolve(this.findTheWay(true));
        // })
      }else{
        reject();
      }
    })
    return promise;
  },
  updateTheWay : function(way=null){
    let promise = new Promise((resolve,reject)=>{
      if(!way){
        chrome.storage.sync.get(["pwj_sync","pwj_pair_code"],(data)=>{
          if(data && data.pwj_sync && data.pwj_pair_code){
            this.pwj_sync = data.pwj_sync;
      			this.pwj_pair_code = data.pwj_pair_code;
      		}else{
      			this.pwj_sync = false;
      			this.pwj_pair_code = null;
      		}
          resolve(true);
        })
      }else{
        // if(way === 'pwj'){
        //   this.pwj_sync =
        // }
        reject();
      }
    })
    return promise;
  }
}
class SyncMethod{
  static synchronize(_notes){
    console.log('SYNCHRONIZE as ',this.name);
    let promise = new Promise((resolve,reject)=>{
      if(!_notes){
        IndexedDB.getNotes().then((n)=>{
          this.offline = n;
          console.log('OFFLINE:',this.offline);
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
    console.log(this);
    console.log('ONLINE',this.online);
    console.log('OFFLINE',this.offline);
    // let notesoffline = {};
    // for(let off of this.offline){
    //   notesoffline[off.id] = off;
    // }
    var notes = {};
    this.updated = [];
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
        console.log(`ON | OFF : ${noteonline.date} | ${offlinemap[id].date}`)
      }catch(e){
        console.error('CMP LOG ERROR');
      }
      console.log('ON:',noteonline);
      console.log('OFF:',offlinemap[id]);
      if(!Boolean(noteonline.removed) && (!offlinemap[id] || offlinemap[id].date < noteonline.date /*|| offlinemap[id].date < noteonline.last_update*/)){
        notes[id]=noteonline;
        this.updated.push(id);
      }
    }
    for(let off of this.offline){//wstawianie pozostalych offline
      let id = off.id;
      if(!notes[id] /*&& Boolean(off.removed)!==true*/){
        notes[id]=off;
      }
    }
    this.final = notes;
  }
  static notifyUpdates(){
    if(this.final && Object.keys(this.final).length>0){
      let launcher = chrome.app.window.get("notes_launcher");
      if(launcher){
        console.log('LAUNCHER WINDOW',launcher);
        launcher.contentWindow.updateNotes();
      }
    }
    if(this.updated && this.updated.length>1){
      Notifications.simpleInfo(`${this.updated.length} notes were updated`);
    }
  }
}
class SyncViaProWebJect extends SyncMethod{
  static synchronize(_notes){
    let promise = new Promise((resolve,reject)=>{
      super.synchronize(_notes).then(()=>{
        this.getOnline().then(()=>{
          this.cmp();
          IndexedDB.putNotes(this.final);
          this.sendOnline();
          this.notifyUpdates();
          resolve();//not really good, cos still not sure if quest has ended
        })
      })
    })
    return promise;
  }
  static getOnline(){
    var promise = new Promise((resolve,reject)=>{
      $.ajax({
    		url:'http://prowebject.com/stickynotes/web/panel/backend/getNotes.php',
    		dataType:'json',
    		method:'post',
    		data:{pair_code:Sync.pwj_pair_code}
    	}).done((data)=>{
        this.online = [];
        for(let note of data){
          let obj;
          try {
            obj = JSON.parse(note.note_object);
            this.online.push(obj);
          } catch (e) {
            obj = null;
          }
        }
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
    		IndexedDB.clearRemovedNotes();
    		//notes were saved
    	})
    });
    return promise;
  }
  // static cmp(){
  //   super.cmp();
  // }
}
class SyncViaGoogleDrive extends SyncMethod{
  static synchronize(_notes){
    let promise = new Promise((resolve,reject)=>{
      super.synchronize(_notes).then(()=>{
        // console.log(this.offline);
        SyncFileSystem.requestFileSystem()
        .then(SyncFileSystem.getFileEntries)
        .then(SyncFileSystem.getNotesFromEntries)
        .then((notes)=>{
          this.online = notes || [];
          this.cmp();
          console.log('FINAL NOTES:',this.final);
          IndexedDB.putNotes(this.final)
          SyncFileSystem.putNotes(this.final)
          this.notifyUpdates();
          resolve();//not really good, cos still not sure if quest has ended
        })
      })
    })
    return promise;
  }
  static listenForChanges(){
    if(this.listening){
      return;
    }
    this.listening = true;
    chrome.syncFileSystem.onFileStatusChanged.addListener(function(details){
    	this.onFileStatusChanged(details);
    }.bind(this))
  }
  static onFileStatusChanged(details){
    if(/note_(\w|_)+/.test(details.fileEntry.name) && details.direction === "remote_to_local"){
  		updateFileSingle(details.fileEntry);
  	}
  }
}
