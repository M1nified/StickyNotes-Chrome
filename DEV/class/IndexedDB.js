'use strict';
/*export */class IndexedDB{
	static getNotes(){
		let promise = new Promise(function(resolve,reject){
			let openRequest = indexedDB.open("notes",4);
			openRequest.onupgradeneeded = function(e) {
				console.log("IndexedDB upgrade needed.");
				console.log(e);
				var db = e.target.result;
				db.onerror = function(event) {
					// alert("Database error: " + event.target.errorCode);
					reject(event.taget.errorCode);
				};
				try{
					let store = db.createObjectStore("notes", {keyPath: "id"});
					var idIndex = store.createIndex("by_id", "id", {unique: true});

				}catch(e){
					console.log(e);
					reject(e);
				}
			}
			openRequest.onsuccess = function(e) {
				console.log("Success! (1)");
				//console.log(e)
				var db = this.result;
				db.onerror = function(event) {
					// alert("Database error: " + event.target.errorCode);
					reject(event.target.errorCode);
				};
				var tx = null;
				try{
					tx = db.transaction("notes","readwrite");
				}catch(e){
					console.log(e)
					return false;
				}
				var store = tx.objectStore("notes");
				var index = store.index("by_id");

				var items = [];

				tx.oncomplete = function(evt) {
					//console.log(items)
					//console.log(items.length)
					resolve(items);

					// clearRemovedFromIndexedDB();
					// if(pwj_sync && pwj_pair_code){//synchronizacja z PWJ
					// 	synchronizeWithPWJ(items);
					// }else{//synchronizacja z Google Drive
					// 	synchronizeWithSyncFileSystem(items);
					// }
					// launchNotes(items);
				};
				var cursorRequest = store.openCursor();
				cursorRequest.onerror = function(error) {
					console.log(error);
					// reject(error);
				};
				cursorRequest.onsuccess = function(evt) {
					var cursor = evt.target.result;
					if (cursor) {
						items.push(cursor.value);
						cursor.continue();
					}
				};
			}
			openRequest.onerror = function(e) {
				console.log("Error");
				console.dir(e);
				reject(e);
			}
		})
		return promise;
	}
  static putNotes(notes){

  }
  static clearRemoved(){
    
  }
}
