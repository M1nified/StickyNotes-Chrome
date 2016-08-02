notesofflinemain = null;
launched = true;
options = {notifications1:true};
chrome.storage.sync.get(options,function(data){
	if(data){
		options = data;
	}
})
chrome.storage.onChanged.addListener(function(changes,areaName){
	if(areaName == "sync"){
		var keys = Object.keys(changes);
		for(i in keys){
			if(options[keys[i]] !== undefined){
				options[keys[i]] = changes[keys[i]].newValue;
			}
		}
	}
})
chrome.app.runtime.onLaunched.addListener(function() {
	console.log("LAUNCH!")
	launched = false;
	chrome.storage.sync.get({id_owner:null},function(data){
		id_owner = data.id_owner;
		if(id_owner === null){
			id_owner = parseInt(Math.random().toString().slice(2));
			chrome.storage.sync.set({id_owner:id_owner});
		}
	})
	var openRequest = indexedDB.open("notes");
	openRequest.onupgradeneeded = function(e) {
		var db = openRequest.result;
		var store = db.createObjectStore("notes", {keyPath: "id"});
		var idIndex = store.createIndex("by_id", "id", {unique: true});
	}
	openRequest.onsuccess = function(e) {
		console.log("Success!");
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");

		var items = [];

		tx.oncomplete = function(evt) {  
			console.log(items)
			//console.log(items.length)
			clearRemovedFromIndexedDB();
			synchronizeWithSyncFileSystem(items);
			launchNotes(items);
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
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}	
});
var openNewNote = function(presetcolor,presetfont){
	chrome.app.window.create('/background/note.html',{id:Math.random().toString().slice(2),frame:'none',bounds:{width:250,height:240},resizable:true},function(createdWindow){
		createdWindow.contentWindow.note = null;
		createdWindow.contentWindow.presetcolor = presetcolor || null;
		createdWindow.contentWindow.presetfont = presetfont || null;
		chrome.app.window.get(createdWindow.id).onClosed.addListener(function(){
			syncAll();
		})
	})
}
var launchNotes = function(notes){
	notes = $.grep(notes,function(n,i){if(n.removed!==true){return true;}})
	console.log(notes)
	if(notes == null || notes.length == 0){
		openNewNote();
	}else{
		for(var i in notes){
			var note = notes[i];
			if(note.removed === true){
				continue;
			}
			(function(note){
				chrome.app.window.create('background/note.html',{id:note.id,frame:'none'},function(createdWindow){
					createdWindow.contentWindow.note = note;
					chrome.app.window.get(note.id).onClosed.addListener(function(){
						syncAll();
					})
				})
			})(note);
		}
	}
}
var updateDisplayedNotes = function(){
	var windows = chrome.app.window.getAll();
	for(i in windows){
		windows[i].contentWindow.updateNote();
	}
}
var updateDisplayedNote = function(note){
	if(!note || note.id===undefined){
		return false;
	}
	var windo = chrome.app.window.get(note.id);
	if(windo){
		try{
			windo.contentWindow.updateNote();
		}catch(e){
			errorHandler(e);
		}
	}else{
		//launchNotes([note]);
	}
}

var syncAllDelayedTimeouted = null;
var syncAll = function(){
	clearTimeout(syncAllDelayedTimeouted);
	var oreq = indexedDB.open("notes");
	oreq.onupgradeneeded = function(e) {
		var db = oreq.result;
		var store = db.createObjectStore("notes", {keyPath: "id"});
		var idIndex = store.createIndex("by_id", "id", {unique: true});
	}
	oreq.onsuccess = function(e) {
		console.log("Success!");
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");

		var items = [];

		tx.oncomplete = function(evt) {
			synchronizeWithSyncFileSystem(items);
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
	}
	oreq.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}
var syncAllDelayed = function(){
	clearTimeout(syncAllDelayedTimeouted);
	syncAllDelayedTimeouted = setTimeout(syncAll,10000);
}

var synchronizeWithSyncFileSystem = function(notesoffline){
	var notes = [];
	notesofflinemain = notesoffline;
	//console.log(notesoffline)
	//console.log(Object.keys(notesoffline))
	//console.log(notesoffline[0])
	for(i in notesoffline){
		//console.log(notesoffline[i]);
		//notes[i] = notesoffline[i];
		notes.push(notesoffline[i])
	}
	chrome.syncFileSystem.requestFileSystem(function(fs){requestFileSystemCallback(fs,notes)});
}
var requestFileSystemCallback = function(fs,notesoffline){
	var dirReader = fs.root.createReader();
	var fileEntries = [];
	var readEntries = function(){
		dirReader.readEntries(function(results){
			if(!results.length){
				useFileEntries(fileEntries.sort(),notesoffline);
			}else{
				useFileEntries(results.sort(),notesoffline);
				fileEntries.concat(toArray(results));
				readEntries();
			}
		},function(e){console.log(e);});
	};
	readEntries();
}
var useFileEntries = function(fileEntries,notesoffline){
	//console.log(fileEntries)
	fileEntries.forEach(function(fileEntry,i){
		//console.log(fileEntry);
		updateFile(fileEntry,notesoffline);
	})
	uploadNewNotes(fileEntries,notesoffline);
}
var uploadNewNotes = function(fileEntries,notesoffline){
	for(i in notesoffline){
		var id = notesoffline[i].id;
		var matches = $.grep(fileEntries,function(n,i){if(n.name == "note_"+id)return true;});
		if(matches.length == 0){
			(function(note){
				chrome.syncFileSystem.requestFileSystem(function(fs){
					fs.root.getFile("note_"+note.id,{create:true},function(fileEntry){
						writeToFile(fileEntry,note);
					},errorHandler);
				});
			})(notesoffline[i]);
		}
	}
}
var updateFileSingle = function(fileEntry){
	fileEntry.file(function(file){
		var reader = new FileReader();
		reader.onloadend = function(){
			var note = {};
			try{
				note = JSON.parse(this.result);
			}catch(e){
				errorHandler(e);
			}
			if(note && note.removed){
				fileEntry.remove(function(){console.log("REMOVED")},errorHandler);
				return false;
			}
			if(note){
				var openRequest = indexedDB.open("notes");
				openRequest.onsuccess = function(e) {
					db = e.target.result;
					var tx=db.transaction("notes","readwrite");
					var store = tx.objectStore("notes");
					var index = store.index("by_id");
					var request = index.get(note.id);
					request.onsuccess = function(){
						if(!request.result){
							saveNotesToIndexedDB([note]);
							if(options.notifications1){notifyNewNote(note);}
						}else{
							var newnote = synchronizeVersions([request.result],note);
							saveNotesToIndexedDB([newnote]);
							if(!isNotesContentSame(note,newnote)){
								writeToFile(newnote);
							}else{
								updateDisplayedNote(newnote);
								if(options.notifications1){notifyUpdatedNote(newnote);}
							}
						}
					}
				}
			}
		}
		reader.readAsText(file);
	})
}
var updateFile = function(fileEntry,notesoffline){
	if(/note_\w+/.test(fileEntry.name)){
		fileEntry.file(function(file){
			var reader = new FileReader();
			reader.onloadend = function(){
				var json;
				try{
					json = JSON.parse(this.result);
				}catch(e){
					json = null;
				}
				if(json !== null){
					var newnote = synchronizeVersions(notesoffline,json);
					if(newnote.removed){
						fileEntry.remove(function(){console.log("REMOVED")},errorHandler);
					}else{
						saveNotesToIndexedDB([newnote]);
						if(!isNotesContentSame(json,newnote)){
							writeToFile(newnote);
						}else{
							updateDisplayedNote(newnote);
						}
					}
				}
				clearRemovedFromIndexedDB();
			}
			reader.readAsText(file);
		})
	}
}
var synchronizeVersions = function(notesoffline,noteonline){
	var noteoffline = $.grep(notesoffline,function(n,i){if(n.id===noteonline.id)return true;});
	var newnote = {};
	if(noteoffline.length == 1){
		if(noteoffline[0].date < noteonline.date){
			newnote = noteonline;
		}else{
			newnote = noteoffline[0];
		}
	}else{
		newnote = noteonline;
	}
	return newnote;
}
var writeToFile = function(fileEntry,note){
	fileEntry.createWriter(function(fileWriter) {
		var truncated = false;
		fileWriter.onwriteend = function(e) {
			if(!truncated){
				this.truncate(this.position);
				truncated = true;
			}
		};
		fileWriter.onerror = function(e) {
			console.log('Write failed: ' + e.toString());
		};
		//console.log(JSON.stringify(notes))
		var blob = new Blob([JSON.stringify(note)], {type: 'text/plain'});
			//fileWriter.seek(0);
			fileWriter.write(blob);
		}, function(error){
			console.log(error.toString())
		});
}
var clearRemovedFromIndexedDB = function(){
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function(e) {
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		var items = [];
		tx.oncomplete = function(evt) {  
			//console.log(items);
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
			for(i in items){
				if(items[i].removed === true){
					store.delete(items[i].id);
				}
			}
		};
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}
var saveNotesToIndexedDB = function(notes){ 
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function(e) {
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		for(var i in notes){
			var note = notes[i];
			if(note.removed === true){
				store.delete(note.id);
			}else{
				store.put(note);
			}
		}
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}

chrome.syncFileSystem.onFileStatusChanged.addListener(function(details){
	onFileStatusChanged(details);
})
var onFileStatusChanged = function(details){
	if(/note_\w+/.test(details.fileEntry.name) && details.direction === "remote_to_local"){
		updateFileSingle(details.fileEntry);
	}
}

chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
	switch(msg.func){
		case "openNewNote":
		openNewNote(msg.presetcolor,msg.presetfont);
		break;
		case "syncAll":
		syncAll();
		break;
		case "syncAllDelayed":
		syncAllDelayed();
		break;
	}
})