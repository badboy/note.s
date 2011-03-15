$(function() {
  var NEW_NOTE_TITLE = 'New note';
  var NEW_NOTE_TEXT  = 'new note…';

  var NEW_NOTE_DIV = '<div class="notebox"><span class="delete"><a href="#delete">✖</a></span><h1></h1><p></p></div>';

  var lastDelete;

  $(".notebox").remove();
  $(".undo").hide();

  var updateMasonry = function(n) {
    var l = $('div.notebox:not(.hidden)').length;
    $(".count").text(l + ' note.s');
    if(l == 0) {
      $('.infobox').show();
    } else {
      if(n) {
        console.log("appendContent");
        $('.notes').masonry({
          appendContent: n
        });
      } else {
        $('.notes').masonry({
          singleMode: true,
          itemSelector: 'div.notebox:not(.hidden)'
        });
      }
    }
  }

  updateMasonry();

  var editCallback = function(value, settings) {
    updateMasonry();

    return value;
  };

  $('.notebox p').editable(editCallback, { type: 'textarea', onblur: 'submit' });
  $('.notebox h1').editable(editCallback, { onblur: 'submit' });

  $("a.new").click(function(e) {
    e.preventDefault();
    var n;

    if($('div.notebox:not(.hidden)').length == 0) {
      $('.infobox').hide();
      n = $(NEW_NOTE_DIV);
    } else {
      n = $("div.notebox:not(.hidden)").first().clone();
    }

    console.log(n);

    n.removeClass('hidden');
    n.find("h1").text(NEW_NOTE_TITLE).editable(editCallback, { onblur: 'submit' });
    n.find("p").text(NEW_NOTE_TEXT).editable(editCallback, { type: 'textarea', onblur: 'submit' });
    $(".notes").append(n);
    updateMasonry();
  });

  $("span.delete a").live('click', function(e) {
    e.preventDefault();
    var t = $(e.target);

    $(".undo").show();
    var box = t.parent().parent();
    lastDelete = box;
    box.addClass('hidden');
    updateMasonry();
  });

  $("a.undo").click(function(e) {
    e.preventDefault();

    if(lastDelete) {
      $('.infobox').hide();
      $(".undo").hide();

      lastDelete.removeClass('hidden');
      updateMasonry();
    }
  });


});
