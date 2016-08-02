var LINK_PATTERN = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/igm;
colors = ['#FFF','#f7f945','#FEFF87','#87E7FF','#C0A2D8','#8BE48E','#53e3de','#ff9e2b'];
color = 0;
savetimeout = null;
hidemenutimeout = null;
save = true;
chrome.app.window.current().outerBounds.setMinimumSize(160,160);
sortedMenuItemsReady = false;
$(document).ready(function(){
	updateColor();
	setTextarea();
	setMenuColors();
	setFonts();
	setSortedMenuItems();
	//$("#buttonTextToSpeech").click(function(){chrome.tts.speak($("#notetextarea").val());})
	grabbed = null;
	$(".sortable").on("dragstart",function(event){
	//console.log('dragstart')
	grabbed = event.target;
});
	$(".toolbar").on("drop",function(event){
	//console.log("drop")
	event.preventDefault();
	$("#customButtonsEndPoint").before(grabbed);
	grabbed = null;
	saveNoteDelayed();
}).on("dragover",function(event){
	//console.log("dragover")
	event.preventDefault();
});
$("#buttonMenu").on("drop",function(event){
	//console.log("drop")
	event.preventDefault();
	$("#menuMenu").append(grabbed);
	grabbed = null;
	saveNoteDelayed();
}).on("dragover",function(event){
	//console.log("dragover")
	event.preventDefault();
});
$("#noteBox").on("drop",function(event){
	//console.log("drop")
	if(grabbed){
		event.preventDefault();
		$("#menuMenu").append(grabbed);
		grabbed = null;		
	}
	saveNoteDelayed();
}).on("dragover",function(event){
	//console.log("dragover")
	//event.preventDefault();
});

$("#buttonEnableInBrowser").click(function(){
	enableInBrowser();
});
$(".fontbutton").each(function(){$(this).css("font-family",$(this).attr("font-family")).attr("title",$(this).attr("font-family"))});
$(".fontbutton").click(function(event){
	$("#notetextarea").css("font-family",$(this).attr("font-family"));
	saveNoteDelayed();
})
$(".fontsizebutton").click(function(event){
	//console.log(parseInt($("#notetextarea").css("font-size"))+parseInt($(this).attr("font-size-change")))
	$("#notetextarea").css("font-size",parseInt($("#notetextarea").css("font-size"))+parseInt($(this).attr("font-size-change")));
	saveNoteDelayed();
})
$(".menubutton").click(function(event){
	var menuId = $(this).attr('menu');
	//console.log(menuId)
	//console.log($("#"+menuId)[0])
	if(!$("#"+menuId).is(':visible')){
		if($(".menucollection").is(':visible')){
			$(".menucollection").not("#"+menuId).hide(function(){
				$("#"+menuId).show("slow");
			});
		}else{
			$("#"+menuId).show("slow");
		}
	}else{
		$(".menucollection").hide("slow");
	}
})
$(".menucollection").mouseout(function(){
	clearTimeout(hidemenutimeout);
	hidemenutimeout = setTimeout(function(){
		$(".menucollection").hide("slow");	
	},1500);
})
$(".menucollection").mouseover(function(){
	clearTimeout(hidemenutimeout);
})
$("#buttonClose").click(function(event){
	saveNote(function(){window.close();});
})
$("#buttonAdd").click(function(event){
	openNewNote();
})
$("#buttonDel").click(function(event){
	closeThisNote();
})
$("#buttonAlwaysOnTop").click(function(event){
	console.log('!')
	var is = chrome.app.window.current().isAlwaysOnTop();
	chrome.app.window.current().setAlwaysOnTop(!is);
	//console.log(chrome.app.window.current().isAlwaysOnTop())
	buttonYesNoChange(this,!is);
})
/*$("#buttonColor").click(function(event){
	color++;
	if(color>=colors.length){
		color=0;
	}
	updateColor();
})*/
$(window).resize(function(){
	setTextarea();
	setSortedMenuItems();
	saveNoteDelayed();
})
$(window).blur(function(){
	chrome.runtime.sendMessage({func:"syncAll"});
})
try{
	color = presetcolor;
	console.log(color);
	updateColor();
}catch(e){}
if(typeof(note) != 'undefined' && note != null){
	//console.log(note)
	$("#notetextarea").html(note.textarea);
	color = colors.indexOf(note.color) || 0;
	//console.log(color);
	updateColor();
}else{
	//console.log('null')
	note = {};
	note.id = chrome.app.window.current().id;
}
$("#notetextarea").on('keypress keyup paste',function(event){
	//console.log('key ' + event.keyCode)
	clearTimeout(savetimeout);
	savetimeout = setTimeout(function(){
		saveNote();
		console.log($("#notetextarea").children().not("#notetextarea a"));
		//console.log(urlize($("#notetextarea").not("a").html()))
	},700);
}).on('keydown keyup',function(event){//functional keys
	console.log(event);
	switch(event.keyCode){
		case 17: switch(event.type){
			case "keydown": $("#notetextarea a").attr("contenteditable","false");
			break;
			case "keyup": $("#notetextarea a").attr("contenteditable","true");
			break;
		}
	}
})
chrome.app.window.onClosed.addListener(function(){
	if(save){
		saveNote();
	}
})
buttonYesNoChange($("#buttonAlwaysOnTop")[0],chrome.app.window.current().isAlwaysOnTop());
saveNote();
});
chrome.storage.onChanged.addListener(function(changes,areaName){
	if(changes.sortedMenuItems !== null){
		setSortedMenuItems();
	}
});
var setSortedMenuItems = function(){
	chrome.storage.sync.get({sortedMenuItems:null},function(data){
		if(data.sortedMenuItems !== null && data.sortedMenuItems.length > 0){
			$("#menuMenu").append($("#toolbar > .sortable").not("#"+data.sortedMenuItems.join(",#")));
			$("#customButtonsEndPoint").before($("#"+data.sortedMenuItems.join(",#")));
		}else{
			$("#menuMenu").append($("#toolbar > .sortable"));
		}
		sortedMenuItemsReady = true;
		while($("#toolbar > .button").length * 25 > $(window).width() && $("#customButtonsEndPoint").prev(".sortable").length > 0){
			$("#menuMenu").append($("#customButtonsEndPoint").prev(".sortable"));
			sortedMenuItemsReady = false;
		}
	});

}
var buttonYesNoChange = function(button,value){
	if(value){
		$(button).removeClass('buttonNo').addClass('buttonYes');
	}else{
		$(button).removeClass('buttonYes').addClass('buttonNo');
	}
}
var updateColor = function(){
	$(".globalBox").css("background-color",colors[color]);
	/*var nextcolor = color + 1;
	if(color+1>=colors.length){
		nextcolor = 0;
	}*/
	$("#buttonColor .dot").css("background-color",colors[color]);
	saveNoteDelayed();
}
var openNewNote = function(){
	chrome.runtime.sendMessage({func:"openNewNote",presetcolor:color,presetfont:{fontfamily:$("#notetextarea").css("font-family"),fontsize:$("#notetextarea").css("font-size")}});
	/*chrome.app.window.create('/background/note.html',{id:Math.random().toString().slice(2),frame:'none',bounds:{width:250,height:240}},function(createdWindow){
		createdWindow.contentWindow.note = null;
		createdWindow.contentWindow.presetcolor = color;
		createdWindow.contentWindow.presetfont = {fontfamily:$("#notetextarea").css("font-family"),fontsize:$("#notetextarea").css("font-size")};
	})*/
}
var closeThisNote = function(){
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function(e) {
		//console.log("Success!");
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		store.delete(note.id).onsuccess = function(event){
			chrome.storage.sync.get({notes:null},function(data){
				var arr = data.notes;
				var index = null;
				var item = $.grep(arr,function(n,i){if(n.id === note.id){index = i;} return n.id===note.id;});
				if(item.length>0){
					arr[index]={id:note.id,removed:true,date:new Date().valueOf()};
				}else{
					arr[arr.length]={id:note.id,removed:true,date:new Date().valueOf()};
				}
				chrome.storage.sync.set({notes:arr},function(){
					save=false;
					window.close();
				});
			})
		}
	}
	openRequest.onerror = function(e) {
		//console.log("Error");
		//console.dir(e);
	}
}
var enableInBrowser = function(){
	var newnoteobj = {};
	newnoteobj.id = note.id;
	newnoteobj.textarea = $("#notetextarea").val();
	newnoteobj.width = $(window).width();
	newnoteobj.height = $(window).height();
	newnoteobj.top = window.screenY;
	newnoteobj.left = window.screenX;
	newnoteobj.color = colors[color];
	newnoteobj.fontfamily = $("#notetextarea").css("font-family");
	newnoteobj.fontsize = $("#notetextarea").css("font-size");
	newnoteobj.date = new Date().valueOf();
	chrome.storage.sync.get({id_owner:null},function(data){
		var id_owner = data.id_owner;
		$.post("http://stickynotes.smg.cba.pl/updateNote.php?id_owner="+id_owner,{note:newnoteobj},function(data){}).done(function(data){
			console.log(data);
		});
	})
}
var setTextarea = function(){
	var h = $(window).height() - 10;
	var w = $(window).width() - 10;
	h-=$("#notetextarea").position().top;
	//console.log(h)
	$("#notetextarea").css("height",h);
	$("#notetextarea").css("width",w);
}
var setFonts = function(){
	try{
		$("#notetextarea").css("font-family",presetfont.fontfamily);
	}catch(e){}
	try{
		$("#notetextarea").css("font-size",presetfont.fontsize);
	}catch(e){}
	if(note){
		$("#notetextarea").css("font-family",note.fontfamily);
		$("#notetextarea").css("font-size",note.fontsize);
	}
}
var setMenuColors = function(){
	$("#menuColors").empty();
	for(var i in colors){
		if(i !== color){
			$("#menuColors").append('<div class="button left colorbutton" colorId="'+i+'" style="" title="Set this color!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:'+colors[i]+';"></div></div>')
		}
	}
	$(".colorbutton").click(function(){
		color = parseInt($(this).attr("colorId"));
		//console.log(typeof color)
		updateColor();
		setMenuColors();
	})
}
var saveNoteDelayedTimeout = null;
var saveNoteDelayed = function(){
	clearTimeout(saveNoteDelayedTimeout);
	saveNoteDelayedTimeout = setTimeout(saveNote,500);
}
var saveNote = function(callback){ 
	var textarea = $("#notetextarea").html();
	console.log(textarea);
	if(sortedMenuItemsReady){
		var sortedMenuItems = $(".toolbar > .sortable").toArray();
		for(var i in sortedMenuItems){
			sortedMenuItems[i] = sortedMenuItems[i].id;
		}
		chrome.storage.sync.set({sortedMenuItems:sortedMenuItems},function(){setSortedMenuItems();});
		//console.log(sortedMenuItems)
	}
	document.title = textarea.slice(0,40);
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function(e) {
		//console.log("Success!");
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");

		var request = index.get(note.id);
		request.onsuccess = function(){
			//console.log(request)
			//console.log(request.result)
			if(request.result === undefined){
				//console.log('problem')
				newnote = {};
				newnote.id = note.id;
				newnote.textarea = textarea;
				newnote.width = $(window).width();
				newnote.height = $(window).height();
				newnote.top = window.screenY;
				newnote.left = window.screenX;
				newnote.color = colors[color];
				newnote.fontfamily = $("#notetextarea").css("font-family");
				newnote.fontsize = $("#notetextarea").css("font-size");
				newnote.date = new Date().valueOf();
				newnote.sortedMenuItems = sortedMenuItems;
				//newnote.removed = false;
				var put = store.put(newnote);
				put.onsuccess = function(){
					if(callback){
						callback();
					}
				}
			}else{
				request.result.textarea = textarea;
				request.result.width = $(window).width();
				request.result.height = $(window).height();
				request.result.top = window.screenY;
				request.result.left = window.screenX;
				request.result.color = colors[color];
				request.result.fontfamily = $("#notetextarea").css("font-family");
				request.result.fontsize = $("#notetextarea").css("font-size");
				request.result.sortedMenuItems = sortedMenuItems;
				request.result.date = new Date().valueOf();
				//request.result.removed = false;
				var put = store.put(request.result);
				put.onsuccess = function(){
					if(callback){
						callback();
					}
				}
			}
		}
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}