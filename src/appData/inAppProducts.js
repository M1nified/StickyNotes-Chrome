var inAppProducts = [];

inAppProducts["color_palette_background"]={sku:"color_palette_background",title:"Palette of 127 background colors",description:'<img src="../img/colormap.png">'};

inAppProducts["color_box_background_purple_1"]={sku:"color_box_background_purple_1",title:"Background box purple",description:'<div class="colorbox5" style="background: -webkit-linear-gradient(left, #9900cc 0%,#9900cc 20%, #cc00ff 20%, #cc00ff 40%, #cc33ff 40%,#cc33ff 60%, #cc66ff 60%,#cc66ff 80%, #cc99ff 80%, #cc99ff 100%);"></div>',colors:['#9900cc','#cc00ff','#cc33ff','#cc66ff','#cc99ff']}
inAppProducts["color_box_background_blue_1"]={sku:"color_box_background_blue_1",title:"Background box blue",description:'<div class="colorbox5" style="background: -webkit-linear-gradient(left, #0000ff 0%, #0000ff 20%,#0066ff 20%,#0066ff 40%, #0099ff 40%,#0099ff 60%, #3399ff 60%,#3399ff 80%, #6699ff 80%, #6699ff 100%);"></div>',colors:['#0000ff','#0066ff','#0099ff','#3399ff','#6699ff']}
inAppProducts["color_box_background_green_1"]={sku:"color_box_background_green_1",title:"Background box green",description:'<div class="colorbox5" style="background: -webkit-linear-gradient(left, #006600 0%,#006600 20%, #009933 20%, #009933 40%, #33cc33 40%,#33cc33 60%, #66ff66 60%,#66ff66 80%, #99ff99 80%, #99ff99 100%);"></div>',colors:['#006600','#009933','#33cc33','#66ff66','#99ff99']}
inAppProducts["color_box_background_pink_1"]={sku:"color_box_background_pink_1",title:"Background box pink",description:'<div class="colorbox5" style="background: -webkit-linear-gradient(left, #cc0099 0%,#cc0099 20%, #ff33cc 20%, #ff33cc 40%, #ff66ff 40%,#ff66ff 60%, #ff99ff 60%,#ff99ff 80%, #ffccff 80%, #ffccff 100%);"></div>',colors:['#cc0099','#ff33cc','#ff66ff','#ff99ff','#ffccff']}
inAppProducts["color_box_background_red_1"]={sku:"color_box_background_red_1",title:"Background box red",description:'<div class="colorbox5" style="background: -webkit-linear-gradient(left, #800000 0%,#800000 20%, #990000 20%, #990000 40%, #cc0000 40%,#cc0000 60%, #ff0000 60%,#ff0000 80%, #ff5050 80%, #ff5050 100%);"></div>',colors:['#800000','#990000','#cc0000','#ff0000','#ff5050']}


/*inAppProducts["color_background_454f56"]={sku:"color_background_454f56",title:"Background color: grey 1",description:'<span style="margin-left:5px;display:inline-block;width:100px;height:100px;background-color:#454f56; border-radius:100%;"></span>'};
inAppProducts["color_background_ff7171"]={sku:"color_background_ff7171",title:"Background color: red 1",description:'<span style="margin-left:5px;display:inline-block;width:100px;height:100px;background-color:#ff7171; border-radius:100%;"></span>'};

New background color for your notes.
Color id: 003366

inAppProducts["color_background_ff4fc1"]={sku:"color_background_ff4fc1",title:"Background color: pink 1",description:'<span style="margin-left:5px;display:inline-block;width:100px;height:100px;background-color:#ff4fc1; border-radius:100%;"></span>'};*/

/*var c = [
	{c:"003366"},
	{c:"336699"},
	{c:"3366cc"},
	{c:"003399"},
	{c:"000099"},
	{c:"0000cc"},
	{c:"000066"},
	{c:"006666"},
	{c:"006699"},
	{c:"0099cc"},
	{c:"0066cc"},
	{c:"0033cc"},
	{c:"0000ff"},
	{c:"3333ff"},
	{c:"333399"},
	{c:"669999"},
	{c:"009999"},
	{c:"33cccc"},
	{c:"00ccff"},
	{c:"0099ff"},
	{c:"0066ff"},
	{c:"3366ff"},
	{c:"3333cc"},
	{c:"666699"},
	{c:"339966"},
	{c:"00cc99"},
	{c:"00ffcc"},
	{c:"00ffff"},
	{c:"33ccff"},
	{c:"3399ff"},
	{c:"6699ff"},
	{c:"6666ff"},
	{c:"6600ff"},
	{c:"6600cc"},
	{c:"339933"},
	{c:"00cc66"},
	{c:"00ff99"},
	{c:"66ffcc"},
	{c:"66ffff"},
	{c:"66ccff"},
	{c:"99ccff"},
	{c:"9999ff"},
	{c:"9966ff"},
	{c:"9933ff"},
	{c:"9900ff"},
	{c:"006600"},
	{c:"00cc00"},
	{c:"00ff00"},
	{c:"66ff99"},
	{c:"99ffcc"},
	{c:"ccffff"},
	{c:"ccccff"},
	{c:"cc99ff"},
	{c:"cc66ff"},
	{c:"cc33ff"},
	{c:"cc00ff"},
	{c:"9900cc"},
	{c:"003300"},
	{c:"009933"},
	{c:"33cc33"},
	{c:"66ff66"},
	{c:"99ff99"},
	{c:"ccffcc"},
	{c:"ffffff"},
	{c:"ffccff"},
	{c:"ff99ff"},
	{c:"ff66ff"},
	{c:"ff00ff"},
	{c:"cc00cc"},
	{c:"660066"},
	{c:"336600"},
	{c:"009900"},
	{c:"66ff33"},
	{c:"99ff66"},
	{c:"ccff99"},
	{c:"ffffcc"},
	{c:"ffcccc"},
	{c:"ff99cc"},
	{c:"ff66cc"},
	{c:"ff33cc"},
	{c:"cc0099"},
	{c:"993399"},
	{c:"333300"},
	{c:"669900"},
	{c:"99ff33"},
	{c:"ccff66"},
	{c:"ffff99"},
	{c:"ffcc99"},
	{c:"ff9999"},
	{c:"ff6699"},
	{c:"ff3399"},
	{c:"cc3399"},
	{c:"990099"},
	{c:"666633"},
	{c:"99cc00"},
	{c:"ccff33"},
	{c:"ffff66"},
	{c:"ffcc66"},
	{c:"ff9966"},
	{c:"ff6666"},
	{c:"ff0066"},
	{c:"cc6699"},
	{c:"993366"},
	{c:"999966"},
	{c:"cccc00"},
	{c:"ffff00"},
	{c:"ffcc00"},
	{c:"ff9933"},
	{c:"ff6600"},
	{c:"ff5050"},
	{c:"cc0066"},
	{c:"660033"},
	{c:"996633"},
	{c:"cc9900"},
	{c:"ff9900"},
	{c:"cc6600"},
	{c:"ff3300"},
	{c:"ff0000"},
	{c:"cc0000"},
	{c:"990033"},
	{c:"663300"},
	{c:"996600"},
	{c:"cc3300"},
	{c:"993300"},
	{c:"990000"},
	{c:"800000"},
	{c:"993333"}
];
for(var i in c){
	inAppProducts["color_background_"+c[i].c] = {sku:"color_background_"+c[i].c,title:"Background color",description:'<span style="margin-left:5px;display:inline-block;width:100px;height:100px;background-color:#'+c[i].c+'; border-radius:100%;"></span>'};
}*/

inAppProducts["speech_to_text"]={sku:"speech_to_text",title:"Speech recognition.",description:'<img src="../img/microphone.jpg" style="float: left;margin-right: 15px;"><p style="font-size: 1.3em;">Create notes using your voice!<br><br>List of supported languages:</p><ul style="list-style: square;padding-left: 35px;max-height: 180px;overflow: auto;font-size: 1.2em;"><li>Afrikaans</li><li>Bahasa Indonesia</li><li>Bahasa Melayu</li><li>Català</li><li>Čeština</li><li>Deutsch</li><li>English (Australia)</li><li>English (Canada)</li><li>English (India)</li><li>English (New Zealand)</li><li>English (South Africa)</li><li>English (United Kingdom)</li><li>English (United States)</li><li>Español (Argentina)</li><li>Español (Bolivia)</li><li>Español (Chile)</li><li>Español (Colombia)</li><li>Español (Costa Rica)</li><li>Español (Ecuador)</li><li>Español (El Salvador)</li><li>Español (España)</li><li>Español (Estados Unidos)</li><li>Español (Guatemala)</li><li>Español (Honduras)</li><li>Español (México)</li><li>Español (Nicaragua)</li><li>Español (Panamá)</li><li>Español (Paraguay)</li><li>Español (Perú)</li><li>Español (Puerto Rico)</li><li>Español (República Dominicana)</li><li>Español (Uruguay)</li><li>Español (Venezuela)</li><li>Euskara</li><li>Français</li><li>Galego</li><li>Hrvatski</li><li>IsiZulu</li><li>Íslenska</li><li>Italiano (Italia)</li><li>Italiano (Svizzera)</li><li>Magyar</li><li>Nederlands</li><li>Norsk bokmål</li><li>Polski</li><li>Português (Brasil)</li><li>Português (Portugal)</li><li>Română</li><li>Slovenčina</li><li>Suomi</li><li>Svenska</li><li>Türkçe</li><li>български</li><li>Pусский</li><li>Српски</li><li>한국어</li><li>中文 (普通话 (中国大陆))</li><li>中文 (普通话 (香港))</li><li>中文 (中文 (台灣))</li><li>中文 (粵語 (香港))</li><li>日本語</li><li>Lingua latīna</li></ul>'};
