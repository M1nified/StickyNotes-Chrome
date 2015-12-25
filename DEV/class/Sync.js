'use strict';
var Sync = {
  synchronize : function(notes=null){//this one is delayed to prevent spam
    clearTimeout(this.synctimeout);
    this.synctimeout = setTimeout(()=>{
      this.synchronizeNow(notes)
    },10000)
  },
  synchronizeNow : function(notes=null){
    clearTimeout(this.synctimeout);
    this.findTheWay().then((syncclass)=>{
      syncclass.synchronize(notes);
    })
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
    for(let noteonline of this.online){//wstawianie aktualnych w online
      // console.log(noteonline);
      let id = noteonline.id;
      // noteonline = JSON.parse(noteonline);
      noteonline.last_update = parseInt(noteonline.last_update);
      if(!Boolean(noteonline.removed) && (!this.offline[id] || this.offline[id].date < noteonline.date || this.offline[id].date < noteonline.last_update)){
        notes[id]=noteonline;
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
    super.synchronize(_notes).then(()=>{
      // console.log(this.offline);
      SyncFileSystem.requestFileSystem()
      .then(SyncFileSystem.getFileEntries)
      .then(SyncFileSystem.getNotesFromEntries)
      .then((notes)=>{
        this.online = notes || [];
        this.cmp();
        console.log(this.final);
        IndexedDB.putNotes(this.final)
        SyncFileSystem.putNotes(this.final)
      })
    })
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
