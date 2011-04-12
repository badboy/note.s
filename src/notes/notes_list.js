require.def("notes/notes_list", ['dropbox/dropbox', 'notes/helpers'], function(Dropbox, helpers) {
  window.helpers = helpers;
  var NEW_NOTE_TITLE = "New note";
  var NEW_NOTE_TEXT  = "new note…";
  var NEW_NOTE_DIV = '<div class="notebox"><span class="delete"><a href="#delete" title="delete this note">✖</a></span><h1></h1><p></p></div>';
  var NOT_ALLOWED = /[\/\|><:?*";]/;

  var new_note_div = _.template('<div class="notebox" data-id="<%= note.id %>"><span class="delete"><a href="#delete" title="delete this note">✖</a></span><h1><%= note.title %></h1><p><%= note.text %></p></div>');

  var Config = {
    title: {
      onblur: "submit",
      data: function(value, settings) {
        return helpers.htmlDecode(value);
      }
    },
    text:  {
      onblur: "submit",
      type: "textarea",
      data: function(value, settings) {
        return helpers.htmlDecode(value.replace(/<br>\n/g, "\n"));
      }
    }
  }

  var consumerKey = "41aq9ossko6qls5";
  var consumerSecret = "je7d84cnnkf1gcu";
  var dropbox;
  var connectDropbox = function(callback) {
    dropbox = new Dropbox(consumerKey, consumerSecret);

    dropbox.authorize((function() {
      if (callback) {
        callback.call(this, dropbox);
        window.dropbox = dropbox;
      }
    }).bind(this));

    window.dropbox = dropbox;
  };

  // FIXME: now using istope, this should be done another way
  // we need to update masonry after in-place edit
  var updateMasonry;
  var setCB = function(upM) {
    updateMasonry = upM;
  }

  function List() {
    this.notes = {};
    this.count = 0;

    var ctx = this;

    this.titleExists = function titleExists(title, id) {
      var ret = false;
      _.each(ctx.notes, function(obj) {
        if(obj.title == title && obj.id != id)
          ret = true;
      });

      return ret;
    }

    this.editCB = function editCallback(value, settings) {
      updateMasonry();

      var id = $(this).parent().attr("data-id");
      var oldTitle = ctx.notes[id].title;
      var needs_sync = false;

      if(this.tagName == "H1") { // update title
        if(value != oldTitle)
          needs_sync = true;

        if(NOT_ALLOWED.test(value)) {
          return oldTitle;
        }

        // if title exists, append random value
        // not collision-proof
        if(ctx.titleExists(value, id)) {
          value = value + " " + (Math.random()*1000|0);
        }

        value = helpers.htmlEncode(value);
        ctx.notes[id].title = value;
      } else {
        value = helpers.htmlEncode(value).replace(/\n/g, "<br>\n");

        // text changed?
        if(value != ctx.notes[id].text)
          needs_sync = true;

        ctx.notes[id].text = value;
      }

      // delay sync
      //console.log("needs_sync", needs_sync);
      if(needs_sync) {
        setTimeout(function() {
          ctx.syncNote(id);
        }, 500);
      }
      return value;
    };
  }

  List.prototype = {
    newNote: function newNote(title, text, synced) {
      var note = {}
      // pseudo-random, not collision-proofed
      note.id     = Math.random()*1e5|0;
      note.title  = title || NEW_NOTE_TITLE;
      note.text   = (text  || NEW_NOTE_TEXT).replace(/\n/g, "<br>\n");
      //console.log(note.text);
      note.synced = synced || false;

      note.html = $(new_note_div({
        note: note,
        h: helpers.htmlEncode
      }));
      note.html.find("h1").editable(this.editCB, Config.title);
      note.html.find("p").editable(this.editCB, Config.text);

      //if(note.synced)
        //note.html.addClass('synced');

      this.notes[note.id] = note;
      this.count++;

      return note;
    },

    syncNote: function(id, callback) {
      var note = this.notes[id];
      if(note) {
        //if(dropbox.isAuthorized) {
          //var filename = "/notes/" + note.title + ".txt";
          //dropbox.putFileContents(filename, note.text, function(data) {
            //note.synced = true;
            console.log("'" + note.title + "' uploaded!");
            //if(callback)
              //callback();
          //});
        //}
      }
    },

    deleteNote: function(id, callback) {
      var note = this.notes[id];
      if(note) {
        if(dropbox.isAuthorized) {
          var filename = "/notes/" + note.title + ".txt";
          // do not delete, we're still developing
          // I should use a sandbox, right?
          //dropbox.deletePath(filename, function(data) {
            console.log("'" + note.title + "' deleted!");
            if(callback)
              callback();
          //});
        }

        delete this.notes[id];
        this.count--;
        return note;
      }
      return false;
    }
  };

  return {
    List: List,
    setCB: setCB,
    connectDropbox: connectDropbox
  }
});
