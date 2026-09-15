/* ============================================================
   AG DOORS — FILE UPLOAD FILENAME DISPLAY
   The native file input is visually hidden in favour of a custom
   English-labelled button (see styles.css for why). Since the
   native input's own UI is hidden, this shows the chosen file's
   name next to the button so the visitor gets feedback that a
   file was actually selected.
   ============================================================ */
(function(){
  document.querySelectorAll('.file-upload-input').forEach(function(input){
    var wrap = input.closest('.file-upload');
    if (!wrap) return;
    var nameDisplay = wrap.querySelector('.file-upload-name');
    if (!nameDisplay) return;

    input.addEventListener('change', function(){
      if (input.files && input.files.length > 0){
        nameDisplay.textContent = input.files[0].name;
      } else {
        nameDisplay.textContent = 'No file chosen';
      }
    });
  });
})();
