'use strict';

var InTheNote = InTheNote || {
  share: function share(evt) {
    chrome.storage.sync.get("id_owner", function (data) {
      if (data && data.id_owner) {
        var id_owner = data.id_owner;
        var newnote = {};
        newnote.id = note.id;
        newnote.textarea = $("#notetextarea").html();
        newnote.color = color;
        newnote.fontfamily = $("#noteBox").css("font-family");
        newnote.fontsize = $("#noteBox").css("font-size");
        newnote.date = new Date().valueOf();

        $.post("http://prowebject.com/stickynotes/sharebox/share.php", {
          id_owner: id_owner,
          note: newnote
        }, function (result) {
          if (result) {
            var result = JSON.parse(result);

            chrome.app.window.create('/background/shared.html', { id: note.id + "_shared", innerBounds: { width: 256, height: 320, maxWidth: 256, maxHeight: 320 } }, function (createdWindow) {
              createdWindow.contentWindow.info = result;
              try {
                createdWindow.contentWindow.update();
              } catch (e) {}
            });
          }
        });
      }
    });
  }
};