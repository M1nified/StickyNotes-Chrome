colors=["#FFF","#f7f945","#FEFF87","#87E7FF","#C0A2D8","#8BE48E","#53e3de","#ff9e2b"],color="#FFF",savetimeout=null,hidemenutimeout=null,save=!0,chrome.app.window.current().outerBounds.setMinimumSize(160,160),sortedMenuItemsReady=!1,speachrecognitionon=!1,speechToTextActiveLang="en-US",purchasedelementslocal={},$(document).ready(function(){chrome.storage.sync.get(null,function(e){console.log(e)}),updateColor(),setTextarea(),setMenuColors(),setFonts(),setSortedMenuItems(function(){setWindowActions()}),setSpeechToTextLangsList(),setLiveListeners(),setPurchasedItems(),checkStoreState(),grabbed=null,$(".sortable").on("dragstart",function(e){grabbed=e.target}),$(".toolbar").on("drop",function(e){e.preventDefault(),$("#customButtonsEndPoint").before(grabbed),grabbed=null,saveNoteDelayed()}).on("dragover",function(e){e.preventDefault()}),$("#noteBox").on("drop",function(e){grabbed&&(e.preventDefault(),$("#menuMenu").append(grabbed),grabbed=null),saveNoteDelayed()}).on("dragover",function(e){grabbed&&e.preventDefault()}),$(".textFormat").click(function(){var e=$(this).data("role");document.execCommand(e,!1,null)}),$("#buttonTaskList").click(function(){document.execCommand("insertUnorderedList",!1,null);var e=$(window.getSelection().focusNode).closest("ul");e.addClass("task-list")}),$(".fontbutton").each(function(){$(this).css("font-family",$(this).attr("font-family")).attr("title",$(this).attr("font-family"))}),$(".fontbutton").click(function(e){$("#noteBox").css("font-family",$(this).attr("font-family")),saveNoteDelayed()}),$(".fontsizebutton").click(function(e){$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))+parseInt($(this).attr("font-size-change"))),saveNoteDelayed()}),$(".menubutton").click(function(e){var o=$(this).attr("menu");$("#"+o).is(":visible")?$(".menucollection").hide("slow"):$(".menucollection").is(":visible")?$(".menucollection").not("#"+o).hide(function(){$("#"+o).show("slow")}):$("#"+o).show("slow")}),$(".menucollection").mouseout(function(){clearTimeout(hidemenutimeout),hidemenutimeout=setTimeout(function(){$(".menucollection").hide("slow")},1500)}),$(".menucollection").mouseover(function(){clearTimeout(hidemenutimeout)}),$("#buttonClose").click(function(e){saveNote(function(){window.close()})}).on("mousedown contextmenu mouseover",function(){showWindowActions()}),$("#windowActionsBox").on("mouseout blur",function(){hideWindowActionsDelayed()}).on("mousein",function(){clearTimeout(hideWindowActionsTimeout)}),$("#buttonMinimize").click(function(){chrome.app.window.current().isMinimized()?chrome.app.window.current().restore():chrome.app.window.current().minimize()}),$("#buttonMaximize").click(function(){chrome.app.window.current().isMaximized()?chrome.app.window.current().restore():chrome.app.window.current().maximize()}),$("#buttonAdd").click(function(e){openNewNote()}),$("#buttonDel").click(function(e){$("#removeBox").fadeIn(200)}),$("#removeCancel").click(function(e){$("#removeBox").fadeOut(300)}),$("#removeRemove").click(function(e){closeThisNote()}),$("#buttonCloseAll").click(function(e){var o=chrome.app.window.getAll();console.log(o);for(i in o)!function(e){"function"==typeof e.contentWindow.saveNote?e.contentWindow.saveNote(function(){e.close()}):e.close()}(o[i])}),$("#buttonSpeachToText").click(function(e){speechToTextInitiate()}),$("#buttonAlwaysOnTop").click(function(e){var o=chrome.app.window.current().isAlwaysOnTop();chrome.app.window.current().setAlwaysOnTop(!o),buttonYesNoChange(this,!o)}),$("#buttonGoToOptions").click(function(){event.preventDefault(),chrome.app.window.create($(this).attr("href"),{innerBounds:{width:800,height:600}})}),$("#buttonOpenStore").click(function(){event.preventDefault(),chrome.app.window.create($(this).attr("href"),{innerBounds:{width:800,height:600}})}),$("#buttonShareLink").click(function(){chrome.storage.sync.get("id_owner",function(e){if(e&&e.id_owner){var o=e.id_owner,t={};t.id=note.id,t.textarea=$("#notetextarea").html(),t.color=color,t.fontfamily=$("#noteBox").css("font-family"),t.fontsize=$("#noteBox").css("font-size"),t.date=(new Date).valueOf(),$.post("http://prowebject.com/stickynotes/sharebox/share.php",{id_owner:o,note:t},function(e){if(console.log(e),e){var e=JSON.parse(e);console.log(e),chrome.app.window.create("background/shared.html",{id:note.id+"_shared",innerBounds:{width:256,height:320,maxWidth:256,maxHeight:320}},function(o){o.contentWindow.info=e;try{o.contentWindow.update()}catch(t){}})}})}})}),$("#colorPalette").on("click",function(e){$("#colorPalette").fadeOut(300)}),$(window).resize(function(){setTextarea(),setSortedMenuItems(function(){setWindowActions()})}),$(window).blur(function(){chrome.runtime.sendMessage({func:"syncAllDelayed"}),hideWindowActions()});try{color=presetcolor,updateColor()}catch(e){}"undefined"!=typeof note&&null!=note?($("#notetextarea").html(note.textarea),color=note.color||"#FFF",updateColor()):(note={},note.id=chrome.app.window.current().id),$("#notetextarea").on("keypress keyup",function(e){saveNoteDelayed()}),k17Delay=null,k17=!1,k17selectionstart=null,k17selectionend=null,k17counter=0,$(window).on("keydown keyup",function(e){var o=function(){var e=$("#notetextarea"),o=$("#noteclickarea");if(k17===!1){k17=!0,k17selectionstart=e.prop("selectionStart"),k17selectionend=e.prop("selectionEnd");var n=e.html(),s=e.scrollTop(),i=urlize(n,{autoescape:!1});e.hide(),o.show().css("height",e.css("height")).css("width",e.css("width")).html(i).scrollTop(s)}clearTimeout(k17Delay),k17Delay=setTimeout(t,1500)},t=function(){if(k17){clearTimeout(k17Delay);var e=$("#notetextarea"),o=$("#noteclickarea");scrolltop=o.scrollTop(),o.hide(),e.show().scrollTop(scrolltop).prop("selectionStart",k17selectionstart).prop("selectionEnd",k17selectionend),k17=!1}};switch(e.keyCode){case 17:switch(e.type){case"keydown":e.altKey===!1&&k17counter>0?o():k17counter++;break;case"keyup":k17counter=0,t()}break;case 85:"keyup"==e.type&&e.ctrlKey&&e.shiftKey&&document.execCommand("strikeThrough",!1,null);break;case 188:"keydown"==e.type&&e.ctrlKey&&(e.preventDefault(),$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))+1),saveNoteDelayed());break;case 190:"keydown"==e.type&&e.ctrlKey&&(e.preventDefault(),$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))-1),saveNoteDelayed())}}).on("wheel",function(e){e.ctrlKey&&(e.preventDefault(),e.originalEvent.deltaY>0?$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))-1):e.originalEvent.deltaY<0&&$("#noteBox").css("font-size",parseInt($("#noteBox").css("font-size"))+1),saveNoteDelayed())}),$("#notetextarea").on("keydown",function(e){switch(e.keyCode){case 9:e.preventDefault(),insertElem($(document.createElement("pre")).addClass("pretab").append("&#9;")[0])}}),chrome.app.window.onClosed.addListener(function(){save&&saveNote()}),buttonYesNoChange($("#buttonAlwaysOnTop")[0],chrome.app.window.current().isAlwaysOnTop()),saveNote()}),chrome.storage.onChanged.addListener(function(e,o){null!==e.sortedMenuItems&&setSortedMenuItems(function(){setWindowActions()}),null!==e.purchasedinapp&&void 0!==e.purchasedinapp&&setPurchasedItems(),null!==e.isStoreOpen&&void 0!==e.isStoreOpen&&setStoreState(e.isStoreOpen.newValue)}),hideWindowActionsTimeout=null;var setWindowActions=function(){25*$("#toolbar > .button, #windowActionsBox > .button").length<=$(window).width()?($("#windowActionsBox").removeClass("windowActionsBoxDrop").addClass("windowActionBoxToolbar"),$("#buttonClose").after($("#windowActionsBox"))):($("#windowActionsBox").removeClass("windowActionBoxToolbar").addClass("windowActionsBoxDrop"),$("body").append($("#windowActionsBox")))},setLiveListeners=function(){$("body").on("dblclick","ul.task-list li",function(e){e.preventDefault(),e.stopPropagation(),$(this).hasClass("done")===!0?$(this).removeClass("done"):$(this).addClass("done");var o=window.getSelection();o.removeAllRanges()}),$("body").on("dblclick","ul.task-list li span",function(e){e.preventDefault(),e.stopPropagation()})},showWindowActions=function(){$("#windowActionsBox").is(":visible")||$("#windowActionsBox").show("fast")},markButtonCloseAsSaved=function(){$("#buttonClose").removeClass("buttonclosesaveon buttonclosesaveon-delayed").attr("title","Saved, click to Hide!")},hideWindowActionsDelayed=function(){clearTimeout(hideWindowActionsTimeout),hideWindowActionsTimeout=setTimeout(function(){hideWindowActions()},1500)},hideWindowActions=function(){clearTimeout(hideWindowActionsTimeout),$("#windowActionsBox").hide("fast")},setSpeechToTextLangsList=function(){for(var e in speechToTextLangs){var o=speechToTextLangs[e];if(2===o.length)$("#speechToTextLangSelBox>ul").append('<li code="'+o[1]+'">'+o[0]+"</li>");else if(o.length>2)for(var t=1;t<o.length;t++){var n=o[t];$("#speechToTextLangSelBox>ul").append('<li code="'+n[0]+'">'+o[0]+" ("+n[1]+")</li>")}}$("#speechToTextLangSelBox>ul>li").click(function(){var e=$(this).attr("code");chrome.storage.sync.set({speechToTextLang:e},function(){}),$("#speechToTextLangSelBox").fadeOut(300)})},speechToTextInitiate=function(){var e=function(){speachrecognitionon===!0?speechToTextOff():chrome.storage.sync.get("speechToTextLang",function(e){console.log(e),e=e.speechToTextLang,e?(speechToTextActiveLang=e,speechToTextOn()):$("#speechToTextLangSelBox").fadeIn(200)})};chrome.permissions.request({permissions:["audioCapture"]},function(o){o&&e()})},speechToTextOn=function(){if(console.log("try"),"webkitSpeechRecognition"in window){speachrecognitionon=!0,console.log("on");try{recognition=recognition||new webkitSpeechRecognition}catch(e){recognition=new webkitSpeechRecognition}recognition.continuous=!0,recognition.interimResults=!0,recognition.lang=speechToTextActiveLang,recognition.onstart=function(){$("#buttonSpeachToText").addClass("speachToTextOn")},recognition.onresult=function(e){$("#pendingOperations1").show();for(var o="",t="",n=saveSelection(),s=e.resultIndex;s<e.results.length;++s)e.results[s].isFinal?t+=e.results[s][0].transcript:o+=e.results[s][0].transcript;""!==t.trim()&&!function(e,o){e&&insertText(o,e),$("#pendingOperations1").hide(),saveNoteDelayed()}(n,t)},recognition.onerror=function(e){console.log("ERR"),console.log(e.error)},recognition.onend=function(){$("#pendingOperations1").hide(),speachrecognitionon===!0&&recognition.start()},navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia,navigator.getUserMedia({audio:!0},function(e){recognition.start()},function(e){console.log("DENIED"),console.log(e)})}},speechToTextOff=function(){$("#buttonSpeachToText").removeClass("speachToTextOn"),speachrecognitionon=!1,recognition.stop()},setSortedMenuItems=function(e){chrome.storage.sync.get({sortedMenuItems:null},function(o){for(null!==o.sortedMenuItems&&o.sortedMenuItems.length>0?($("#menuMenu").append($("#toolbar > .sortable").not("#"+o.sortedMenuItems.join(",#"))),$("#customButtonsEndPoint").before($("#"+o.sortedMenuItems.join(",#")))):$("#menuMenu").append($("#toolbar > .sortable")),sortedMenuItemsReady=!0;25*$("#toolbar > .button").length>$(window).width()-20&&$("#customButtonsEndPoint").prev(".sortable").length>0;)$("#menuMenu").append($("#customButtonsEndPoint").prev(".sortable")),sortedMenuItemsReady=!1;"function"==typeof e&&e()})},buttonYesNoChange=function(e,o){o?$(e).removeClass("buttonNo").addClass("buttonYes"):$(e).removeClass("buttonYes").addClass("buttonNo")},updateColor=function(e,o){var t=color;"undefined"!=typeof o&&(t=o),"undefined"==typeof e&&(e=!0),"number"==typeof t&&(t=colors[t]),$(".globalBox").css("background-color",t),$("#buttonColor .dot").css("background-color",t),e&&saveNoteDelayed()},openNewNote=function(){chrome.runtime.sendMessage({func:"openNewNote",presetcolor:color,presetfont:{fontfamily:$("#noteBox").css("font-family"),fontsize:$("#noteBox").css("font-size")}})},closeThisNote=function(){var e=indexedDB.open("notes");e.onsuccess=function(e){db=e.target.result;var o=db.transaction("notes","readwrite"),t=o.objectStore("notes");t.index("by_id");t.put({id:note.id,removed:!0,date:(new Date).valueOf()}).onsuccess=function(e){chrome.runtime.sendMessage({func:"syncAllDelayed"}),save=!1,chrome.app.window.current().close()}},e.onerror=function(e){console.log("Error"),console.dir(e)}},setTextarea=function(){var e=$(window).height()-10,o=$(window).width()-10;e-=$("#notetextarea").position().top,$("#noteBox>*").css("height",e),$("#noteBox>*").css("width",o)},setFonts=function(){try{$("#noteBox").css("font-family",presetfont.fontfamily)}catch(e){}try{$("#noteBox").css("font-size",presetfont.fontsize)}catch(e){}note&&($("#noteBox").css("font-family",note.fontfamily),$("#noteBox").css("font-size",note.fontsize))},setMenuColors=function(){$("#menuColors").empty();for(var e in colors)$("#menuColors").append('<div class="button left colorbutton" data-color="'+colors[e]+'" style="" title="Set this color!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:'+colors[e]+';"></div></div>');$(".colorbutton").on("click",function(){color=$(this).data("color"),updateColor(),setMenuColors()}),$("#menuColors").append('<div class="button left colorbutton storedependent" id="BuyBgColors" style="" title="Get more colors!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:#000000; animation:multicolor 5s infinite linear"></div></div>'),$("#BuyBgColors").on("click",function(e){chrome.app.window.create("background/purchase.html#bgcolors",{innerBounds:{width:800,height:600}})}),purchasedelementslocal.color_palette_background&&($("#menuColors").append('<div class="button left buttoncolormap" id="openBackgroundPalette" style="" title="Choose from the palette!"></div>'),$("#openBackgroundPalette").on("click",function(e){openBackgroundPalette()}))},openBackgroundPalette=function(){$("#colorPalette").fadeIn(200),$("#colormap>area").on("click",function(e){color=$(this).attr("alt"),updateColor()}).on("mouseover",function(e){updateColor(!1,$(this).attr("alt"))}),$("#colormap").on("mouseout",function(e){updateColor()})},setSnippet=function(){document.title=$("#notetextarea").text().slice(0,40)},saveNoteDelayedTimeout=null,changesInProgress=!1,saveNoteDelayed=function(){changesInProgress=!0,$("#buttonClose").addClass("buttonclosesaveon-delayed").attr("title","Changes detected, stop typing to autosave :)"),clearTimeout(saveNoteDelayedTimeout),saveNoteDelayedTimeout=setTimeout(saveNote,700)},saveNote=function(e){$("#buttonClose").removeClass("buttonclosesaveon-delayed").attr("title","Saving!");var o=$("#notetextarea").html();if(sortedMenuItemsReady){var t=$(".toolbar > .sortable").toArray();for(var n in t)t[n]=t[n].id;chrome.storage.sync.set({sortedMenuItems:t},function(){setSortedMenuItems(function(){setWindowActions()})})}setSnippet();var s=indexedDB.open("notes");s.onsuccess=function(n){db=n.target.result;var s=db.transaction("notes","readwrite"),i=s.objectStore("notes"),c=i.index("by_id"),r=c.get(note.id);r.onsuccess=function(){if(void 0===r.result){newnote={},newnote.id=note.id,newnote.textarea=o,newnote.width=$(window).width(),newnote.height=$(window).height(),newnote.top=window.screenY,newnote.left=window.screenX,newnote.color=color,newnote.fontfamily=$("#noteBox").css("font-family"),newnote.fontsize=$("#noteBox").css("font-size"),newnote.date=(new Date).valueOf(),newnote.sortedMenuItems=t;var n=i.put(newnote);n.onsuccess=function(){note=newnote,markButtonCloseAsSaved(),chrome.runtime.sendMessage({func:"syncAllDelayed"}),e&&e()},changesInProgress=!1}else{var s=JSON.parse(JSON.stringify(r.result));if(r.result.textarea=o,r.result.width=$(window).width(),r.result.height=$(window).height(),r.result.top=window.screenY,r.result.left=window.screenX,r.result.color=color,r.result.fontfamily=$("#noteBox").css("font-family"),r.result.fontsize=$("#noteBox").css("font-size"),r.result.sortedMenuItems=t,isNotesContentSame(s,r.result)===!0)markButtonCloseAsSaved(),e&&e();else{r.result.date=(new Date).valueOf(),console.log("UPDATED");var n=i.put(r.result);n.onsuccess=function(){note=r.result,markButtonCloseAsSaved(),chrome.runtime.sendMessage({func:"syncAllDelayed"}),e&&e()}}changesInProgress=!1}}},s.onerror=function(e){console.log("Error"),console.dir(e)}},updateNote=function(){var e=indexedDB.open("notes");e.onsuccess=function(e){db=e.target.result;var o=db.transaction("notes","readwrite"),t=o.objectStore("notes"),n=t.index("by_id"),s=n.get(note.id);s.onsuccess=function(){if(s&&s.result){var e=s.result;changesInProgress===!1&&isNotesContentSame(e,note)!==!0&&e.date>note.date&&(note=e,$("#notetextarea").html(note.textarea),color=note.color,updateColor(),setTextarea(),setMenuColors(),setFonts(),setSnippet())}}},e.onerror=function(e){console.log("Error"),console.dir(e)}},checkStoreState=function(){chrome.storage.local.get("isStoreOpen",function(e){e&&setStoreState(e.isStoreOpen)})},setStoreState=function(e){e?$(".storedependent").removeClass("offcosnostore"):$(".storedependent").addClass("offcosnostore")},setPurchasedItems=function(){chrome.storage.sync.get("purchasedinapp",function(e){if(e&&e.purchasedinapp){var o=e.purchasedinapp;u_color=!1;for(var t in o)if(console.log(t),console.log(o[t]),o[t]===!0)if(/^color_box_background_.+/.test(t)!==!0)switch(t){case"color_palette_background":purchasedelementslocal.color_palette_background=!0,u_color=!0;break;case"color_background_454f56":addOptionalBgColor("#"+t.split("color_background_").join("")),u_color=!0;break;case"color_background_ff7171":addOptionalBgColor("#"+t.split("color_background_").join("")),u_color=!0;break;case"color_background_ff4fc1":addOptionalBgColor("#"+t.split("color_background_").join("")),u_color=!0;break;case"speech_to_text":$("#buttonSpeachToText").css("display","block")}else{if(inAppProducts[t]&&inAppProducts[t].colors)for(j in inAppProducts[t].colors)addOptionalBgColor(inAppProducts[t].colors[j]);u_color=!0}u_color&&setMenuColors()}})},addOptionalBgColor=function(e){-1===colors.indexOf(e)&&colors.push(e)};