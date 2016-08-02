class Note{
  static isContentTheSame(note1,note2){
    //skips id, date, window settings, sorted menu items, removed
  	var arethesame = true;
  	var differences = {};
  	if(note1.textarea !== note2.textarea){
  		differences.textarea = true;
  	}
  	if(note1.color !== note2.color){
  		differences.color = true;
  	}
  	if(note1.fontfamily !== note2.fontfamily){
  		differences.fontfamily = true;
  	}
  	if(note1.fontsize !== note2.fontsize){
  		differences.fontsize = true;
  	}
  	if(Object.keys(differences).length==0){
  		return true;
  	}else{
  		return differences;
  	}
  }
  isRemoved(){
    Note.isRemoved(this)
  }
  static isRemoved(note){
    return note && (note.removed === true || note.removed === "true");
  }
  static remove(id){
    return IndexedDB.putNotes([{
      id:note.id,
      removed:true,
      date:new Date().valueOf()
    }]);
  }
}
