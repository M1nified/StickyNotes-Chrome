'use strict';
var Sync = {
  synchronize : function(notes=null){//this one is delayed to prevent spam
    clearTimeout(this.synctimeout);
    this.synctimeout = setTimeout(()=>{
      this.synchronizeNow(notes)
    },3000)
  },
  synchronizeNow : function(notes=null){
    let promise = new Promise((resolve,reject)=>{
      clearTimeout(this.synctimeout);
      this.findTheWay().then((syncclass)=>{
        // console.log('after the way');
        syncclass.synchronize(notes).then(()=>{
          resolve();
        }).catch((err)=>{
          log.error(err);
        })
      }).catch((err)=>{
        log.error(err);
      })
    })
    return promise;
  },
  syncLoop : function(timeout=10000){
    // console.log('timeout:',timeout);
    this.syncLoopIsGoing = true;
    clearTimeout(this.syncLoopTimeout);
    this.syncLoopTimeout = setTimeout(()=>{
      // console.log('before synchronizeNow');
      this.synchronizeNow().then(()=>{
        // console.log('after synchronizeNow');
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
