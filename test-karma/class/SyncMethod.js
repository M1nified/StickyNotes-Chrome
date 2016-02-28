'use strict';
describe('SyncMethod cmp',function(){
  let sync = {};

  beforeEach(function(){
    sync.online = [
      {
        id : 'note_123',
        textarea : "Online",
        color : "#123123",
        fontfamily : "Calibri",
        fontsize : 12,
        removed : false,
        date : 5,
        last_update : 5
      }
    ];
    sync.offline = [
      {
        id : 'note_123',
        textarea : "Offline",
        color : "#123123",
        fontfamily : "Calibri",
        fontsize : 12,
        removed : false,
        date : 5,
        last_update : 5
      }
    ];
    // console.log(sync.final)
  })

  it("has the same time",function(){
    SyncMethod.cmp.call(sync);
    expect(sync.final["note_123"]).toBe(sync.offline[0]);
  })

  it("has newer online version",function(){
    sync.offline[0].date = 4;
    sync.offline[0].last_update = 4;
    SyncMethod.cmp.call(sync);
    expect(sync.final["note_123"]).toBe(sync.online[0]);
  })

  it("has newer offline version",function(){
    sync.online[0].date = 4;
    sync.online[0].last_update = 4;
    SyncMethod.cmp.call(sync);
    expect(sync.final["note_123"]).toBe(sync.offline[0]);
  })

  it("has offline.date>online.date && offline.last_update=online.last_update",()=>{
    sync.offline[0].date = 5;
    sync.online[0].date = 4;
    sync.offline[0].last_update = 4;
    sync.online[0].last_update = 4;
    SyncMethod.cmp.call(sync);
    expect(sync.final["note_123"]).toBe(sync.offline[0])
  })
  it("has offline.date<online.date && offline.last_update=online.last_update",()=>{
    sync.offline[0].date = 3;
    sync.online[0].date = 4;
    sync.offline[0].last_update = 4;
    sync.online[0].last_update = 4;
    SyncMethod.cmp.call(sync);
    expect(sync.final["note_123"]).toBe(sync.online[0])
  })
})
