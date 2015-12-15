'use strict';
console.log('------------\n\r','BABEL');
var babel = require("babel-core");
var fs = require("fs");

var produkcja = '../A_PRODUKCJA/';
var pliki = [
  "background/background.js"
  ,"class/IndexedDB.js"
  ,"class/Notes.js"
  ,"class/Sync.js"
  ,"class/Store.js"
];

for(let f of pliki){
  console.log(f);
  babel.transformFile(f, {
    comments:false,
    babelrc : true,
    auxiliaryCommentBefore : 'ProWebJect - Michal Gora'
  }, function (err, result) {
    // result; // => { code, map, ast }
    if(err){
      console.log(err);
    }else{
      fs.writeFile(produkcja+f,result.code,{flag:'w+'},function(err){console.log(err);})
    }
  });
}
console.log('------------');
