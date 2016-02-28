'use strict';
describe('Notes',function(){
  let note1 = null;
  let note2 = null;

  beforeEach(function(){
    note1 = {
      textarea : "Jakas zawartosc",
      color : "#123123",
      fontfamily : "Calibri",
      fontsize : 12,
      removed : true
    };
    note2 = {
      textarea : "Jakas zawartosc",
      color : "#123123",
      fontfamily : "Calibri",
      fontsize : 12,
      removed : false
    };
  })

  it("can be the same",function(){
    expect(Note.isContentTheSame(note1,note2)).toBe(true);
  })

  it("can have different colors",function(){
    note2.color = "inne";
    expect(Note.isContentTheSame(note1,note2)).not.toBe(true);
    expect(Note.isContentTheSame(note1,note2)).not.toBe({color:true});
  })

  it("can be removed",()=>{
    note2.removed = true;
    expect(Note.isContentTheSame(note1,note2)).toBe(true);
    expect(Note.isRemoved(note2)).toBe(true);
  })
})
