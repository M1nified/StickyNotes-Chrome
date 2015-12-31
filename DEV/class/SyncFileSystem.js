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
    // console.log(fileSystem);
    var promise = new Promise((resolve,reject)=>{
      var dirReader = fileSystem.root.createReader();
      var fileEntries = [];
      var readEntries = function(){
        // console.log(fileEntries);
        dirReader.readEntries((results)=>{
          // console.log(results);
          if(!results.length){
            // console.log(1);
            // console.log(fileEntries);
            resolve(fileEntries);
            // useFileEntries(fileEntries.sort(),notesoffline);
          }else{
            // console.log(2);
            // useFileEntries(results.sort(),notesoffline);
            fileEntries = fileEntries.concat(results);
            // console.log(fileEntries);
            readEntries();
          }
        },(e)=>{
          console.error(e);
          reject();
        });
      };
      readEntries();
    })
    return promise;
  },
  getNotesFromEntries : function(fileEntries){
    let promise = new Promise((resolve,reject)=>{
      // console.log('PROMISE',this);
      let notes = [];
      let readstacksize = 0;
      let loopedcount = 0;
      if(!fileEntries || fileEntries.length===0){
        resolve([]);
      }else{
        fileEntries.forEach((fileEntry,index)=>{
          loopedcount++;
          if(/note_(\w|_)+/.test(fileEntry.name)){
            readstacksize++;
            fileEntry.file((file)=>{
              let reader = new FileReader();
              // console.log(readstacksize);
              reader.onloadend = function(event){
                readstacksize--;
                // console.log(this);
                let json=null;
                try {
                  json = JSON.parse(this.result);
                } catch (e) {
                  json = null;
                }
                if(json!==null){
                  notes.push(json);
                  // console.log('x: ',notes);
                }
                // console.log(index);
                if(loopedcount===fileEntries.length && readstacksize===0){
                  resolve(notes);
                }
              }
              reader.onerror = function(event){
                readstacksize--;
                console.error('FileReader onerror triggered: E10',event);
                if(loopedcount===fileEntries.length && readstacksize===0){
                  resolve(notes);
                }
              }
              reader.readAsText(file);
            })
          }else{
            if(loopedcount===fileEntries.length && readstacksize===0){
              resolve(notes);
            }
          }
        })
      }
    })
    return promise;
  },
  putNotes : function(notes){
    this.requestFileSystem().then((fs)=>{
      // console.log(notes);
      for(let i in notes){
        let note = notes[i];
        // console.log("PUT NOTE: ",note);
        (function(note){
          fs.root.getFile(`note_${note.id}`,{create:true},(fileEntry)=>{
            // if(Note.isRemoved(note)){
            //   fileEntry.remove(()=>{
            //     //Success
            //   },(e)=>{
            //     console.error('fileEntry.remove() ERROR:',e);
            //   });//errors?
            // }else{
              this.writeToFile(fileEntry,JSON.stringify(note));
            // }
          },(err)=>{
            console.error('fs.root.getFile',err);
          })
        }).call(this,note)
      }
    })
  },
  writeToFile : function(fileEntry,content){
    // console.log('writeToFile',fileEntry);
    fileEntry.createWriter((fileWriter)=>{
      let truncated = false;
      fileWriter.onwriteend = function(e){
        if(!truncated){
          this.truncate(this.position)
          truncated = true;
        }
      }
      fileWriter.onerror = function(error){
        console.error('writeToFile Failed',error);
      }
      let blob = new Blob([content],{type:'text/plain'});
      fileWriter.write(blob)
    },function createWriterError(error){
      console.error('createWriter Failed',error);
    })
  }
}
