'use strict';
var IndexedDB = {
	openRequest : function(){
		let promise = new Promise((resolve,reject)=>{
			let openRequest = indexedDB.open("notes",4);
			openRequest.onupgradeneeded = function(e) {
				console.log("IndexedDB upgrade needed.");
				console.log(e);
				var db = e.target.result;
				db.onerror = function(event) {
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
				resolve(this.result);//resolve(db)
			}
			openRequest.onerror = function(e) {
				console.log("Error");
				console.dir(e);
				reject(e);
			}
		})
		return promise;
	},
	getNotes : function(){
		let promise = new Promise((resolve,reject)=>{
			this.openRequest().then((db)=>{
				db.onerror = function(event) {
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
					resolve(items);
				};
				var cursorRequest = store.openCursor();
				cursorRequest.onerror = function(error) {
					console.log(error);
				};
				cursorRequest.onsuccess = function(evt) {
					var cursor = evt.target.result;
					if (cursor) {
						items.push(cursor.value);
						cursor.continue();
					}
				};
			})
		})
		return promise;
	},
	getNote : function(id){
		let promise = new Promise((resolve,reject)=>{
			this.openRequest().then((db)=>{
				let tx = db.transaction("notes","readonly");
				let store = tx.objectStore("notes");
				let index = store.index("by_id");
				let request = index.get(id);
				request.onsuccess = () => {
					resolve(request.result);
				};
				request.onerror = (e) => {
					reject(e);
				};
			})
		})
		return promise;
	},
	putNotes : function(notes){
		let promise = new Promise((resolve,reject)=>{
			this.openRequest().then((db)=> {
				var tx=db.transaction("notes","readwrite");
				var store = tx.objectStore("notes");
				var index = store.index("by_id");
				let callStack = 0;
				for(let note of notes){
					if(note){
						callStack++;
						try {
							store.put(note).onsuccess = (event)=>{
								callStack--;
								if(callStack === 0){
									resolve();
								}
							};
						} catch (e) {
							console.error(e);
							callStack--;
						}
					}
				}
			});
		})
		return promise;
	},
	clearRemovedNotes : function(){
		var promise = new Promise((resolve,reject)=>{
			this.openRequest().then((db)=>{
				var db = e.target.result;
				var tx=db.transaction("notes","readwrite");
				var store = tx.objectStore("notes");
				var cursorRequest = store.openCursor();
				var items = [];
				cursorRequest.onerror = function(error) {
					console.log(error);
				};
				cursorRequest.onsuccess = function(evt) {
					var cursor = evt.target.result;
					if (cursor) {
						items.push(cursor.value);
						cursor.continue();
					}
					for(let item of items){
						if(Boolean(item.removed) === true){
							store.delete(item.id);
						}
					}
				};
			})
		});
		return promise;
	}
}
