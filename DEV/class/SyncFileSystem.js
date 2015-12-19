'use strict';
var SyncFileSystem = {
  requestFileSystem : function(){
    var promise = new Promise((resolve,reject)=>{
      try{
        chrome.syncFileSystem.requestFileSystem((fs)=>{
          if(chrome.runtime.lastError || !fs){
            reject();
          }else{
            resolve(fs);
          }
        })
      }catch(e){
        console.log(e);
        reject();
      }
    })
    return promise;
  },
  getFileEntries : function(fileSystem){
    var promise = new Promise((resolve,reject)=>{
      var dirReader = fs.root.createReader();
    	var fileEntries = [];
    	var readEntries = function(){
    		dirReader.readEntries((results)=>{
    			if(!results.length){
            resolve(fileEntries);
    				// useFileEntries(fileEntries.sort(),notesoffline);
    			}else{
    				// useFileEntries(results.sort(),notesoffline);
    				fileEntries.concat(toArray(results));
    				readEntries();
    			}
    		},(e)=>{
          console.log(e);
          reject();
        });
    	};
    	readEntries();
    })
    return promise;
  }
}
