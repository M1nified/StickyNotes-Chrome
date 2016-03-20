'use strict';
var InTheNote = InTheNote || {
  changesInProgress : false,
  saveDelayedTimeout : null,
  saveDelayed : function(){
    this.changesInProgress = true;
  	$("#buttonClose").addClass("buttonclosesaveon-delayed").attr('title','Changes detected, stop typing to autosave :)');
  	clearTimeout(this.saveDelayedTimeout);
  	this.saveDelayedTimeout = setTimeout(this.save.bind(this),700);
  }
  ,save : function(){
    let promise = new Promise((resolve,reject)=>{
      $("#buttonClose").removeClass("buttonclosesaveon-delayed").attr('title','Saving!');
      let textarea = $("#notetextarea").html();
      if(sortedMenuItemsReady){
    		var sortedMenuItems = $(".toolbar > .sortable").toArray();
    		for(let i in sortedMenuItems){
    			sortedMenuItems[i] = sortedMenuItems[i].id;
    		}
    		chrome.storage.sync.set({sortedMenuItems:sortedMenuItems},()=>{
          this.setSortedMenuItems().then(()=>{
            this.setWindowActions();
          });
        });
    	}
      setSnippet();
      IndexedDB.getNote(note.id).then((oldnote)=>{
        let cleannote = {
          id: note.id,
          textarea: textarea,
          width: $(window).width(),
          height: $(window).height(),
          top: window.screenY,
          left: window.screenX,
          color: color,
          fontfamily: $("#noteBox").css("font-family"),
          fontsize: $("#noteBox").css("font-size"),
          date: new Date().valueOf(),
          sortedMenuItems: sortedMenuItems
        };
        let newnote = null;
        if(oldnote === undefined){
          newnote = cleannote;
        }else{
          newnote = JSON.parse(JSON.stringify(oldnote));
          for(let key of Object.keys(newnote)){
            if(key !== 'date' && cleannote[key] !== undefined){
              newnote[key] = cleannote[key]
            }
          }
          if(Note.isContentTheSame(newnote,oldnote)===true){
            markButtonCloseAsSaved();
            newnote = null;
            resolve();
          }else{
            newnote.date = new Date().valueOf();
            console.log("UPDATE");
          }
        }
        this.changesInProgress = false;
        if(newnote){
          IndexedDB.putNotes([newnote]).then(()=>{
            console.log("UPDATED");
            note = newnote;
            markButtonCloseAsSaved();
            chrome.runtime.sendMessage({func:"syncAllDelayed"});
            resolve();
          },()=>{
            reject();
          })
        }else{
          resolve();
        }
      });
    });
    return promise;
  }
  ,update : function(){
    let promise = new Promise((resolve,reject)=>{
      IndexedDB.getNote(note.id).then((newnote)=>{
        if(changesInProgress === false && Note.isNotesContentSame(newnote,note) !== true && newnote.date > note.date){
          note = newnote;
          $("#notetextarea").html(note.textarea);
          color = note.color;
          updateColor();
          setTextarea();
          InTheNote.setMenuColors();
          setFonts();
          setSnippet();
        }
      });
    });
    return promise;
  }
  ,share : function(evt){
    chrome.storage.sync.get("id_owner",(data)=>{
      // console.log('share id_owner data',data);
      if(data && data.id_owner){
        var id_owner = data.id_owner;
        var newnote = {};
        newnote.id = note.id;
        newnote.textarea = $("#notetextarea").html();
        newnote.color = color;
        newnote.fontfamily = $("#noteBox").css("font-family");
        newnote.fontsize = $("#noteBox").css("font-size");
        newnote.date = new Date().valueOf();
        // console.log('share note',newnote);
        $.post("http://prowebject.com/stickynotes/sharebox/share.php",{
          id_owner:id_owner,
          note:newnote
        },function(result){
          // console.log('share result',result);
          if(result){
            var result = JSON.parse(result);
            // console.log(result);
            chrome.app.window.create('/background/shared.html',{id:note.id+"_shared",innerBounds:{width:256,height:320,maxWidth:256,maxHeight:320}},function(createdWindow){
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
  }
  ,remove : function(){
    let promise = new Promise((resolve,reject)=>{
      Note.remove(note.id).then(()=>{
        chrome.runtime.sendMessage({func:'syncAllDelayed'});
        save = false;
        chrome.app.window.current().close();
        resolve();
      });
    });
    return promise;
  }
  ,setMenuColors : function(){
    let menu = $("#menuColors");
    //spawn colors
    menu.empty();
    for(let color_single of colors){
      menu.append('<div class="button left colorbutton" data-color="'+color_single+'" style="" title="Set this color!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:'+color_single+';"></div></div>')
    }
    $(".colorbutton").on('click',function(){
      color = $(this).data("color");
      updateColor();
      InTheNote.setMenuColors();
    });
    //add store button
    menu.append('<div class="button left colorbutton storedependent" id="BuyBgColors" style="" title="Get more colors!"><div class="dot" style="width:13px;height:13px;margin:6px;background-color:#000000; animation:multicolor 5s infinite linear"></div></div>');
    $("#BuyBgColors").on('click',function(evt){
      chrome.app.window.create("store/purchase.html#bgcolors",{
        innerBounds:{
          width:800,
          height:600
        }
      });
    });
    //spawn color palette
    if(purchasedelementslocal.color_palette_background){
      menu.append('<div class="button left buttoncolormap" id="openBackgroundPalette" style="" title="Choose from the palette!"></div>');
      $("#openBackgroundPalette").on('click',function(evt){
        openBackgroundPalette();
      });
    }
  }
  ,addOptionalBgColor : function(color){
    if(colors.indexOf(color)===-1){
      colors.push(color);
      return true;
    }
    return false;
  }
  ,setPurchasedItems : function(){
    let promise = new Promise((resolve,reject)=>{
      chrome.storage.sync.get("purchasedinapp",(data)=>{
        if(data && data.purchasedinapp){
          let items = data.purchasedinapp;
          let u_color = false;//should I update available colors
          for(let i in items){
            // console.log(i);
            // console.log(items[i]);
            if(items[i]!==true){
              continue;
            }
            if(/^color_box_background_.+/.test(i) === true){
              if(inAppProducts[i] && inAppProducts[i].colors){
                for(let color of inAppProducts[i].colors){
                  this.addOptionalBgColor(color);
                }
              }
              u_color = true;
              continue;
            }
            switch(i){
              case "color_palette_background":
              purchasedelementslocal["color_palette_background"] = true;
              u_color = true;
              break;


              //czy one wgl dzialaja?
              case "color_background_454f56":
      				this.addOptionalBgColor("#"+i.split("color_background_").join(""));
      				u_color = true;
      				break;
      				case "color_background_ff7171":
      				this.addOptionalBgColor("#"+i.split("color_background_").join(""));
      				u_color = true;
      				break;
      				case "color_background_ff4fc1":
      				this.addOptionalBgColor("#"+i.split("color_background_").join(""));
      				u_color = true;
      				break;


              case "speech_to_text":
              $("#buttonSpeechToText").css("display","block");
              break;
            }
          }
          if(u_color){
            this.setMenuColors();
          }
        }
      });
    });
    return promise;
  }
  ,setSortedMenuItems : function(){
    let promise = new Promise((resolve,reject)=>{
      chrome.storage.sync.get("sortedMenuItems",(data)=>{
        let menu = $("#menuMenu");
        if(data.sortedMenuItems !== null && data.sortedMenuItems.length > 0){
          menu.append($("#toolbar > .sortable").not("#"+data.sortedMenuItems.join(",#")));
          $("#customButtonsEndPoint").before($("#"+data.sortedMenuItems.join(",#")));
        }else{
          menu.append($("#toolbar > .sortable"));
        }
        sortedMenuItemsReady = true;
        while($("#toolbar > .button").length * 25 > ($(window).width()-20) && $("#customButtonsEndPoint").prev(".sortable").length > 0){
          menu.append($("#customButtonsEndPoint").prev(".sortable"));
          sortedMenuItemsReady = false;
        }
        resolve();
      });
    });
    return promise;
  }
  ,setWindowActions : function(){
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
  ,print : function(){
    console.log('print')
    let win = chrome.app.window.current();
    if(win.contentWindow.innerWidth < 500 || win.contentWindow.innerHeight < 500){
      win.resizeTo(500,500);
    }
    print();
  }
};
