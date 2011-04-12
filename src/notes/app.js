require.def("notes/app", ["notes/notes_list"], function(notes_list) {
  var NOTES_DIR = "/notes";
  var lastDelete;
  var notes = new notes_list.List

  function showElement(elem) {
    $(elem).removeClass("hide");
  }
  function hideElement(elem) {
    $(elem).addClass("hide");
  }

  function showWhatnow() {
    showElement(".infobox.whatnow");
  }
  function hideWhatnow() {
    hideElement(".infobox.whatnow");
  }
  function showInfo() {
    showElement(".infobox.info");
    $("a.info").text("hide");
  }
  function hideInfo() {
    hideElement(".infobox.info");
    $("a.info").text("info");
  }
  function hideInfoboxes() {
    hideElement(".infobox");
    $("a.info").text("info");
  }

  function updateCount() {
    $(".count").text(notes.count + " note.s");
  }

  function hideNoteboxes() {
    $("div.notebox:not(.hidden)").addClass("partly").addClass("hidden");
  }

  function showNoteboxes() {
    $("div.notebox:not(.deleted)").removeClass("partly").removeClass("hidden");
  }


  // FIXME: no more masonry, but isotope,
  //        new name needed
  function updateMasonry() {
    updateCount();
    if(notes.count == 0) {
      showWhatnow();
    } else {
      $(".notes").isotope({
        itemSelector: 'div.notebox:not(.hidden)',
        layoutMode: 'masonry',
      });
    }
  }
  window.updateMasonry = updateMasonry;
  notes_list.setCB(updateMasonry);

  var bindings = {
    info: function bindInfo() {
      $("a.info").click(function(e) {
        e.preventDefault();
        if($(".infobox.info.hide").length > 0) {
          hideNoteboxes();
          showInfo();
        } else {
          showNoteboxes();
          hideInfo();
        }
      });
    },

    noteDelete: function bindNoteDelete() {
      $("span.delete a").live("click", function(e) {
        e.preventDefault();
        var t = $(e.target);

        //$(".undo").show();
        var box = t.parent().parent();
        var id = box.attr("data-id");
        notes.deleteNote(id);
        console.log("removing", box);
        $(".notes").isotope('remove', box);
        $(".notes").isotope('reLayout');
        //box.remove();//addClass("hidden");
        //updateMasonry();
      });
    },

    newNote: function bindNewNote() {
      $("a.new").click(function(e) {
        e.preventDefault();

        if($("div.notebox:not(.hidden)").length == 0) {
          hideInfoboxes();
        }

        var n = notes.newNote();
        $(".notes").append(n.html).isotope('appended', n.html);

        updateMasonry();
      });
    }
  }


  return {
    start: function() {
      $(function() {
        $(".undo").hide()
        $("a.info").text("hide");
        updateCount();

        notes_list.connectDropbox(function(dropbox) {
          dropbox.getAccountInfo(function(acc_info) {
            $(".menulink.dropbox").text(acc_info.display_name);
            $(".menulink.dropbox").attr("title", "linked to your dropbox account");
          });

          dropbox.getDirectoryContents(NOTES_DIR, function(dir) {
            var l = dir.contents.length;
            var i = 0;
            if(l > 0) {
              hideInfoboxes();
            }
            _.each(dir.contents, function(file) {
              if(file.is_dir) {
                console.log("ignored directory '"+file.path+"'");
                l--;
                if(i >= l) updateMasonry();
                return;
              }
              if(file.mime_type != "text/plain") {
                console.log("ignored non-plain file '"+file.path+"'");
                l--;
                if(i >= l) updateMasonry();
                return;
              }

              var title = file.path.substr(NOTES_DIR.length+1);
              // strip '.txt'
              title = title.substr(0, title.length-4);
              dropbox.getFileContents(file.path, function(content) {
                i++;

                var n = notes.newNote(title, content, true);
                $(".notes").append(n.html);

                if(i == l) updateMasonry();
              });
            });
          });
        });

        _.each(bindings, function(fn, key) {
          fn();
        });
      });
    }
  };
});
