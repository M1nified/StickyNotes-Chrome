colors = ['#FFF','#f7f945','#FEFF87','#87E7FF','#C0A2D8','#8BE48E','#53e3de','#ff9e2b'];
color = 0;
savetimeout = null;
hidemenutimeout = null;
save = true;
chrome.app.window.current().outerBounds.setMinimumSize(160,160);
sortedMenuItemsReady = false;
speachrecognitionon = false;
speechToTextActiveLang = "en-US";
$(document).ready(function(){
	chrome.storage.sync.get(null,function(data){console.log(data)});
	updateColor();
	setTextarea();
	setMenuColors();
	setFonts();
	setSortedMenuItems();
	setWindowActions();
	setLiveListeners();
//$("#buttonTextToSpeech").click(function(){chrome.tts.speak($("#notetextarea").text());})
grabbed = null;
$(".sortable").on("dragstart",function(event){
	grabbed = event.target;
});
$(".toolbar").on("drop",function(event){
	event.preventDefault();
	$("#customButtonsEndPoint").before(grabbed);
	grabbed = null;
	saveNoteDelayed();
}).on("dragover",function(event){
	event.preventDefault();
});
$("#noteBox").on("drop",function(event){
	if(grabbed){
		event.preventDefault();
		$("#menuMenu").append(grabbed);
		grabbed = null;
	}
	saveNoteDelayed();
}).on("dragover",function(event){
	if(grabbed){
		event.preventDefault();
	}
});
$(".textFormat").click(function(){
	var role = $(this).data("role");
	document.execCommand(role, false, null);
});
$("#buttonTaskList").click(function(){
	document.execCommand('insertUnorderedList',false,null);
	var elem = $(window.getSelection().focusNode).closest("ul");
	elem.addClass('task-list');
})
$(".fontbutton").each(function(){$(this).css("font-family",$(this).attr("font-family")).attr("title",$(this).attr("font-family"))});
$(".fontbutton").click(function(event){
	$("#noteBox").css("font-family",$(this).attr("font-family"));
	saveNoteDelayed();
});
$(".fontsizebutton").click(function(event){
	$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))+parseInt($(this).attr("font-size-change")));
	saveNoteDelayed();
})
$(".menubutton").click(function(event){
	var menuId = $(this).attr('menu');
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
});
$(".menucollection").mouseout(function(){
	clearTimeout(hidemenutimeout);
	hidemenutimeout = setTimeout(function(){
		$(".menucollection").hide("slow");	
	},1500);
})
$(".menucollection").mouseover(function(){
	clearTimeout(hidemenutimeout);
});
$("#buttonClose").click(function(event){
	saveNote(function(){window.close();});
}).on('mousedown contextmenu mouseover',function(){
	showWindowActions();
});
$("#windowActionsBox").on('mouseout blur',function(){hideWindowActionsDelayed();}).on('mousein',function(){clearTimeout(hideWindowActionsTimeout);});
$("#buttonMinimize").click(function(){
	if(!chrome.app.window.current().isMinimized()){
		chrome.app.window.current().minimize();
	}else{
		chrome.app.window.current().restore();
	}
});
$("#buttonMaximize").click(function(){
	if(!chrome.app.window.current().isMaximized()){
		chrome.app.window.current().maximize();
	}else{
		chrome.app.window.current().restore();
	}
});
$("#buttonAdd").click(function(event){
	openNewNote();
});
$("#buttonDel").click(function(event){
	$("#removeBox").fadeIn(200);
});
$("#removeCancel").click(function(event){
	$("#removeBox").fadeOut(300);
});
$("#removeRemove").click(function(event){
	closeThisNote();
});
$("#buttonCloseAll").click(function(event){
	var allwindows = chrome.app.window.getAll();
	console.log(allwindows)
	for(i in allwindows){
		(function(thewindow){
			thewindow.contentWindow.saveNote(function(){thewindow.close();})
		})(allwindows[i])
	}
});
$("#buttonSpeachToText").click(function(event){
	speechToTextInitiate();
});
$("#buttonAlwaysOnTop").click(function(event){
	var is = chrome.app.window.current().isAlwaysOnTop();
	chrome.app.window.current().setAlwaysOnTop(!is);
	buttonYesNoChange(this,!is);
})
$("#buttonGoToOptions").click(function(){
	event.preventDefault();
	chrome.app.window.create($(this).attr("href"),{innerBounds:{width:800,height:600}});
});
$("#buttonShareLink").click(function(){
	chrome.storage.sync.get("id_owner",function(data){
		if(data && data.id_owner){
			var id_owner = data.id_owner;
			var newnote = {};
			newnote.id = note.id;
			newnote.textarea = $("#notetextarea").html();
			newnote.color = colors[color];
			newnote.fontfamily = $("#noteBox").css("font-family");
			newnote.fontsize = $("#noteBox").css("font-size");
			newnote.date = new Date().valueOf();
			$.post("http://prowebject.com/stickynotes/sharebox/share.php",{id_owner:id_owner,note:newnote},function(result){
				console.log(result);
				if(result){
					var result = JSON.parse(result);
					console.log(result);
					chrome.app.window.create('background/shared.html',{id:note.id+"_shared",innerBounds:{width:256,height:320,maxWidth:256,maxHeight:320}},function(createdWindow){
						createdWindow.contentWindow.info = result;
						try{
							createdWindow.contentWindow.update();
						}catch(e){

						}

					})
				}
			})
		}
	})
});
$(window).resize(function(){
	setTextarea();
	setSortedMenuItems();
	setWindowActions();
	/*saveNoteDelayed();*/
})
$(window).blur(function(){
	chrome.runtime.sendMessage({func:"syncAllDelayed"});
	hideWindowActions();
})
try{
	color = presetcolor;
	updateColor();
}catch(e){}
if(typeof(note) != 'undefined' && note != null){
	$("#notetextarea").html(note.textarea);
	color = colors.indexOf(note.color) || 0;
	updateColor();
}else{
	note = {};
	note.id = chrome.app.window.current().id;
}
$("#notetextarea").on('keypress keyup',function(event){
	saveNoteDelayed();
})
k17Delay = null;
k17 = false;
k17selectionstart = null;
k17selectionend = null;
k17counter = 0;
$(window).on('keydown keyup',function(event){//functional keys
	var k17Down = function(){
		var notetextarea = $("#notetextarea");
		var noteclickarea = $("#noteclickarea");
		if(k17===false){
			k17 = true;
			k17selectionstart = notetextarea.prop("selectionStart");
			k17selectionend = notetextarea.prop("selectionEnd");
			var context = notetextarea.html();
			var scrolltop = notetextarea.scrollTop();
			var context_url = urlize(context,{autoescape:false});
			notetextarea.hide();
			noteclickarea.show().css('height',notetextarea.css('height')).css('width',notetextarea.css('width')).html(context_url).scrollTop(scrolltop);
		}
		clearTimeout(k17Delay);
		k17Delay = setTimeout(k17Up,1500);
	}
	var k17Up = function(){
		if(k17){
			clearTimeout(k17Delay);
			var notetextarea = $("#notetextarea");
			var noteclickarea = $("#noteclickarea");
			scrolltop = noteclickarea.scrollTop();
			noteclickarea.hide();
			notetextarea.show().scrollTop(scrolltop).prop("selectionStart",k17selectionstart).prop("selectionEnd",k17selectionend);
			k17 = false;
		}
	}
	//console.log(event)
	switch(event.keyCode){
		case 17: switch(event.type){//ctrl
			case "keydown": if(event.altKey===false && k17counter>0){k17Down();}else{k17counter++;}//pure ctrl only (no alt gr)
			break;
			case "keyup": k17counter=0;k17Up();
			break;
		}
		break;
		case 85: //u
		if(event.type == "keyup" && event.ctrlKey && event.shiftKey){
			document.execCommand("strikeThrough", false, null);
		}
		break;
		case 188://< (- font)
		if(event.type == "keydown" && event.ctrlKey){
			event.preventDefault();
			$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))+1);
			saveNoteDelayed();
		}
		break;
		case 190://> (+ font)
		if(event.type == "keydown" && event.ctrlKey){
			event.preventDefault();
			$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))-1);
			saveNoteDelayed();
		}
		break;
	}
}).on("wheel",function(event){
	if(event.ctrlKey){
		event.preventDefault();
		if(event.originalEvent.deltaY>0){
			$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))-1);
		}else if(event.originalEvent.deltaY<0){
			$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))+1);
		}
		saveNoteDelayed();
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
hideWindowActionsTimeout = null;
var setWindowActions = function(){
	if($("#toolbar > .button, #windowActionsBox > .button").length * 25 <= $(window).width()){
		$("#windowActionsBox").removeClass("windowActionsBoxDrop").addClass("windowActionBoxToolbar")
		$("#buttonClose").after($("#windowActionsBox"))
	}else{
		$("#windowActionsBox").removeClass("windowActionBoxToolbar").addClass("windowActionsBoxDrop")
		$("body").append($("#windowActionsBox"))
	}
}
var setLiveListeners = function(){
	$("body").on("dblclick","ul.task-list li",function(event){
		event.preventDefault();
		event.stopPropagation();
		if($(this).hasClass('done')===true){
			$(this).removeClass('done');
		}else{
			$(this).addClass('done');
		}
		var selection = window.getSelection();
		//selection.collapseToEnd();
		selection.removeAllRanges();
	});
	$("body").on("dblclick","ul.task-list li span",function(event){
		event.preventDefault();
		event.stopPropagation();
	});
}
var showWindowActions = function(){
	if(!$("#windowActionsBox").is(":visible")){
		$("#windowActionsBox").show("fast");
	}
	//hideWindowActionsDelayed();
}
var hideWindowActionsDelayed = function(){
	//console.log("delay")
	clearTimeout(hideWindowActionsTimeout);
	hideWindowActionsTimeout = setTimeout(function(){
		hideWindowActions();	
	},1500);
}
var hideWindowActions = function(){
	clearTimeout(hideWindowActionsTimeout);
	$("#windowActionsBox").hide("fast");
}
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
	$("#buttonColor .dot").css("background-color",colors[color]);
	saveNoteDelayed();
}
var openNewNote = function(){
	chrome.runtime.sendMessage({func:"openNewNote",presetcolor:color,presetfont:{fontfamily:$("#noteBox").css("font-family"),fontsize:$("#noteBox").css("font-size")}});
}
var closeThisNote = function(){
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function(e) {
		//console.log("Success!");
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		store.put({id:note.id,removed:true,date:new Date().valueOf()}).onsuccess = function(event){
			chrome.runtime.sendMessage({func:"syncAllDelayed"});
			save=false;
			chrome.app.window.current().close();
		}
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}
var setTextarea = function(){
	var h = $(window).height() - 10;
	var w = $(window).width() - 10;
	h-=$("#notetextarea").position().top;
	//console.log(h)
	$("#noteBox>*").css("height",h);//#notetextarea
	$("#noteBox>*").css("width",w);
	//$("#removeBox").css("top",-h-10 + "px");
}
var setFonts = function(){
	try{
		$("#noteBox").css("font-family",presetfont.fontfamily);
	}catch(e){}
	try{
		$("#noteBox").css("font-size",presetfont.fontsize);
	}catch(e){}
	if(note){
		$("#noteBox").css("font-family",note.fontfamily);
		$("#noteBox").css("font-size",note.fontsize);
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
var setSnippet = function(){
	document.title = $("#notetextarea").text().slice(0,40);
}
var saveNoteDelayedTimeout = null;
var changesInProgress = false;
var saveNoteDelayed = function(){
	changesInProgress = true;
	$("#buttonClose").addClass("buttonclosesaveon-delayed").attr('title','Changes detected, stop typing to autosave :)'); 
	clearTimeout(saveNoteDelayedTimeout);
	saveNoteDelayedTimeout = setTimeout(saveNote,700);
}
var saveNote = function(callback){
	$("#buttonClose").removeClass("buttonclosesaveon-delayed").attr('title','Saving!'); 
	var textarea = $("#notetextarea").html();
	//console.log($("#notetextarea").text())
	//console.log($("#notetextarea").html())
	if(sortedMenuItemsReady){
		var sortedMenuItems = $(".toolbar > .sortable").toArray();
		for(var i in sortedMenuItems){
			sortedMenuItems[i] = sortedMenuItems[i].id;
		}
		chrome.storage.sync.set({sortedMenuItems:sortedMenuItems},function(){setSortedMenuItems();});
		//console.log(sortedMenuItems)
	}
	setSnippet();
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
				newnote.fontfamily = $("#noteBox").css("font-family");
				newnote.fontsize = $("#noteBox").css("font-size");
				newnote.date = new Date().valueOf();
				newnote.sortedMenuItems = sortedMenuItems;
				//newnote.removed = false;
				var put = store.put(newnote);
				put.onsuccess = function(){
					note = newnote;
					$("#buttonClose").removeClass("buttonclosesaveon buttonclosesaveon-delayed").attr('title','Saved, click to Hide!');
					chrome.runtime.sendMessage({func:"syncAllDelayed"});
					if(callback){
						callback();
					}
				}
				changesInProgress = false;
			}else{
				var oldnotecopy = JSON.parse(JSON.stringify(request.result));
				request.result.textarea = textarea;
				request.result.width = $(window).width();
				request.result.height = $(window).height();
				request.result.top = window.screenY;
				request.result.left = window.screenX;
				request.result.color = colors[color];
				request.result.fontfamily = $("#noteBox").css("font-family");
				request.result.fontsize = $("#noteBox").css("font-size");
				request.result.sortedMenuItems = sortedMenuItems;
				if(isNotesContentSame(oldnotecopy,request.result)===true){
					console.log("SAME");
					if(callback){
						//console.log("CALLBACK")
						callback();
					}
				}else{
					request.result.date = new Date().valueOf();
					console.log("UPDATED")
					var put = store.put(request.result);
					put.onsuccess = function(){
						note = request.result;
						$("#buttonClose").removeClass("buttonclosesaveon buttonclosesaveon-delayed").attr('title','Saved, click to Hide!'); 
						chrome.runtime.sendMessage({func:"syncAllDelayed"});
						if(callback){
							callback();
						}
					}
				}
				changesInProgress = false;
			}
		}
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}
var updateNote = function(){
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function(e) {
		db = e.target.result;
		var tx=db.transaction("notes","readwrite");
		var store = tx.objectStore("notes");
		var index = store.index("by_id");
		var request = index.get(note.id);
		request.onsuccess = function(){
			if(request && request.result){
				var newnote = request.result;
				if(changesInProgress===false && isNotesContentSame(newnote,note) !== true && newnote.date>note.date){
					note = newnote;
					$("#notetextarea").html(note.textarea);
					color = colors.indexOf(note.color);
					updateColor();
					setTextarea();
					setMenuColors();
					setFonts();
					setSnippet();
					//console.log("updateNote")
				}
				//console.log("END (updateNote)")
			}
		}
	}
	openRequest.onerror = function(e) {
		console.log("Error");
		console.dir(e);
	}
}