'use strict';
var colors = ['#FFF','#f7f945','#FEFF87','#87E7FF','#C0A2D8','#8BE48E','#53e3de','#ff9e2b'];
var color = "#FFF";
var savetimeout = null;
var hidemenutimeout = null;
var save = true;
chrome.app.window.current().outerBounds.setMinimumSize(160,160);
var sortedMenuItemsReady = false;
var speechrecognitionon = false;
var speechToTextActiveLang = "en-US";
var purchasedelementslocal = {};
var grabbed = null;
var runIndependently = function(func){
	setTimeout(func,0)
}
$(document).ready(function(){
	chrome.storage.sync.get(null,function(data){console.log(data)});
	runIndependently(updateColor)// updateColor();
	runIndependently(setTextarea);
	runIndependently(setMenuColors);
	runIndependently(setFonts);
	runIndependently(()=>{
		setSortedMenuItems(function(){setWindowActions();});
	})
	runIndependently(setSpeechToTextLangsList);
	runIndependently(setLiveListeners);
	runIndependently(setPurchasedItems);
	runIndependently(checkStoreState);

	try{
		color = presetcolor;
		updateColor();
	}catch(e){}

	if(typeof(note) != 'undefined' && note != null){
		$("#notetextarea").html(note.textarea);
		color = note.color || "#FFF";
		updateColor();
	}else{
		note = {};
		note.id = chrome.app.window.current().id;
	}

	buttonYesNoChange($("#buttonAlwaysOnTop")[0],chrome.app.window.current().isAlwaysOnTop());
	
	InTheNote.save();
});
chrome.storage.onChanged.addListener(function(changes,areaName){
	if(changes.sortedMenuItems !== null){
		setSortedMenuItems(function(){setWindowActions();});
	}
	if(changes.purchasedinapp !== null && changes.purchasedinapp !== undefined){
		setPurchasedItems();
	}
	if(changes.isStoreOpen !== null && changes.isStoreOpen !== undefined){
		setStoreState(changes.isStoreOpen.newValue);
	}
});
var hideWindowActionsTimeout = null;
var setWindowActions = function(){
	if($("#toolbar > .button, #windowActionsBox > .button").length * 25 <= $(window).width()){
		//console.log("A");
		$("#windowActionsBox").removeClass("windowActionsBoxDrop").addClass("windowActionBoxToolbar")
		$("#buttonClose").after($("#windowActionsBox"))
	}else{
		//console.log("B");
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
		InTheNote.saveDelayed();
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
var markButtonCloseAsSaved = function(){
	$("#buttonClose").removeClass("buttonclosesaveon buttonclosesaveon-delayed").attr('title','Saved, click to Hide!');
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
var setSpeechToTextLangsList = function(){
	for(var i in speechToTextLangs){
		var l = speechToTextLangs[i];//bo uglify nie obsluguje for...of
		if(l.length === 2){
			$("#speechToTextLangSelBox>ul").append("<li code=\""+l[1]+"\">"+l[0]+"</li>");
		}else if(l.length > 2){
			for(var di = 1;di<l.length;di++){
				var d = l[di];
				$("#speechToTextLangSelBox>ul").append("<li code=\""+d[0]+"\">"+l[0] +" (" + d[1] + ")" +"</li>");
			}
		}
	}
	$("#speechToTextLangSelBox>ul>li").click(function(){
		var langcode = $(this).attr('code');
		chrome.storage.sync.set({speechToTextLang:langcode},function(){	});
		$("#speechToTextLangSelBox").fadeOut(300);
	})
}
var setSortedMenuItems = function(callback){
	chrome.storage.sync.get({sortedMenuItems:null},function(data){
		if(data.sortedMenuItems !== null && data.sortedMenuItems.length > 0){
			$("#menuMenu").append($("#toolbar > .sortable").not("#"+data.sortedMenuItems.join(",#")));
			$("#customButtonsEndPoint").before($("#"+data.sortedMenuItems.join(",#")));
		}else{
			$("#menuMenu").append($("#toolbar > .sortable"));
		}
		sortedMenuItemsReady = true;
		while($("#toolbar > .button").length * 25 > ($(window).width()-20) && $("#customButtonsEndPoint").prev(".sortable").length > 0){
			$("#menuMenu").append($("#customButtonsEndPoint").prev(".sortable"));
			sortedMenuItemsReady = false;
		}
		if(typeof callback === "function"){
			callback();
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
var updateColor = function(save,nc){
	var c = color;
	if(typeof nc !== 'undefined'){
		c = nc;
	}
	if(typeof save === 'undefined'){
		save = true;
	}
	if(typeof c === "number"){
		c = colors[c];
	}
	$(".globalBox").css("background-color",c);
	$("#buttonColor .dot").css("background-color",c);
	if(save){
		InTheNote.saveDelayed();
	}
}
var openNewNote = function(){
	chrome.runtime.sendMessage({func:"openNewNote",presetcolor:color,presetfont:{fontfamily:$("#noteBox").css("font-family"),fontsize:$("#noteBox").css("font-size")}});
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
	//zmiana koloru czcionki
	/*$("body").on("click",".fontcolorbutton",function(evt){
	$()
});*/
}
var setMenuColors = function(){
	$("#menuColors").empty();
	for(var i in colors){
		$("#menuColors").append('<div class="button left colorbutton" data-color="'+colors[i]+'" style="" title="Set this color!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:'+colors[i]+';"></div></div>')
	}
	$(".colorbutton").on("click",function(){
		color = $(this).data("color");
		//console.log(typeof color)
		updateColor();
		setMenuColors();
	})
	$("#menuColors").append('<div class="button left colorbutton storedependent" id="BuyBgColors" style="" title="Get more colors!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:#000000; animation:multicolor 5s infinite linear"></div></div>');
	$("#BuyBgColors").on("click",function(elem){
		chrome.app.window.create("store/purchase.html#bgcolors",{innerBounds:{width:800,height:600}});
	})

	if(purchasedelementslocal.color_palette_background){
		$("#menuColors").append('<div class="button left buttoncolormap" id="openBackgroundPalette" style="" title="Choose from the palette!"></div>');
		$("#openBackgroundPalette").on("click",function(elem){
			openBackgroundPalette();
		})
	}

}
var openBackgroundPalette = function(){
	$("#colorPalette").fadeIn(200);
	$("#colormap>area").on("click",function(evt){
		color = $(this).attr("alt");
		//$("#colorPalette").fadeOut(300);//niepotrzebne, bo robi to listener dla calej palety
		updateColor();
	}).on("mouseover",function(evt){
		updateColor(false,$(this).attr("alt"));
	});
	$("#colormap").on("mouseout",function(evt){
		updateColor();
	})
};
var setSnippet = function(){
	document.title = $("#notetextarea").text().slice(0,40);
}
var updateNote = function(){
	var openRequest = indexedDB.open("notes");
	openRequest.onsuccess = function(e) {
		var db = e.target.result;
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
					color = note.color;
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
var checkStoreState = function(){
	chrome.storage.local.get("isStoreOpen",function(data){
		if(data){
			setStoreState(data.isStoreOpen);
		}
	})
}
var setStoreState = function(state){
	if(state){
		$(".storedependent").removeClass("offcosnostore");
	}else{
		$(".storedependent").addClass("offcosnostore");
	}
}
var setPurchasedItems = function(){
	chrome.storage.sync.get("purchasedinapp",function(data){
		//console.log(data)
		/*if(!data || !data.purchasedinapp || !data.purchasedinapp.speech_to_text){
		$("#buttonSpeechToText").css("display","none");
	}*/
	if(data && data.purchasedinapp){
		var items = data.purchasedinapp;
		var u_color = false;
		for(var i in items){
			console.log(i)
			console.log(items[i])
			if(items[i]!==true){
				continue;
			}
			if(/^color_box_background_.+/.test(i)===true){
				if(inAppProducts[i] && inAppProducts[i].colors){
					for(var j in inAppProducts[i].colors){
						addOptionalBgColor(inAppProducts[i].colors[j]);
					}
				}
				u_color = true;
				continue;
			}
			switch(i){
				case "color_palette_background":
				purchasedelementslocal["color_palette_background"]=true;
				u_color = true;
				break;

				case "color_background_454f56":
				addOptionalBgColor("#"+i.split("color_background_").join(""));
				u_color = true;
				break;
				case "color_background_ff7171":
				addOptionalBgColor("#"+i.split("color_background_").join(""));
				u_color = true;
				break;
				case "color_background_ff4fc1":
				addOptionalBgColor("#"+i.split("color_background_").join(""));
				u_color = true;
				break;

				case "speech_to_text":
				$("#buttonSpeechToText").css("display","block");
				break;
			}
		}
		if(u_color){
			setMenuColors();
		}
	}
})
}
var addOptionalBgColor = function(color){
	if(colors.indexOf(color)===-1){
		colors.push(color);
	}
}
