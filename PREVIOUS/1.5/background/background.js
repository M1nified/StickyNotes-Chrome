chrome.app.runtime.onLaunched.addListener(function() {
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
			synchronizeWithChromeStorageCloud(items,true);
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
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}	
});
var openNewNote = function(presetcolor,presetfont){
	chrome.app.window.create('/background/note.html',{id:Math.random().toString().slice(2),frame:'none',bounds:{width:250,height:240}},function(createdWindow){
		createdWindow.contentWindow.note = null;
		createdWindow.contentWindow.presetcolor = presetcolor || null;
		createdWindow.contentWindow.presetfont = presetfont || null;
		chrome.app.window.get(createdWindow.id).onClosed.addListener(function(){
			syncAll();
		})
	})
}
var launchNotes = function(notes){
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

var synchronizeWithChromeStorageCloud = function(notesoffline,launch){
	var newnotesset = [];
	var notesofflinecopy = notesoffline;
	var saveNotes = function(notes){ 
		var openRequest = indexedDB.open("notes");
		openRequest.onsuccess = function(e) {
			db = e.target.result;
			var tx=db.transaction("notes","readwrite");
			var store = tx.objectStore("notes");
			var index = store.index("by_id");
			for(var i in notes){
				var note = notes[i];
				store.put(note);
			}
		}
		openRequest.onerror = function(e) {
			console.log("Error");
			console.dir(e);
		}
	}
	chrome.storage.sync.get({notes:null},function(data){
		if(data.notes == null || data.notes.length == 0){
			launchNotes(notesoffline);
			chrome.storage.sync.set({notes:notesoffline});
		}else{
			var notesonline = data.notes;
			for(var i in notesonline){
				if(notesonline[i].removed === true){
					continue;
				}
				var id = notesonline[i].id;
				var indextoremove = null;
				var notesofflinematch = $.grep(notesofflinecopy,function(n,index){
					if(n.id === id){indextoremove = index;}
					return n.id === id;
				});
				if(notesofflinematch.length > 0){
					if(notesofflinematch[0].date > notesonline[i].date){
						newnotesset[newnotesset.length]=notesofflinematch[0];
					}else{
						newnotesset[newnotesset.length]=notesonline[i];
					}
					notesofflinecopy.splice(indextoremove,1);
				}else{
					newnotesset[newnotesset.length]=notesonline[i];
				}
			}
			newnotesset = newnotesset.concat(notesofflinecopy);
			chrome.storage.sync.set({notes:newnotesset});
			saveNotes(newnotesset);
			if(launch){
				launchNotes(newnotesset);
			}
		}
	})
}
var synchronizeWithStickyNotesDB = function(){

}
var syncAll = function(){
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
			synchronizeWithChromeStorageCloud(items,false);
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
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
	switch(msg.func){
		case "openNewNote":
		openNewNote(msg.presetcolor,msg.presetfont);
		break;
		case "syncAll":
		syncAll();
		break;
	}
})
/*chrome.storage.sync.get({notes:null},function(data){
		console.log(typeof data.notes)
		if(data.notes == null || data.notes.length == 0){
			chrome.app.window.create('background/note.html',{frame:'none',bounds:{width:250,height:240}},function(createdWindow){
				createdWindow.contentWindow.note = null;
			})
		}else{
			var notes = data.notes;
			for(var i in notes){
				var note = notes[i];
				chrome.app.window.create('background/note.html',{frame:'none'},function(createdWindow){
					createdWindow.contentWindow.note = note;
				})
			}
		}
	})
	*/