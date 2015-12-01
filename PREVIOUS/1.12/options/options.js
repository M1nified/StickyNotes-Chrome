$(document).ready(function(){
	displayNotifications1();
	setCheckboxListeners();
	loadNotesManager();
	loadServiceMenu();
})
var displayNotifications1 = function(){
	chrome.storage.sync.get("notifications1",function(data){
		if(data && data.notifications1){
			$("#notifications1").attr("checked",data.notifications1);
		}else{
			$("#notifications1").attr("checked",true);
			chrome.storage.sync.set({notifications1:true});
		}
	})
}
var setCheckboxListeners = function(){
	$("input[type=checkbox]").on("change",function(){
		var data = {};
		data[$(this).attr('id')] = this.checked;
		chrome.storage.sync.set(data);
	})
}
var loadNotesManager = function(){
	$(".localNotes tbody").empty().append("<li>Loading...</li>");
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
			$(".localNotes tbody").empty();
			for(i in items){
				var noterow = "<td>"+items[i].id+"</td><td>"+items[i].textarea.replace(/<(?:.|\n)*?>/gm, ' ').replace(/\s+/g, " ").slice(0,40)+"</td><td>"+toTimeStamp(items[i].date)+"</td>";
				$(".localNotes tbody").append("<tr>"+ noterow +"</tr>");
			}
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
}
var loadServiceMenu = function(){
	$("button.memoryFullReset").on("click",memoryFullReset);
	$("button.memoryIndexedDBClear").on("click",memoryIndexedDBClear);
	$("button.memoryChromeLocalStorageClear").on("click",memoryChromeLocalStorageClear);
	$("button.memoryChromeSyncStorageClear").on("click",memoryChromeSyncStorageClear);
	//$("button.memoryGoogleDriveClear").on("click",memoryGoogleDriveClear);
}
var memoryFullReset = function(){
	memoryIndexedDBClear();
	//memoryGoogleDriveClear();
	memoryChromeSyncStorageClear();
	memoryChromeLocalStorageClear();
}
var memoryIndexedDBClear = function(){
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
				store.delete(items[i].id);
			}
		};
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}
var memoryChromeLocalStorageClear = function(){
	chrome.storage.local.clear(function(){

	})
}
var memoryChromeSyncStorageClear = function(){
	chrome.storage.sync.clear(function(){

	})
}
/*var memoryGoogleDriveClear = function(){
	chrome.syncFileSystem.requestFileSystem(function(fs){
		var dirReader = fs.root.createReader();
		var fileEntries = [];
		var readEntries = function(){
			dirReader.readEntries(function(results){
				if(!results.length){
					fileEntries.forEach(function(fileEntry,i){
						fileEntry.remove(function(){

						});
					});
				}else{
					useFileEntries(results.sort(),notesoffline);
					fileEntries.concat(toArray(results));
					readEntries();
				}
			},function(e){console.log(e);});
		};
		readEntries();
	})
}*/