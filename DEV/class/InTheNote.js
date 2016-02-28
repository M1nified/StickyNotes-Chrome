'use strict';
var InTheNote = InTheNote || {
  changesInProgress : false,
  saveDelayedTimeout : null,
  saveDelayed : function(){
    this.changesInProgress = true;
  	$("#buttonClose").addClass("buttonclosesaveon-delayed").attr('title','Changes detected, stop typing to autosave :)');
  	clearTimeout(this.saveDelayedTimeout);
  	this.saveDelayedTimeout = setTimeout(this.save,700);
  },
  save : function(){
    let promise = new Promise((resolve,reject)=>{
      $("#buttonClose").removeClass("buttonclosesaveon-delayed").attr('title','Saving!');
      let textarea = $("#notetextarea").html();
      if(sortedMenuItemsReady){
    		var sortedMenuItems = $(".toolbar > .sortable").toArray();
    		for(let i in sortedMenuItems){
    			sortedMenuItems[i] = sortedMenuItems[i].id;
    		}
    		chrome.storage.sync.set({sortedMenuItems:sortedMenuItems},function(){setSortedMenuItems(function(){setWindowActions();});});
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
      })
    })
    return promise;
  },
  share : function(evt){
    chrome.storage.sync.get("id_owner",function(data){
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
  },
  remove : function(){
    let promise = new Promise((resolve,reject)=>{
      Note.remove(note.id).then(()=>{
        chrome.runtime.sendMessage({func:'syncAllDelayed'});
        save = false;
        chrome.app.window.current().close();
      });
    });
    return promise;
  }
};
