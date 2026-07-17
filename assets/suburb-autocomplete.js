/* ============================================================
   AG DOORS — SUBURB AUTOCOMPLETE
   Shared by any page with a #suburb input + #suburbList div
   (currently: contact.html, index.html). Depends on
   assets/suburbs.js being loaded first (defines window.AG_SUBURBS).
   ============================================================ */
(function(){
  var suburbs = window.AG_SUBURBS;
  var input = document.getElementById('suburb');
  var list = document.getElementById('suburbList');
  if (!input || !list || !suburbs) return;

  var activeIndex = -1;

  function closeList(){
    list.innerHTML = '';
    list.style.display = 'none';
    activeIndex = -1;
  }

  function renderList(matches){
    list.innerHTML = '';
    if (!matches.length){ closeList(); return; }
    matches.slice(0, 8).forEach(function(name){
      var item = document.createElement('div');
      item.textContent = name;
      item.className = 'autocomplete-item';
      item.addEventListener('mousedown', function(e){
        e.preventDefault();
        input.value = name;
        closeList();
      });
      list.appendChild(item);
    });
    list.style.display = 'block';
  }

  input.addEventListener('input', function(){
    var q = input.value.trim().toLowerCase();
    if (!q){ closeList(); return; }
    var matches = suburbs.filter(function(s){
      return s.toLowerCase().indexOf(q) !== -1;
    });
    renderList(matches);
  });

  input.addEventListener('keydown', function(e){
    var items = list.querySelectorAll('.autocomplete-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown'){
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp'){
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Enter'){
      if (activeIndex > -1){
        e.preventDefault();
        input.value = items[activeIndex].textContent;
        closeList();
        return;
      }
    } else if (e.key === 'Escape'){
      closeList();
      return;
    } else {
      return;
    }
    items.forEach(function(el, i){
      el.classList.toggle('active', i === activeIndex);
    });
  });

  document.addEventListener('click', function(e){
    if (e.target !== input) closeList();
  });
})();
