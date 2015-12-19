'use strict';
//Sticky Notes - application runner
// import IndexedDB from '../class/IndexedDB.js'
var GLOBALS = {
	pwj_sync : false,
	pwj_pair_code : null
}
// class Chrome{
// 	static get Storage(){
// 		return{
// 			test(){
// 				console.log('test');
// 			}
// 		}
// 	}
// }
// Chrome.Storage.test();
class StickyNotes{
	constructor(){
		chrome.app.runtime.onLaunched.addListener(function onLaunched(){
			this.background = new App();
		}.bind(this));
		BackgroundListeners.run();
		Store.run();
	}
}
// StickyNotes.STORE = null;
class App{
	constructor(){
		console.log('LAUNCH');
		this.initLaunching();
	}
	initLaunching(){
		chrome.storage.sync.get(['pwj_sync','pwj_pair_code'],function initLaunching2(data){
			if(data && data.pwj_sync && data.pwj_pair_code){
				GLOBALS.pwj_sync = data.pwj_sync;
				GLOBALS.pwj_pair_code = data.pwj_pair_code;
			}else{
				GLOBALS.pwj_sync = false;
				GLOBALS.pwj_pair_code = null;
			}
			this.continueLaunching();
		}.bind(this))
	}
	continueLaunching(){
		IndexedDB.getNotes().then((notes)=>{
			console.log(notes);
			this.notes = notes;
			this.properLaunching();
			Sync.synchronize(notes);
		})
	}
	properLaunching(){
		chrome.storage.sync.get("allLaunch",function(data){
			if(data && data.allLaunch){
				Notes.launchNotes(this.notes);
			}else{
				chrome.app.window.create('noteslauncher/noteslauncher.html',{id:"notes_launcher",innerBounds:{width:430,height:540},frame:{color:"#8C8C8C"}},function(createdWindow){
					createdWindow.contentWindow.notes = this.notes;
				}.bind(this))
			}
		}.bind(this))
	}
}
class BackgroundListeners{
	static run(){
		console.log('LISTENERS');
		chrome.runtime.onMessage.addListener(this.runtimeOnMessage)

	}
	static runtimeOnMessage(msg,sender,sendResponse){
		switch(msg.func){
			case "openNewNote":
			Notes.openNewNote(msg.presetcolor,msg.presetfont);
			break;
			case "syncAll":
			Sync.synchronizeNow();
			break;
			case "syncAllDelayed":
			Sync.synchronize();
			break;
			case "toClipboard":
			toClipboard(msg.val,sendResponse);
			break;
		}
	}
}
var stickynotes = new StickyNotes();
// var stickynotes = new StickyNotes();
