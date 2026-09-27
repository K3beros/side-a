(function () {
  var bars = 46;
  var wf = document.getElementById('waveform');
  var html = '';
  for (var i = 0; i < bars; i++) {
    var h = 6 + Math.round(Math.abs(Math.sin(i * 0.7)) * 26 + Math.random() * 6);
    html += '<span style="height:' + h + 'px; opacity:' + (0.5 + Math.random() * 0.5).toFixed(2) + '"></span>';
  }
  if (wf) wf.innerHTML = html;

  var tabs = document.querySelectorAll('#tabs button');
  var screens = document.querySelectorAll('.screen');
  function showTab(name) {
    tabs.forEach(function (b) {
      if (b.getAttribute('data-tab') === name) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    screens.forEach(function (s) {
      s.classList.toggle('active', s.id === 'screen-' + name);
    });
    updateCartBar(name === 'merch');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); });
  });
  document.querySelectorAll('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.getAttribute('data-goto')); });
  });

  // Editions: paginated (5/page, both tabs) + live name/kind/Tix Africa — hybrid idx auto, linked by uuid
  var publicEditionsPage = 1;
  var publicEditionsLimit = 5;
  function renderPublicPagination(total, page, limit) {
    var pager = document.getElementById('public-editions-pagination');
    var countEl = document.getElementById('public-editions-count');
    if (!pager) return;
    var totalPages = Math.ceil(total / limit) || 1;
    if (countEl) countEl.textContent = total + ' edition' + (total===1?'':'s') + ' · page ' + page + ' of ' + totalPages;
    if (total <= limit) { pager.innerHTML = ''; return; }
    var html = '<button class="btn small" data-page="prev"' + (page<=1?' disabled':'') + '>Prev</button>';
    for (var i=1;i<=totalPages;i++) html += '<button class="'+(i===page?'active':'')+'" data-page="'+i+'" style="font-size:12.5px; border:1px solid var(--line-strong); border-radius:20px; padding:5px 12px; background:'+(i===page?'var(--gold)':'transparent')+'; color:'+(i===page?'var(--plum-950)':'var(--muted)')+'; cursor:pointer;">'+i+'</button>';
    html += '<button class="btn small" data-page="next"' + (page>=totalPages?' disabled':'') + '>Next</button>';
    pager.innerHTML = html;
    pager.querySelectorAll('[data-page]').forEach(function(b){
      b.addEventListener('click', function(){
        var p=b.getAttribute('data-page');
        if(p==='prev') publicEditionsPage=Math.max(1,publicEditionsPage-1);
        else if(p==='next') publicEditionsPage=Math.min(totalPages,publicEditionsPage+1);
        else publicEditionsPage=parseInt(p,10);
        fetchPublicEditions(publicEditionsPage);
      });
    });
  }
  function formatEditionDate(s){
    try { var d=new Date(s); return d.toLocaleDateString('en-GB',{ day:'numeric', month:'short' }) + ' · ' + d.toLocaleTimeString('en-GB',{ hour:'2-digit', minute:'2-digit' }); } catch(e){ return s; }
  }
  function fetchPublicEditions(page){
    if(page) publicEditionsPage=page;
    var container=document.getElementById('public-editions-container');
    if(!container) return;
    fetch('/api/editions?page='+publicEditionsPage+'&limit='+publicEditionsLimit).then(function(r){return r.json();}).then(function(data){
      var editions=data.editions||[];
      var total=data.total||editions.length;
      if(editions.length===0){ container.innerHTML='<p class="board-empty">No editions yet</p>'; renderPublicPagination(total, publicEditionsPage, publicEditionsLimit); return; }
      var upcoming=editions.find(function(e){return e.status==='upcoming';});
      var past=editions.filter(function(e){return e.status!=='upcoming';});
      // Update home teaser if upcoming present
      if(upcoming){
        var homeSpots=document.querySelector('#screen-home .spots');
        if(homeSpots) homeSpots.textContent=upcoming.spotsLeft+' of '+upcoming.capacity+' spots left';
      }
      var html='';
      // Render upcoming (first on page if any) as highlighted card
      if(upcoming){
        html+='<div style="margin-top:28px;"><p class="panel-label">Upcoming</p><div class="card edition-card"><div class="edition-index">'+String(upcoming.idx).padStart(2,'0')+'</div><div class="edition-body"><p class="edition-album">'+(upcoming.name||upcoming.album)+' <span class="kind-badge">'+(upcoming.kind==='virtual'?'Virtual':'Physical')+'</span></p><p class="edition-artist">'+upcoming.artist+'</p><p class="edition-meta"><span>'+formatEditionDate(upcoming.date)+'</span><span>'+upcoming.venue+'</span></p><div class="edition-foot"><p class="price">₦'+upcoming.price.toLocaleString()+' <span class="spots">· '+upcoming.spotsLeft+' of '+upcoming.capacity+' left</span></p>'+(upcoming.tix_africa_url?'<a class="btn primary small" href="'+upcoming.tix_africa_url+'" target="_blank" rel="noopener">Get tickets on Tix Africa</a>':'<span class="pill">Tix Africa link not set</span>')+'</div></div></div></div>';
      }
      if(past.length>0){
        html+='<div style="margin-top:36px;"><p class="panel-label">Past editions</p><div class="stack past-list">';
        past.forEach(function(e){
          html+='<div class="card edition-card"><div class="edition-index">'+String(e.idx).padStart(2,'0')+'</div><div class="edition-body"><p class="edition-album">'+(e.name||e.album)+' <span class="kind-badge">'+(e.kind==='virtual'?'Virtual':'Physical')+'</span></p><p class="edition-artist">'+e.artist+'</p><p class="edition-meta"><span>'+formatEditionDate(e.date)+'</span><span>'+e.venue+'</span><span>'+(e.attendance!=null?e.attendance+' attended':e.price===0?'free':'')+'</span></p></div></div>';
        });
        html+='</div></div>';
      }
      if(!upcoming && past.length===0){
        html='<div class="stack" style="margin-top:18px;">'+editions.map(function(e){
          return '<div class="card edition-card"><div class="edition-index">'+String(e.idx).padStart(2,'0')+'</div><div class="edition-body"><p class="edition-album">'+(e.name||e.album)+' <span class="kind-badge">'+(e.kind==='virtual'?'Virtual':'Physical')+'</span> <span class="pill">'+e.status+'</span></p><p class="edition-artist">'+e.artist+'</p><p class="edition-meta"><span>'+formatEditionDate(e.date)+'</span><span>'+e.venue+'</span><span>₦'+e.price.toLocaleString()+' · '+e.spotsLeft+'/'+e.capacity+' left</span></p>'+(e.tix_africa_url?'<p style="font-size:12.5px; margin-top:6px;"><a href="'+e.tix_africa_url+'" target="_blank">Tix Africa</a></p>':'')+'</div></div>';
        }).join('')+'</div>';
      }
      container.innerHTML=html;
      renderPublicPagination(total, publicEditionsPage, publicEditionsLimit);
    }).catch(function(){ /* keep container as-is on fallback */ });
  }
  fetchPublicEditions(1);

  // Merch: live stock/remaining
  fetch('/api/merch').then(function (r) { return r.json(); }).then(function (data) {
    var items = data.items || [];
    items.forEach(function (it) {
      if (it.remaining !== null && it.sku === 'pin') {}
    });
  }).catch(function () {});

  // Board: top-12 voted submissions (weekly, fresh after pick)
  function renderBoard(board) {
    var container = document.getElementById('board-container');
    if (!container) {
      // create container below Song of week lede if missing
      var songScreen = document.getElementById('screen-song');
      var card = songScreen && songScreen.querySelector('.card');
      if (!card) return;
      container = document.createElement('div');
      container.id = 'board-container';
      card.parentNode.insertBefore(container, card.nextSibling);
    }
    if (!board || board.length === 0) {
      container.innerHTML = '<p class="board-empty">New week — be the first to submit. Top 12 will appear here as votes come in.</p>';
      return;
    }
    var out = '<div class="card" style="margin-top:16px; padding: 6px 20px;"><p class="panel-label">Board — top 12 this week</p>';
    board.forEach(function (e, i) {
      out += '<div class="board-row" data-board-id="' + e.id + '">'
        + '<div class="board-rank">' + (i + 1) + '</div>'
        + '<div class="board-main">'
        + '<p class="board-title">' + e.track.replace(/</g, '&lt;') + '</p>'
        + '<p class="board-meta">by ' + e.name.replace(/</g, '&lt;') + ' · score ' + e.score + ' (' + e.upvotes + '↑ ' + e.downvotes + '↓)</p>'
        + '<p class="board-note">' + e.why.replace(/</g, '&lt;') + '</p>'
        + '<div class="board-votes">'
        + '<button class="vote-btn" data-vote="up" data-id="' + e.id + '">▲ Upvote (' + e.upvotes + ')</button>'
        + '<button class="vote-btn" data-vote="down" data-id="' + e.id + '">▼ Downvote (' + e.downvotes + ')</button>'
        + '</div></div></div>';
    });
    out += '</div>';
    container.innerHTML = out;
    container.querySelectorAll('[data-vote]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id');
        var dir = b.getAttribute('data-vote');
        var token = localStorage.getItem('side-a-google-id-token');
        if (!token) { alert('Please sign in with Google to vote.'); return; }
        fetch('/api/board/' + id + '/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ direction: dir }),
        }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); }).then(function (res) {
          if (!res.ok) { alert(res.body.error || 'Vote failed'); return; }
          // refetch board to re-sort
          fetch('/api/board').then(function (r) { return r.json(); }).then(function (d) { renderBoard(d.board); });
        }).catch(function () { alert('Vote failed'); });
      });
    });
  }
  fetch('/api/board').then(function (r) { return r.json(); }).then(function (d) { renderBoard(d.board); }).catch(function () {});
  // Updates: source-aware with filter
  function renderUpdates(updates) {
    var card = document.querySelector('#screen-updates .card');
    if (!card) return;
    if (!updates || updates.length === 0) return;
    var html = '';
    updates.forEach(function (u) {
      var badge = u.source && u.source !== 'side_a' ? '<a class="source-badge" href="' + (u.source_url || '#') + '" target="_blank">' + u.source + '</a>' : '';
      html += '<div class="update-row"><div class="update-date">' + u.date.slice(0, 10) + '</div><div class="update-body"><p class="title">' + u.title.replace(/</g, '&lt;') + badge + '</p><p class="desc">' + u.description.replace(/</g, '&lt;') + '</p>' + (u.source_url ? '<p style="margin-top:6px;"><a href="' + u.source_url + '" target="_blank" rel="noopener" style="font-size:13px;">View source →</a></p>' : '') + '</div></div>';
    });
    card.innerHTML = html;
  }
  function fetchUpdates(source) {
    var url = source ? '/api/updates?source=' + source : '/api/updates';
    fetch(url).then(function (r) { return r.json(); }).then(function (d) { renderUpdates(d.updates); }).catch(function () {});
  }
  fetchUpdates();
  // Add source filter pills if not present
  (function () {
    var sec = document.getElementById('screen-updates');
    if (!sec || sec.querySelector('.update-filter')) return;
    var filter = document.createElement('div');
    filter.className = 'update-filter';
    [['','All'],['side_a','Side A'],['instagram','Instagram'],['youtube','YouTube'],['twitter_spaces','Spaces']].forEach(function (p) {
      var b = document.createElement('button');
      b.textContent = p[1];
      b.setAttribute('data-source', p[0]);
      if (p[0]==='') b.classList.add('active');
      b.addEventListener('click', function () {
        filter.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        fetchUpdates(p[0]);
      });
      filter.appendChild(b);
    });
    var card = sec.querySelector('.card');
    if (card) card.parentNode.insertBefore(filter, card);
  })();

  var qty = { e04: 1 };
  var price = 15000;
  document.querySelectorAll('[data-open-checkout]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-open-checkout');
      var el = document.getElementById('checkout-' + id);
      if (el) el.classList.toggle('open');
    });
  });
  function updateTotal(id) {
    var total = qty[id] * price;
    var totalEl = document.getElementById('total-' + id);
    var qtyEl = document.getElementById('qty-' + id);
    if (totalEl) totalEl.textContent = '₦' + total.toLocaleString();
    if (qtyEl) qtyEl.textContent = qty[id];
  }
  document.querySelectorAll('[data-qty-inc]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-qty-inc');
      qty[id] = Math.min(8, qty[id] + 1);
      updateTotal(id);
    });
  });
  document.querySelectorAll('[data-qty-dec]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-qty-dec');
      qty[id] = Math.max(1, qty[id] - 1);
      updateTotal(id);
    });
  });
  // Fallback confirm — only used when Tix Africa link not present
  document.querySelectorAll('[data-confirm]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-confirm');
      var msg = document.getElementById('confirm-' + id);
      if (msg) msg.classList.add('show');
      b.disabled = true;
      b.textContent = 'Confirmed';
    });
  });

  var reactionState = {};
  try {
    var saved = localStorage.getItem('side-a-reactions');
    if (saved) reactionState = JSON.parse(saved);
  } catch (e) {}
  document.querySelectorAll('.reaction').forEach(function (b) {
    var track = b.getAttribute('data-track');
    var kind = b.getAttribute('data-reaction');
    var key = track + ':' + kind;
    if (reactionState[key]) b.classList.add('active');
    b.addEventListener('click', function () {
      var active = b.classList.toggle('active');
      var countEl = b.querySelector('.count');
      var current = parseInt(countEl.textContent.replace(/[()]/g, ''), 10);
      countEl.textContent = '(' + (active ? current + 1 : current - 1) + ')';
      reactionState[key] = active;
      try { localStorage.setItem('side-a-reactions', JSON.stringify(reactionState)); } catch (e) {}
      // Optional backend: POST /api/songs/:id/reactions when songId mapping available
    });
  });

  document.querySelectorAll('[data-comments-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-comments-toggle');
      var form = document.getElementById('form-' + id);
      if (form) form.classList.toggle('open');
    });
  });
  document.querySelectorAll('[data-comment-submit]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-comment-submit');
      var input = document.querySelector('[data-comment-input="' + id + '"]');
      var val = input.value.trim();
      if (!val) { input.focus(); return; }
      var list = document.getElementById('comments-' + id);
      var p = document.createElement('p');
      p.className = 'comment';
      p.innerHTML = '<span class="who">You</span>' + val.replace(/</g, '&lt;');
      list.appendChild(p);
      input.value = '';
      // Optional: POST /api/songs/:id/comments
    });
  });

  var merchPrices = { tote: 8000, tee: 12000, pin: 3500 };
  var cart = { tote: 0, tee: 0, pin: 0 };
  var onMerchTab = false;
  function updateCartBar(isMerchTab) {
    onMerchTab = isMerchTab;
    var total = cart.tote * merchPrices.tote + cart.tee * merchPrices.tee + cart.pin * merchPrices.pin;
    var count = cart.tote + cart.tee + cart.pin;
    var summary = document.getElementById('cart-summary');
    var bar = document.getElementById('cart-bar');
    if (summary) summary.innerHTML = count + (count === 1 ? ' item' : ' items') + ' <strong id="cart-total">₦' + total.toLocaleString() + '</strong>';
    if (bar) bar.classList.toggle('show', onMerchTab && count > 0);
  }
  document.querySelectorAll('[data-merch-qty]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      cart[sel.getAttribute('data-merch-qty')] = parseInt(sel.value, 10);
      updateCartBar(onMerchTab);
    });
  });
  document.getElementById('cart-place').addEventListener('click', function () {
    var btn = this;
    var items = [];
    if (cart.tote > 0) items.push({ sku: 'tote', qty: cart.tote });
    if (cart.tee > 0) {
      var sizeEl = document.querySelector('[data-merch-size="tee"]');
      items.push({ sku: 'tee', qty: cart.tee, size: sizeEl ? sizeEl.value : 'M' });
    }
    if (cart.pin > 0) items.push({ sku: 'pin', qty: cart.pin });
    if (items.length === 0) return;
    btn.disabled = true;
    btn.textContent = 'Redirecting…';
    fetch('/api/merch/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items }),
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data.monnifyLink) {
        window.location.href = data.monnifyLink;
      } else {
        // Fallback: show confirmation if no Monnify link configured
        var confirmEl = document.getElementById('order-confirm');
        if (confirmEl) confirmEl.classList.add('show');
        var bar = document.getElementById('cart-bar');
        if (bar) bar.classList.remove('show');
        btn.textContent = 'Order placed';
      }
    }).catch(function () {
      // Offline fallback
      var confirmEl = document.getElementById('order-confirm');
      if (confirmEl) confirmEl.classList.add('show');
      var bar = document.getElementById('cart-bar');
      if (bar) bar.classList.remove('show');
      btn.disabled = true;
      btn.textContent = 'Order placed';
    });
  });

  var form = document.getElementById('rec-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      [['rec-name', 'err-name'], ['rec-track', 'err-track'], ['rec-why', 'err-why']].forEach(function (pair) {
        var field = document.getElementById(pair[0]);
        var err = document.getElementById(pair[1]);
        if (!field || !err) return;
        if (!field.value.trim()) { err.classList.add('show'); ok = false; }
        else { err.classList.remove('show'); }
      });
      if (!ok) return;
      var payload = {
        name: document.getElementById('rec-name').value.trim(),
        track: document.getElementById('rec-track').value.trim(),
        why: document.getElementById('rec-why').value.trim(),
        link: document.getElementById('rec-link').value.trim(),
      };
      fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(function () {
        form.style.display = 'none';
        document.getElementById('rec-success').classList.add('show');
      }).catch(function () {
        form.style.display = 'none';
        document.getElementById('rec-success').classList.add('show');
      });
    });
    [['rec-name', 'err-name'], ['rec-track', 'err-track'], ['rec-why', 'err-why']].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el) el.addEventListener('input', function () {
        var err = document.getElementById(pair[1]);
        if (err) err.classList.remove('show');
      });
    });
  }
})();
