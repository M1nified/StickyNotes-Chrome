$(function(){
	console.log(notes)
	
	chrome.storage.sync.get("allLaunch",function(allLaunch){
		allLaunch = allLaunch.allLaunch;
		if(allLaunch === true){
			$("#showalways").attr("checked",true);
		}else if(allLaunch === false){
			$("#showalways").attr("checked",false);
		}
	});
	
	var nl = $("#noteslist")
	for(var i in notes){
		var note = notes[i];
		nl.append('<li><table><tr><td><span class="notecolor" data-note="'+note.id+'" style="background:'+note.color+';"></span></td><td class="notecontent" style="font-family:'+note.fontfamily+'"><div>'+note.textarea+'</div></td><td><span class="openbutton" data-note="'+note.id+'" style="background-color:'+note.color+';">Open</span></td></tr></li>');
	}
	
	$(".openall").on("click",function(){
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
	})
	$(".notecolor").on("click",function(){
		var id = $(this).data('note');
		var note = jQuery.grep(notes,function(n,i){
			return (n.id===id);
		});
		if(note && note[0]){
			note = note[0];
			(function(note){
				chrome.app.window.create('background/note.html',{id:note.id,frame:'none'},function(createdWindow){
					createdWindow.contentWindow.note = note;
					chrome.app.window.get(note.id).onClosed.addListener(function(){
						syncAll();
					})
				})
			})(note);
		}
	})
	$("#showalways").on("change",function(){
		var val = $(this).is(":checked");
		chrome.storage.sync.set({allLaunch:val},function(){
			
		});
	})
});