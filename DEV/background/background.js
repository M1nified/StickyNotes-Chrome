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
		this.setOnLaunched();
		this.listeners = new BackgroundListeners();
		Store.run();
	}
	setOnLaunched(){
		chrome.app.runtime.onLaunched.addListener(function onLaunched(){
			this.background = new App();
		}.bind(this));
	}
}
StickyNotes.STORE = null;
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
				chrome.app.window.create('background/noteslauncher.html',{id:"notes_launcher",innerBounds:{width:430,height:540},frame:{color:"#8C8C8C"}},function(createdWindow){
					createdWindow.contentWindow.notes = this.notes;
				}.bind(this))
			}
		}.bind(this))
	}
}
class BackgroundListeners{
	constructor(){
		console.log('LISTENERS');
	}
}
var stickynotes = new StickyNotes();
var stickynotes = new StickyNotes();
