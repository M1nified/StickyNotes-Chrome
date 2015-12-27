'use strict';
//Sticky Notes - application runner
// import IndexedDB from '../class/IndexedDB.js'
var GLOBALS = {
	pwj_sync : false,
	pwj_pair_code : null,
	options : {}
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
		Sync.synchronizeNow();
		Sync.syncLoop();
		chrome.storage.sync.get("autorun",(data)=>{
			if(data && data.autorun === true){
				$(()=>{
					console.log('AUTORUN ENABLED');
					this.background = new App();
				})
			}else{
				console.log('AUTORUN DISABELED');
			}
		})
	}
}
// StickyNotes.STORE = null;
class App{
	constructor(){
		console.log('LAUNCH');
		this.initLaunching();
	}
	initLaunching(){
		// chrome.storage.sync.get(['pwj_sync','pwj_pair_code'],function initLaunching2(data){
		// 	if(data && data.pwj_sync && data.pwj_pair_code){
		// 		GLOBALS.pwj_sync = data.pwj_sync;
		// 		GLOBALS.pwj_pair_code = data.pwj_pair_code;
		// 	}else{
		// 		GLOBALS.pwj_sync = false;
		// 		GLOBALS.pwj_pair_code = null;
		// 	}
		// }.bind(this))
		Sync.updateTheWay();
		this.continueLaunching();
	}
	continueLaunching(){
		IndexedDB.getNotes().then((notes)=>{
			console.log(notes);
			this.notes = notes;
			this.properLaunching();
			Sync.synchronizeNow(notes);
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
var BackgroundListeners = {
	run : function(){
		console.log('LISTENERS');
		chrome.runtime.onMessage.addListener(this.runtimeOnMessage)
		chrome.storage.onChanged.addListener(this.storageOnChanged)
		this.customListener1 = setInterval(()=>{
			let windows = chrome.app.window.getAll();
			if(windows.length===0){
				// console.log('NO WINDOWS');
				Sync.syncLoopStop();
			}else{
				// console.log('Sync.syncLoopTimeout',Sync.syncLoopTimeout);
				if(!Sync.syncLoopIsGoing){
					Sync.syncLoop();
				}
			}
		},3000)
	},
	runtimeOnMessage : (msg,sender,sendResponse)=>{
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
	},
	storageOnChanged : (changes,areaName)=>{
		if(changes.pwj_sync || changes.pwj_pair_code){
			Sync.updateTheWay();
		}else if (changes.purchasedinapp) {
			Store.updatePurchasedElements();
		}
		// if(areaName === 'sync'){
		// 	let keys = Object.keys(changes)
		// 	for(let key of keys){
		// 		if(options[key] !== undefined){
		// 			options[key] = changes[key].newValue
		// 		}
		// 	}
		// }
	}
}
var stickynotes = new StickyNotes();
// var stickynotes = new StickyNotes();
