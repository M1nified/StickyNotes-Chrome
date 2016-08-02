notesofflinemain = null;
launched = true;
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
			console.log(items.length)
			synchronizeWithSyncFileSystem(items);
		};
		var cursorRequest = store.openCursor();
		cursorRequest.onerror = function(error) {
			console.log(error);
		};
		cursorRequest.onsuccess = function(evt) {                    
			var cursor = evt.target.result;
			if (cursor) {
				console.log(cursor.value)
				items.push(cursor.value);
				console.log(items.length)
				cursor.continue();
			}
		};
		/*var request = index.get("*");
		request.onsuccess = function(){
			console.log(request)
		}*/
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
	console.log(notes)
	if(notes == null || notes.length == 0){
		openNewNote();
	}else{
		for(var i in notes){
			var note = notes[i];
			if(note.removed === true){
				continue;
			}
			/*bounds = {};
			if(note.left<screen.width-50){
				bounds.left = note.left;
			}
			if(note.top<screen.height-50){
				bounds.top = note.top;
			}
			bounds.width = note.width;
			bounds.height = note.height;*/
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
			console.log(items)
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
		/*var request = index.get("*");
		request.onsuccess = function(){
			console.log(request)
		}*/
	}
	oreq.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}
var syncAllDelayed = function(){
	clearTimeout(syncAllDelayedTimeouted);
	syncAllDelayedTimeouted = setTimeout(syncAll,30000);
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
	chrome.syncFileSystem.requestFileSystem(function(fs){requestFileSystemCallback(fs,notes)})
}
var requestFileSystemCallback = function(fs,notesoffline){
	//console.log(notesoffline)
	//console.log(Object.keys(notesoffline));
	fs.root.getFile("StickyNotes_by_ProWebJect.txt",{create:true},function(fileEntry){getFileCallback(fileEntry,notesoffline)});
}
var getFileCallback = function(fileEntry,notesoffline){
	//console.log("fileEntry")
	chrome.syncFileSystem.getFileStatus(fileEntry,function(status){
		console.log(status)
	})
	fileEntry.file(function(file){
		//console.log("file")
		var reader = new FileReader();
		reader.onloadend = function(){
			//console.log(this.result);
			//console.log(JSON.stringify(['apple']))
			var json;
			try{
				json = JSON.parse(this.result);
			}catch(e){
				json = [];
			}
			//console.log(json);
			var newnotes = synchronizeVersions(notesoffline,json);
			//console.log(newnotes)
			if(launched === false){
				launchNotes(newnotes);
				launched = true;
			}
			saveNotesToIndexedDB(newnotes);
			writeToFile(fileEntry,newnotes);
			clearRemovedFromIndexedDB();
		}
		reader.readAsText(file);
	})
}
var writeToFile = function(fileEntry,notes){
	fileEntry.createWriter(function(fileWriter) {
		truncated = false;
		fileWriter.onwriteend = function(e) {
			console.log('Write completed.');
			if(!truncated){
				this.truncate(this.position);
				//console.log("CUT")
				truncated = true;
			}
		};
		fileWriter.onerror = function(e) {
			console.log('Write failed: ' + e.toString());
		};
		//console.log(JSON.stringify(notes))
		var blob = new Blob([JSON.stringify(notes)], {type: 'text/plain'});
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
			console.log(items);
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
var synchronizeVersions = function(offline,online){

	console.log("offline");
	console.log(offline);
	console.log("online");
	console.log(online);
	var notes = offline;
	//var notes = $.grep(offline,function(n,i){if(n.removed !== true){return true}});
	for(i in online){
		//if(online[i].removed === true)continue;
		var index = null;
		var noteoffline = $.grep(notes,function(n,j){if(n.id === online[i].id){index = j; return true;} return false;});
		//console.log(noteoffline[0]);
		if(noteoffline && noteoffline.length==1 && noteoffline[0].removed === true){
			console.log("REM")
			notes.splice(index,1);
		}else if(online[i].removed === true){
			
		}else if(noteoffline && noteoffline.length==1 && noteoffline[0].date < online[i].date){
			notes[index] = online[i];
		}else if(!noteoffline || noteoffline.length!=1){
			notes.push(online[i]);
		}
	}
	notes = $.grep(notes,function(n,i){if(n.removed !== true){return true}});
	console.log("OUTPUT")
	console.log(notes)
	return notes;
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
	console.log(details)
	onFileStatusChanged(details);
})
var onFileStatusChanged = function(details){
	if(details.fileEntry.name === "StickyNotes_by_ProWebJect.txt"){
		syncAll();
		setTimeout(updateDisplayedNotes,1000);
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