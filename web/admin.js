(function () {
  var tabs = document.querySelectorAll('#admin-tabs button');
  var screens = document.querySelectorAll('.screen');
  function showTab(name) {
    tabs.forEach(function (b) {
      if (b.getAttribute('data-tab') === name) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    screens.forEach(function (s) { s.classList.toggle('active', s.id === 'screen-' + name); });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (name === 'dashboard') loadDashboard();
    if (name === 'editions') loadEditions();
    if (name === 'board') loadBoard();
    if (name === 'merch') loadMerch();
    if (name === 'updates') loadUpdates();
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); }); });
  // hash deep-link
  var hash = (location.hash || '').replace('#','');
  if (hash && document.getElementById('screen-' + hash)) showTab(hash);
  tabs.forEach(function (b) { b.addEventListener('click', function(){ location.hash = b.getAttribute('data-tab'); }); });

  function api(path, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    if (!opts.headers['Content-Type'] && opts.body) opts.headers['Content-Type'] = 'application/json';
    return fetch(path, opts).then(function (r) { return r.json().then(function (j){ return { ok: r.ok, status: r.status, body: j}; }); });
  }

  // Dashboard — GET /api/home + counts
  function loadDashboard() {
    var stats = document.getElementById('dash-stats');
    var latest = document.getElementById('dash-latest');
    if (!stats) return;
    Promise.all([api('/api/home'), api('/api/board'), api('/api/editions'), api('/api/merch')]).then(function (res) {
      var home = res[0].body || {};
      var board = (res[1].body && res[1].body.board) || [];
      var editions = (res[2].body && res[2].body.editions) || [];
      var merch = (res[3].body && res[3].body.items) || [];
      var upcoming = editions.find(function (e){ return e.status==='upcoming'; });
      stats.innerHTML =
        '<div class="card"><p class="stat-value">' + board.length + '</p><p class="stat-label">Board queued (top 12)</p></div>' +
        '<div class="card"><p class="stat-value">' + (upcoming ? upcoming.spotsLeft + '/' + upcoming.capacity : '—') + '</p><p class="stat-label">Next edition spots left</p></div>' +
        '<div class="card"><p class="stat-value">' + merch.reduce(function (a,m){ return a + (m.remaining===null?0:m.remaining); },0) + '</p><p class="stat-label">Merch remaining (in-stock)</p></div>' +
        '<div class="card"><p class="stat-value">' + editions.length + '</p><p class="stat-label">Editions total</p></div>';
      if (latest) {
        var html = '<p class="panel-label">Live</p>';
        if (home.nowSpinning) html += '<div class="card" style="margin-top:8px;"><p style="font-family:Fraunces,serif; font-size:17px;">' + home.nowSpinning.title + ' — ' + home.nowSpinning.artist + '</p><p style="color:var(--muted); font-size:13px; margin-top:4px;">Picked by ' + home.nowSpinning.picked_by + '</p></div>';
        if (home.nextEdition) html += '<div class="card" style="margin-top:12px;"><p class="panel-label">Next edition</p><p style="font-family:Fraunces, serif;">' + (home.nextEdition.name || home.nextEdition.album) + ' <span class="kind-badge">' + (home.nextEdition.kind||'physical') + '</span></p><p style="color:var(--cream-dim); font-size:13.5px; margin-top:6px;">' + home.nextEdition.venue + ' · ' + home.nextEdition.spotsLeft + '/' + home.nextEdition.capacity + ' left' + (home.nextEdition.tix_africa_url ? ' · <a href="' + home.nextEdition.tix_africa_url + '" target="_blank">Tix Africa</a>' : '') + '</p></div>';
        latest.innerHTML = html;
      }
    });
  }
  loadDashboard();

  // Editions — list + create + sync spots (paged 5/page, both tabs; idx auto server-side)
  var adminEditionsPage = 1;
  var adminEditionsLimit = 5;
  function renderAdminPagination(total, page, limit) {
    var pager = document.getElementById('admin-editions-pagination');
    var countEl = document.getElementById('admin-editions-count');
    if (!pager) return;
    var totalPages = Math.ceil(total / limit) || 1;
    if (countEl) countEl.textContent = total + ' edition' + (total===1?'':'s') + ' · page ' + page + ' of ' + totalPages;
    if (total <= limit) { pager.innerHTML = ''; return; }
    var html = '<button class="btn small" data-page="prev"' + (page<=1?' disabled':'') + '>Prev</button>';
    for (var i=1; i<=totalPages; i++) {
      html += '<button class="'+ (i===page?'active':'') +'" data-page="'+i+'" style="font-size:12.5px; border:1px solid var(--line-strong); border-radius:20px; padding:5px 12px; background:'+(i===page?'var(--gold)':'transparent')+'; color:'+(i===page?'var(--plum-950)':'var(--muted)')+'; cursor:pointer;">'+i+'</button>';
    }
    html += '<button class="btn small" data-page="next"' + (page>=totalPages?' disabled':'') + '>Next</button>';
    pager.innerHTML = html;
    pager.querySelectorAll('[data-page]').forEach(function (b){
      b.addEventListener('click', function(){
        var p = b.getAttribute('data-page');
        if (p==='prev') adminEditionsPage = Math.max(1, adminEditionsPage-1);
        else if (p==='next') adminEditionsPage = Math.min(totalPages, adminEditionsPage+1);
        else adminEditionsPage = parseInt(p,10);
        loadEditions(adminEditionsPage);
      });
    });
  }
  function loadEditions(page) {
    if (page) adminEditionsPage = page;
    var list = document.getElementById('editions-list');
    if (!list) return;
    api('/api/editions?page='+adminEditionsPage+'&limit='+adminEditionsLimit).then(function (res) {
      var editions = (res.body && res.body.editions) || [];
      var total = (res.body && res.body.total) || editions.length;
      if (editions.length===0) { list.innerHTML='<p class="board-empty">No editions</p>'; renderAdminPagination(total, adminEditionsPage, adminEditionsLimit); return; }
      list.innerHTML = editions.map(function (e){
        return '<div class="board-row" style="align-items:center;"><div class="board-rank">' + e.idx + '</div><div class="board-main">'
          + '<p class="board-title">' + (e.name||e.album) + ' <span class="kind-badge">' + (e.kind||'physical') + '</span> <span class="pill">' + e.status + '</span></p>'
          + '<p class="board-meta">' + e.album + ' — ' + e.artist + ' · ' + (e.venue||'') + ' · ₦' + e.price + ' · ' + e.spots_sold + '/' + e.capacity + ' sold (left ' + e.spotsLeft + ')</p>'
          + (e.tix_africa_url ? '<p style="font-size:12.5px; margin-top:6px;"><a href="'+e.tix_africa_url+'" target="_blank">'+e.tix_africa_url+'</a> '+ (e.tix_africa_event_id||'') +'</p>' : '')
          + (e.meta ? '<p style="font-size:12.5px; color:var(--muted);">meta: '+ JSON.stringify(e.meta).slice(0,120) +'</p>' : '')
          + '<div style="display:flex; gap:8px; margin-top:10px;">'
          + '<input id="sync-'+e.id+'" type="number" placeholder="spotsSold" style="width:120px; background:var(--plum-900); border:1px solid var(--line-strong); border-radius:6px; padding:7px 9px; color:var(--cream);">'
          + '<button class="btn small" data-sync="'+e.id+'">Sync spots</button>'
          + '<button class="btn small" data-edit="'+e.id+'">Edit</button>'
          + '</div></div></div>';
      }).join('');
      renderAdminPagination(total, adminEditionsPage, adminEditionsLimit);
      list.querySelectorAll('[data-sync]').forEach(function (b){
        b.addEventListener('click', function(){
          var id=b.getAttribute('data-sync');
          var v=parseInt((document.getElementById('sync-'+id)||{}).value,10);
          if (isNaN(v)) return;
          api('/api/admin/sync/editions/'+id, { method:'POST', body: JSON.stringify({ spotsSold: v })}).then(function(){ loadEditions(adminEditionsPage); });
        });
      });
      list.querySelectorAll('[data-edit]').forEach(function (b){
        b.addEventListener('click', function(){
          var id=b.getAttribute('data-edit');
          var ed=editions.find(function(x){ return x.id===id; });
          if (!ed) return;
          document.getElementById('ed-name').value=ed.name||'';
          document.getElementById('ed-kind').value=ed.kind||'physical';
          document.getElementById('ed-album').value=ed.album;
          document.getElementById('ed-artist').value=ed.artist;
          document.getElementById('ed-status').value=ed.status;
          document.getElementById('ed-venue').value=ed.venue;
          document.getElementById('ed-price').value=ed.price;
          document.getElementById('ed-capacity').value=ed.capacity;
          document.getElementById('ed-tix-url').value=ed.tix_africa_url||'';
          document.getElementById('ed-tix-id').value=ed.tix_africa_event_id||'';
          document.getElementById('ed-meta').value=ed.meta?JSON.stringify(ed.meta):'';
          if (ed.date) { try { document.getElementById('ed-date').value = new Date(ed.date).toISOString().slice(0,16); } catch(e){} }
          document.getElementById('ed-form-msg').textContent='Editing — submit will PATCH this edition (idx auto, not editable)';
          document.getElementById('ed-form-msg').setAttribute('data-edit-id', id);
        });
      });
    });
  }

  var editionForm = document.getElementById('edition-form');
  if (editionForm) {
    editionForm.addEventListener('submit', function (e){
      e.preventDefault();
      var msg=document.getElementById('ed-form-msg');
      var editId=msg.getAttribute('data-edit-id');
      var priceVal=parseInt(document.getElementById('ed-price').value,10)||0;
      var capVal=parseInt(document.getElementById('ed-capacity').value,10);
      var metaStr=document.getElementById('ed-meta').value.trim();
      var meta=null; if(metaStr){ try{ meta=JSON.parse(metaStr); } catch(err){ msg.textContent='Meta must be valid JSON'; return; } }
      var payload={ name: document.getElementById('ed-name').value.trim(), kind: document.getElementById('ed-kind').value, album: document.getElementById('ed-album').value.trim(), artist: document.getElementById('ed-artist').value.trim(), date: document.getElementById('ed-date').value ? new Date(document.getElementById('ed-date').value).toISOString() : new Date().toISOString(), venue: document.getElementById('ed-venue').value.trim(), price: priceVal, capacity: capVal, status: document.getElementById('ed-status').value, tix_africa_url: document.getElementById('ed-tix-url').value.trim(), tix_africa_event_id: document.getElementById('ed-tix-id').value.trim(), meta: meta };
      if(!payload.name || !payload.album || !payload.artist || !payload.venue || isNaN(payload.capacity)){ msg.textContent='Fill name, album, artist, venue, capacity (idx auto)'; return; }
      var url=editId?'/api/admin/editions/'+editId:'/api/admin/editions';
      var method=editId?'PATCH':'POST';
      api(url, { method: method, body: JSON.stringify(payload)}).then(function(res){
        if(!res.ok){ var issue=(res.body.issues&&res.body.issues[0]&&res.body.issues[0].message)||res.body.error||JSON.stringify(res.body); msg.textContent=issue; return; }
        if(editId){ msg.textContent='Updated'; msg.removeAttribute('data-edit-id'); editionForm.reset(); loadEditions(adminEditionsPage); }
        else {
          msg.textContent='Created — idx auto-assigned';
          msg.removeAttribute('data-edit-id');
          editionForm.reset();
          // Fetch to find new total/pages and jump to page containing new edition
          api('/api/editions?page=1&limit='+adminEditionsLimit).then(function(r){
            var total=(r.body&&r.body.total)||0;
            var totalPages=Math.ceil(total/adminEditionsLimit)||1;
            if (res.body && res.body.edition && res.body.edition.idx) {
              var newIdx=res.body.edition.idx;
              var targetPage=Math.ceil(newIdx/adminEditionsLimit);
              adminEditionsPage=Math.min(targetPage, totalPages);
            } else {
              adminEditionsPage=totalPages;
            }
            loadEditions(adminEditionsPage);
          });
        }
      });
    });
    document.getElementById('reload-editions').addEventListener('click', function(){ loadEditions(adminEditionsPage); });
  }

  // Board — admin pick (closes week)
  function loadBoard() {
    var list=document.getElementById('admin-board-list');
    var arch=document.getElementById('admin-songs-list');
    if(!list) return;
    api('/api/admin/board').then(function(res){
      var board=(res.body&&res.body.board)||[];
      if(board.length===0){ list.innerHTML='<p class="board-empty">New week — be first to submit. Top 12 will appear as votes come in.</p>'; }
      else {
        list.innerHTML=board.map(function(e,i){
          return '<div class="board-row"><div class="board-rank">'+(i+1)+'</div><div class="board-main">'
            +'<p class="board-title">'+e.track.replace(/</g,'&lt;')+'</p>'
            +'<p class="board-meta">by '+e.name.replace(/</g,'&lt;')+' · score '+e.score+' ('+e.upvotes+'↑ '+e.downvotes+'↓) · '+e.status+'</p>'
            +'<p class="board-note">'+e.why.replace(/</g,'&lt;')+'</p>'
            +'<div class="board-votes"><button class="btn primary small" data-pick="'+e.id+'">Pick as Song of the Week</button></div>'
            +'</div></div>';
        }).join('');
        list.querySelectorAll('[data-pick]').forEach(function(b){
          b.addEventListener('click', function(){
            var id=b.getAttribute('data-pick');
            if(!confirm('Pick this entry? This closes the week — all other queued will be archived.')) return;
            api('/api/admin/board/pick', { method:'POST', body: JSON.stringify({id:id})}).then(function(res){
              if(!res.ok){ alert(res.body.error||'Pick failed'); return; }
              loadBoard();
            });
          });
        });
      }
    });
    if(arch){
      api('/api/songs').then(function(res){
        var songs=(res.body&&res.body.songs)||[];
        if(songs.length===0){ arch.innerHTML='<p class="board-empty">No winners yet</p>'; return; }
        arch.innerHTML=songs.map(function(s){
          return '<div class="board-row"><div class="board-rank">W'+s.week_number+(s.is_current?' ★':'')+'</div><div class="board-main"><p class="board-title">'+s.title+' — '+s.artist+'</p><p class="board-meta">Picked by '+s.picked_by+'</p><p class="board-note">'+s.note.replace(/</g,'&lt;')+'</p></div></div>';
        }).join('');
      });
    }
  }

  // Merch — stock + orders
  function loadMerch(){
    var stock=document.getElementById('merch-stock');
    var ordersEl=document.getElementById('merch-orders');
    if(stock) api('/api/merch').then(function(res){
      var items=(res.body&&res.body.items)||[];
      stock.innerHTML=items.map(function(m){
        return '<div class="board-row" style="align-items:center;"><div class="board-main">'
          +'<p class="board-title">'+m.name.replace(/</g,'&lt;')+' <span class="pill">'+m.status+'</span> ₦'+m.price+'</p>'
          +'<p class="board-meta">sku '+m.sku+' · stock '+(m.stock===null?'∞':m.stock)+' · sold '+m.sold+' · remaining '+(m.remaining===null?'∞':m.remaining)+'</p>'
          +'<p style="font-size:12.5px; color:var(--muted);">'+m.note+'</p>'
          +'<div style="display:flex; gap:8px; margin-top:8px;"><input id="merch-sync-'+m.sku+'" placeholder="sold or delta" style="width:140px; background:var(--plum-900); border:1px solid var(--line-strong); border-radius:6px; padding:7px 9px; color:var(--cream);"><button class="btn small" data-merch-sync="'+m.sku+'">Sync sold</button><button class="btn small" data-merch-delta="'+m.sku+'">+Delta</button></div>'
          +'</div></div>';
      }).join('');
      stock.querySelectorAll('[data-merch-sync]').forEach(function(b){
        b.addEventListener('click', function(){ var sku=b.getAttribute('data-merch-sync'); var v=parseInt((document.getElementById('merch-sync-'+sku)||{}).value,10); if(isNaN(v)) return; api('/api/admin/sync/merch', {method:'POST', body: JSON.stringify({sku:sku, sold:v})}).then(function(){ loadMerch(); }); });
      });
      stock.querySelectorAll('[data-merch-delta]').forEach(function(b){
        b.addEventListener('click', function(){ var sku=b.getAttribute('data-merch-delta'); var v=parseInt((document.getElementById('merch-sync-'+sku)||{}).value,10); if(isNaN(v)) return; api('/api/admin/sync/merch', {method:'POST', body: JSON.stringify({sku:sku, delta:v})}).then(function(){ loadMerch(); }); });
      });
    });
    if(ordersEl) api('/api/admin/merch/orders').then(function(res){
      var orders=(res.body&&res.body.orders)||[];
      if(orders.length===0){ ordersEl.innerHTML='<p class="board-empty">No orders yet</p>'; return; }
      ordersEl.innerHTML=orders.map(function(o){
        return '<div class="update-row"><div class="update-date">'+(o.created_at||'').slice(0,10)+'</div><div class="update-body"><p class="title">Order '+o.id.slice(0,8)+' · ₦'+o.total+' · <span class="pill">'+o.status+'</span></p><p class="desc">'+JSON.stringify(o.items).slice(0,140)+'</p>'+(o.monnify_link?'<p style="margin-top:6px;"><a href="'+o.monnify_link+'" target="_blank">Monnify link →</a></p>':'')+'</div></div>';
      }).join('');
    });
  }

  // Updates — source-aware CRUD
  function loadUpdates(source){
    var list=document.getElementById('admin-updates-list');
    if(!list) return;
    var url=source?'/api/updates?source='+source:'/api/updates';
    api(url).then(function(res){
      var updates=(res.body&&res.body.updates)||[];
      if(updates.length===0){ list.innerHTML='<p class="board-empty">No updates</p>'; return; }
      list.innerHTML=updates.map(function(u){
        return '<div class="update-row"><div class="update-date">'+(u.date||'').slice(0,10)+'</div><div class="update-body">'
          +'<p class="title">'+u.title.replace(/</g,'&lt;')+' <span class="source-badge">'+u.source+'</span></p>'
          +'<p class="desc">'+u.description.replace(/</g,'&lt;')+'</p>'
          +(u.source_url?'<p style="margin-top:6px;"><a href="'+u.source_url+'" target="_blank">View source →</a></p>':'')
          +'<div style="display:flex; gap:8px; margin-top:8px;"><button class="btn small" data-edit-up="'+u.id+'">Edit</button><button class="btn small" data-del-up="'+u.id+'">Delete</button></div>'
          +'</div></div>';
      }).join('');
      list.querySelectorAll('[data-edit-up]').forEach(function(b){
        b.addEventListener('click', function(){
          var id=b.getAttribute('data-edit-up');
          var u=updates.find(function(x){return x.id===id;});
          if(!u) return;
          document.getElementById('up-id').value=u.id;
          document.getElementById('up-date').value=(u.date||'').slice(0,10);
          document.getElementById('up-title').value=u.title;
          document.getElementById('up-desc').value=u.description;
          document.getElementById('up-source').value=u.source;
          document.getElementById('up-url').value=u.source_url||'';
          document.getElementById('up-meta').value=u.meta?JSON.stringify(u.meta):'';
          document.getElementById('up-submit').textContent='Update';
          document.getElementById('up-cancel').style.display='inline-flex';
        });
      });
      list.querySelectorAll('[data-del-up]').forEach(function(b){
        b.addEventListener('click', function(){
          var id=b.getAttribute('data-del-up');
          if(!confirm('Delete this update?')) return;
          api('/api/admin/updates/'+id, {method:'DELETE'}).then(function(){ loadUpdates(sourceFilter); });
        });
      });
    });
  }
  var sourceFilter='';
  document.querySelectorAll('#admin-update-filter button').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('#admin-update-filter button').forEach(function(x){x.classList.remove('active');});
      b.classList.add('active');
      sourceFilter=b.getAttribute('data-source')||'';
      loadUpdates(sourceFilter);
    });
  });
  loadUpdates(sourceFilter);

  var upForm=document.getElementById('update-form');
  if(upForm){
    upForm.addEventListener('submit', function(e){
      e.preventDefault();
      var id=document.getElementById('up-id').value;
      var metaStr=document.getElementById('up-meta').value.trim();
      var meta=null; if(metaStr){ try{ meta=JSON.parse(metaStr); } catch{ document.getElementById('up-form-msg').textContent='Meta invalid JSON'; return; } }
      var payload={ date: document.getElementById('up-date').value, title: document.getElementById('up-title').value.trim(), description: document.getElementById('up-desc').value.trim(), source: document.getElementById('up-source').value, source_url: document.getElementById('up-url').value.trim(), meta: meta };
      if(!payload.date||!payload.title||!payload.description){ document.getElementById('up-form-msg').textContent='Date/title/description required'; return; }
      var url=id?'/api/admin/updates/'+id:'/api/admin/updates';
      var method=id?'PATCH':'POST';
      api(url, {method:method, body: JSON.stringify(payload)}).then(function(res){
        if(!res.ok){ document.getElementById('up-form-msg').textContent=res.body.error||JSON.stringify(res.body); return; }
        upForm.reset();
        document.getElementById('up-id').value='';
        document.getElementById('up-submit').textContent='Create update';
        document.getElementById('up-cancel').style.display='none';
        document.getElementById('up-form-msg').textContent=id?'Updated':'Created';
        loadUpdates(sourceFilter);
      });
    });
    document.getElementById('up-cancel').addEventListener('click', function(){ upForm.reset(); document.getElementById('up-id').value=''; document.getElementById('up-submit').textContent='Create update'; this.style.display='none'; });
  }

  // Webhooks — test fire
  var tixForm=document.getElementById('wh-tix-form');
  if(tixForm) tixForm.addEventListener('submit', function(e){
    e.preventDefault();
    var id=document.getElementById('wh-tix-id').value.trim();
    var qty=parseInt(document.getElementById('wh-tix-qty').value,10)||1;
    api('/api/webhooks/tix-africa', { method:'POST', body: JSON.stringify({ eventId: id, quantity: qty })}).then(function(res){ document.getElementById('wh-tix-msg').textContent=JSON.stringify(res.body); loadEditions(); });
  });
  var monForm=document.getElementById('wh-monnify-form');
  if(monForm) monForm.addEventListener('submit', function(e){
    e.preventDefault();
    var ref=document.getElementById('wh-ref').value.trim();
    var paid=document.getElementById('wh-paid').value==='true';
    api('/api/webhooks/monnify', { method:'POST', body: JSON.stringify({ reference: ref, paid: paid })}).then(function(res){ document.getElementById('wh-monnify-msg').textContent=JSON.stringify(res.body); loadMerch(); });
  });

  // initial loads for active
  loadEditions();
  loadBoard();
  loadMerch();
})();
