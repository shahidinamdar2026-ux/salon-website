(function () {

  var stage = document.querySelector('.stage');
  var stack = document.getElementById('stack');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (stage && stack && !reduceMotion) {
    stage.addEventListener('mousemove', function (e) {
      var rect = stage.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      var rx = 8 - py * 12;
      var ry = -14 + px * 18;
      stack.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    stage.addEventListener('mouseleave', function () {
      stack.style.transform = 'rotateX(8deg) rotateY(-14deg)';
    });
  }

  var toggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

})();

/* ==================== */

(function () {

  var frame = document.querySelector('.frame');
  var tilt = document.getElementById('tilt');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (frame && tilt && !reduceMotion) {
    frame.addEventListener('mousemove', function (e) {
      var rect = frame.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      var rx = 2 - py * 8;
      var ry = -4 + px * 10;
      tilt.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    frame.addEventListener('mouseleave', function () {
      tilt.style.transform = 'rotateX(2deg) rotateY(-4deg)';
    });
  }

})();

/* ==================== */

(function () {

  var tabs = document.querySelectorAll('#tabs .tab');
  var panels = document.querySelectorAll('.panels .panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  /* ---------- treatment search ---------- */
  function buildIndex() {
    var out = [];
    panels.forEach(function (panel) {
      var h3 = panel.querySelector('.panel__text h3');
      var category = h3 ? h3.textContent : '';
      panel.querySelectorAll('.menu-row').forEach(function (row) {
        out.push({
          name: row.querySelector('.menu-row__name').textContent,
          price: row.querySelector('.menu-row__price').textContent,
          category: category,
          panelId: panel.id,
          rowEl: row
        });
      });
    });
    return out;
  }

  var INDEX = buildIndex();
  var searchInput = document.getElementById('menuSearch');
  var resultsBox = document.getElementById('searchResults');

  function renderResults(matches, query) {
    resultsBox.innerHTML = '';
    if (matches.length === 0) {
      resultsBox.innerHTML = '<div class="search-empty">No treatments found for &ldquo;' + query + '&rdquo;</div>';
    } else {
      matches.slice(0, 6).forEach(function (m) {
        var item = document.createElement('div');
        item.className = 'search-result';
        item.innerHTML = '<span class="name">' + m.name + '</span><span class="meta">' + m.category + ' &middot; ' + m.price + '</span>';
        item.addEventListener('click', function () {
          var tabBtn = document.querySelector('#tabs .tab[data-target="' + m.panelId + '"]');
          if (tabBtn) { tabBtn.click(); }
          setTimeout(function () {
            m.rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            m.rowEl.classList.add('flash');
            setTimeout(function () { m.rowEl.classList.remove('flash'); }, 1600);
          }, 250);
          searchInput.value = '';
          resultsBox.classList.remove('open');
        });
        resultsBox.appendChild(item);
      });
    }
    resultsBox.classList.add('open');
  }

  searchInput.addEventListener('input', function () {
    var q = searchInput.value.trim().toLowerCase();
    if (!q) { resultsBox.classList.remove('open'); return; }
    var matches = INDEX.filter(function (m) { return m.name.toLowerCase().indexOf(q) !== -1; });
    renderResults(matches, searchInput.value.trim());
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-wrap')) { resultsBox.classList.remove('open'); }
  });

})();

/* ==================== */

(function () {

  var track = document.getElementById('baTrack');
  var wrap = document.getElementById('baWrap');
  var slides = track.children;
  var total = slides.length;
  var dots = document.querySelectorAll('#baDots .ba-dot');
  var idx = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer;

  function goTo(i) {
    idx = (i + total) % total;
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    dots.forEach(function (d, j) { d.classList.toggle('active', j === idx); });
  }

  function startAutoplay() {
    if (reduceMotion) return;
    timer = setInterval(function () { goTo(idx + 1); }, 5000);
  }
  function resetAutoplay() { clearInterval(timer); startAutoplay(); }

  document.getElementById('baPrev').addEventListener('click', function () { goTo(idx - 1); resetAutoplay(); });
  document.getElementById('baNext').addEventListener('click', function () { goTo(idx + 1); resetAutoplay(); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); resetAutoplay(); }); });

  wrap.addEventListener('mouseenter', function () { clearInterval(timer); });
  wrap.addEventListener('mouseleave', function () { startAutoplay(); });

  var startX = 0, deltaX = 0;
  wrap.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
  wrap.addEventListener('touchmove', function (e) { deltaX = e.touches[0].clientX - startX; }, { passive: true });
  wrap.addEventListener('touchend', function () {
    if (deltaX > 50) { goTo(idx - 1); } else if (deltaX < -50) { goTo(idx + 1); }
    deltaX = 0;
    startAutoplay();
  });

  startAutoplay();

})();

/* ==================== */

(function () {

  var track = document.getElementById('prodTrack');
  document.getElementById('shopPrev').addEventListener('click', function () {
    track.scrollBy({ left: -280, behavior: 'smooth' });
  });
  document.getElementById('shopNext').addEventListener('click', function () {
    track.scrollBy({ left: 280, behavior: 'smooth' });
  });

  var wishlist = new Set();
  var toggle = document.getElementById('wishlistToggle');
  var panel = document.getElementById('wishlistPanel');
  var countEl = document.getElementById('wishlistCount');
  var itemsEl = document.getElementById('wishlistItems');
  var emptyEl = document.getElementById('wishlistEmpty');
  var heartBtns = document.querySelectorAll('.wishlist-btn');

  function renderWishlist() {
    countEl.textContent = 'Wishlist (' + wishlist.size + ')';
    itemsEl.innerHTML = '';
    emptyEl.style.display = wishlist.size === 0 ? 'block' : 'none';
    wishlist.forEach(function (idx) {
      var card = document.querySelector('.prod-card[data-index="' + idx + '"]');
      if (!card) return;
      var img = card.querySelector('.prod-image img').getAttribute('src');
      var name = card.querySelector('.prod-name').textContent;
      var row = document.createElement('div');
      row.className = 'wishlist-item';
      row.innerHTML = '<img src="' + img + '" alt=""><span class="wi-name">' + name + '</span><button class="wi-remove" aria-label="Remove">&times;</button>';
      row.querySelector('.wi-remove').addEventListener('click', function () {
        wishlist.delete(idx);
        updateHeart(idx, false);
        renderWishlist();
      });
      itemsEl.appendChild(row);
    });
  }

  function updateHeart(idx, active) {
    var btn = document.querySelector('.wishlist-btn[data-index="' + idx + '"]');
    if (btn) { btn.classList.toggle('active', active); }
  }

  heartBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = btn.dataset.index;
      if (wishlist.has(idx)) {
        wishlist.delete(idx);
        updateHeart(idx, false);
      } else {
        wishlist.add(idx);
        updateHeart(idx, true);
      }
      renderWishlist();
    });
  });

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.shop-controls')) { panel.classList.remove('open'); }
  });

  renderWishlist();

})();

/* ==================== */

(function () {

  var starBtns = document.querySelectorAll('#rfStars button');
  var currentRating = 0;

  function paintStars(n) {
    starBtns.forEach(function (b, i) { b.classList.toggle('filled', i < n); });
  }
  starBtns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () { currentRating = idx + 1; paintStars(currentRating); });
    btn.addEventListener('mouseenter', function () { paintStars(idx + 1); });
  });
  document.getElementById('rfStars').addEventListener('mouseleave', function () { paintStars(currentRating); });

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.getElementById('reviewForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('rfName').value.trim();
    var text = document.getElementById('rfText').value.trim();
    if (!name || !text) { return; }
    var rating = currentRating || 5;

    var starsHTML = '';
    for (var i = 0; i < 5; i++) {
      starsHTML += '<svg viewBox="0 0 24 24" fill="currentColor" style="opacity:' + (i < rating ? 1 : 0.25) + '"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7-5.4-4.7 7.1-.6z"/></svg>';
    }

    var card = document.createElement('div');
    card.className = 'review';
    card.innerHTML =
      '<span class="mark">&ldquo;</span>' +
      '<div class="stars">' + starsHTML + '</div>' +
      '<p>' + escapeHtml(text) + '</p>' +
      '<footer><strong>' + escapeHtml(name) + '</strong><span>Just now</span></footer>';

    var grid = document.querySelector('.tm-grid');
    grid.insertBefore(card, grid.firstChild);

    document.getElementById('rfName').value = '';
    document.getElementById('rfText').value = '';
    currentRating = 0;
    paintStars(0);

    var note = document.getElementById('rfNote');
    note.textContent = 'Thanks — your review has been posted.';
    setTimeout(function () { note.textContent = ''; }, 4000);
  });

})();
