var notes = window.notes || [];
$(function(){
	//console.log(notes)

	chrome.storage.sync.get(["allLaunch","isStoreOpen"],function(data){
		var allLaunch = data.allLaunch;
		if(allLaunch === true){
			$("#showalways").attr("checked",true);
		}else if(allLaunch === false){
			$("#showalways").attr("checked",false);
		}
		var isStoreOpen = data.isStoreOpen;
		if(!isStoreOpen){
			$(".storedependent").css("display","none");
		}
	});

	if(!notes || !notes.length || notes.length === 0){
		console.log('GET MYSELF');
		updateNotes();
	}else{
		displayNotes(notes);
	}

	$(".openall").on("click",function(){
		openAllNotes();
	})
	$(".openallclose").on("click",function(){
		// openAllNotes(function(){chrome.app.window.current().close();});
		openAllNotes(function(){window.close();});
	})
	$(document).on("click",".notecolor",function(){
		var id = $(this).data('note');
		var note = jQuery.grep(notes,function(n,i){
			return (n.id===id);
		});
		if(note && note[0]){
			note = note[0];
			Notes.openNote(note);
			// (function(note){
			// 	chrome.app.window.create('/note/note.html',{id:note.id,frame:'none'},function(createdWindow){
			// 		createdWindow.contentWindow.note = note;
			// 		chrome.app.window.get(note.id).onClosed.addListener(function(){
			// 			syncAll();
			// 		})
			// 	})
			// })(note);
		}
	})
	$("#showalways").on("change",function(){
		var val = $(this).is(":checked");
		chrome.storage.sync.set({allLaunch:val},function(){

		});
	})
	$(".addnote").on('click',function(){
		chrome.runtime.sendMessage({func:"openNewNote"});
	})
	$(".opensettings").on('click',function(){
		chrome.app.window.create("/options/main.html",{innerBounds:{width:800,height:600}});
	})
	$(".openstore").on('click',function(){
		chrome.app.window.create("/store/purchase.html",{innerBounds:{width:800,height:600}});
	})
	$(".opendonate").on('click',function(){

	})
});
var displayNotes = function(notes){
	var nl = $("#noteslist").empty();
	for(var i in notes){
		var note = notes[i];
		if(note.removed){
			continue;
		}
		nl.append('<li><table><tr><td><span class="notecolor" data-note="'+note.id+'" style="background-color:'+note.color+';"></span></td><td class="notecontent" style="font-family:'+note.fontfamily+'"><div>'+note.textarea+'</div></td><td><span class="openbutton" data-note="'+note.id+'" style="background-color:'+note.color+';">Open</span></td></tr></li>');
	}
}
var openAllNotes = function(callback){
	let callbackcounterDecrementTrigger = () => {
		callbackcounter--;
		// console.log('callbackcounter',callbackcounter);
		if(callbackcounter === 0 && typeof callback === 'function'){
			// console.log('CALLBACK');
			callback();
		}
	}
	var callbackcounter = 0;
	console.log('NOTES',notes);
	for(var i in notes){
			var note = notes[i];
			if(Note.isRemoved(note)){
				continue;
			}
			callbackcounter++;
			Notes.openNote(note).then(()=>{
				callbackcounterDecrementTrigger();
			}).catch((err)=>{
				callbackcounterDecrementTrigger();
			})
			// (function(note){
			// 	chrome.app.window.create('/note/note.html',{id:note.id,frame:'none'},function(createdWindow){
			// 		createdWindow.contentWindow.note = note;
			// 		chrome.app.window.get(note.id).onClosed.addListener(function(){
			// 			syncAll();
			// 		})
			// 		callbackcounter--;
			// 		// console.log('callbackcounter',callbackcounter);
			// 		if(callbackcounter === 0 && typeof callback === 'function'){
			// 			// console.log('CALLBACK');
			// 			callback();
			// 		}
			// 	})
			// })(note);
		}
}
var updateNotes = function(newnotes){
	if(newnotes && newnotes.length>0){
		notes = newnotes;
		displayNotes(newnotes);
	}else{
		IndexedDB.getNotes().then((n)=>{
			let doINeedToRefresh = false;
			for(let newnote of n){
				let oldnote = jQuery.grep(notes,function(n,i){
					return (n.id === newnote.id);
				});
				if(oldnote && (Note.isContentTheSame(newnote,oldnote) || newnote.removed !== newnote.removed)){
					doINeedToRefresh = true;
					break;
				}
			}
			notes = n;
			if(doINeedToRefresh){
				displayNotes(n)
			}
		})
	}
}
