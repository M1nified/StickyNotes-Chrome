'use strict';
var WindowManager = {
  closeAllWindows : function(){
    let allwindows = chrome.app.window.getAll();
    for(let win of windows){
      ((thewindow)=>{
        if(typeof thewindow.contentWindow.saveNote === 'function'){
          thewindow.contentWindow.saveNote(function(){
            thewindow.close();
          })
        }else{
          thewindow.close();
        }
      })(win)
    }
  },
  alwaysOnTopSwap : function(){//swap and return new state
    let is = chrome.app.window.current().isAlwaysOnTop();
    chrome.app.window.current().setAlwaysOnTop(!is);
    return !is;
  },
  openLink : function(link = null){
    let url = $(this).attr("href") || link;
    if(!url){
      return false;
    }
    chrome.app.window.create(url,{innerBounds:{width:800,height:600}});
    return true;
  }
}
