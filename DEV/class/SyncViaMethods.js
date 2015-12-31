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
    		data:{pair_code:Sync.pwj_pair_code},
        error:function(err){
          console.error('prowebject.com error',err);
        }
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
      }).fail(function(err){
        console.error('prowebject.com error',err);
        // reject(err);
        resolve();
      })
    })
    return promise;
  }
  static sendOnline(){
    var promise = new Promise((resolve,reject)=>{
      let d = {notes:this.final,pair_code:Sync.pwj_pair_code,clear:true};
    	$.ajax({
    		url:'http://prowebject.com/stickynotes/web/panel/backend/putNotes.php',
    		method:'post',
    		dataType:'text',
    		data:d,
        error:function(err){
          console.error('prowebject.com error',err);
        }
    	}).done(function(data){
    		// console.log(data)
    		// IndexedDB.clearRemovedNotes();
        resolve();
    		//notes were saved
    	}).fail(function(err){
        console.error('prowebject.com error',err);
        // reject(err);
        resolve();
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
          // console.log('FINAL NOTES:',this.final);
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
