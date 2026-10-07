/* ==========================================================================
   wireframe.js — shared interaction behaviour for the Mayfair Prestige
   prototype pack.

   Everything is driven by ids and data attributes on the pages, so no page
   carries its own script. Every pattern is keyboard-operable and closes with
   Escape. Listing data comes from data.js (sample data, see its header).
   ========================================================================== */

(function () {
  'use strict';

  var CARS = window.MP_CARS || [];
  var SOLD = window.MP_SOLD || [];

  /* One set of facts used everywhere (R04). Hours follow the Location page;
     the phone number follows the site, not AutoTrader. Both are open
     questions for Mayfair Prestige. */
  var FACTS = {
    phone: '020 7723 2860',
    tel: '+442077232860',
    whatsapp: '+44 7791 777777',
    wa: '447791777777',
    email: 'info@mayfairprestigeuk.co.uk',
    address: '91 Crawford Street, Marylebone, London W1H 2HD',
    hours: [['Monday to Friday', '08:30 – 19:00'], ['Saturday', '08:30 – 18:00'], ['Sunday', 'By appointment']]
  };

  /* --- Small helpers ---------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }
  function num(n) { return Math.round(n).toLocaleString('en-GB'); }
  function carName(c) { return c.year + ' ' + c.make + ' ' + c.model; }
  function stockNo(c) { return 'MP' + (2101 + CARS.indexOf(c)); }
  function byId(id) { for (var i = 0; i < CARS.length; i++) { if (CARS[i].id === id) return CARS[i]; } return null; }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(window.sessionStorage.getItem(key) || 'null');
      window.sessionStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* private mode */ }
    return null;
  }

  /* Query parameters (?car=, ?make=, ?like=) carry context between pages.
     Some hosts strip the query string when a page is opened, so the last
     clicked link's query is also kept for the page it points to. */
  function currentFile() { return (window.location.pathname.split('/').pop() || 'index.html'); }
  function param(name) {
    var v = null;
    try { v = new URLSearchParams(window.location.search).get(name); } catch (e) { v = null; }
    if (v) return v;
    /* Only fall back when the address arrived with no query at all */
    if (window.location.search) return null;
    var saved = store('mp-q');
    if (saved && saved.file === currentFile()) {
      try { return new URLSearchParams(saved.q).get(name); } catch (e) { return null; }
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.indexOf('?') !== -1) store('mp-q', { file: href.split('?')[0].split('/').pop(), q: href.split('?')[1].split('#')[0] });
    else if (href.charAt(0) !== '#') { try { window.sessionStorage.removeItem('mp-q'); } catch (err) { /* private mode */ } }
  }, true);

  /* Every link to another prototype page is written with ~/ in src and
     resolved by the build. Pages live in /pages, so links built in script
     need to know where they are. */
  function pageHref(file) { return (/\/pages\//.test(window.location.pathname) ? '' : 'pages/') + file; }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#wf-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'wf-toast';
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { t.hidden = true; }, 2600);
  }

  function reference(prefix) { return prefix + '-' + String(Math.floor(1000 + Math.random() * 9000)); }

  /* Indicative hire purchase payment. For the prototype only: the rate is
     illustrative and is not a representative example (R25, R55). */
  var APR = 9.9;
  function monthly(price, depositPct, months, balloonPct) {
    var deposit = price * depositPct / 100;
    var balloon = price * (balloonPct || 0) / 100;
    var principal = price - deposit;
    var r = Math.pow(1 + APR / 100, 1 / 12) - 1;
    var pvBalloon = balloon / Math.pow(1 + r, months);
    var pay = (principal - pvBalloon) * r / (1 - Math.pow(1 + r, -months));
    return { deposit: deposit, balloon: balloon, monthly: pay, total: deposit + pay * months + balloon };
  }

  /* --- Facts (R04, R05) --------------------------------------------------- */
  function initFacts() {
    $all('[data-fact]').forEach(function (el) {
      var k = el.getAttribute('data-fact');
      if (k === 'phone-link') { el.textContent = FACTS.phone; el.setAttribute('href', 'tel:' + FACTS.tel); }
      else if (k === 'wa-link') { el.textContent = FACTS.whatsapp; el.setAttribute('href', 'https://wa.me/' + FACTS.wa); }
      else if (k === 'email-link') { el.textContent = FACTS.email; el.setAttribute('href', 'mailto:' + FACTS.email); }
      else if (k === 'hours') {
        el.innerHTML = FACTS.hours.map(function (h) { return '<dt>' + h[0] + '</dt><dd>' + h[1] + '</dd>'; }).join('');
      } else if (FACTS[k]) el.textContent = FACTS[k];
    });
  }

  /* --- Accordions ----------------------------------------------------------- */
  function initAccordions() {
    $all('.accordion-title').forEach(function (title) {
      title.setAttribute('aria-expanded', title.closest('.accordion-item').classList.contains('open') ? 'true' : 'false');
      title.addEventListener('click', function () {
        var item = title.closest('.accordion-item');
        var willOpen = !item.classList.contains('open');
        item.classList.toggle('open', willOpen);
        title.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  }

  /* --- Tabs ------------------------------------------------------------------
     <button class="tab" data-tab="panel-id">; a #hash matching a panel id
     opens that tab on load. */
  function activateTab(tab) {
    var group = tab.closest('.tabs');
    $all('.tab', group).forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    var target = document.getElementById(tab.getAttribute('data-tab'));
    if (!target) return;
    $all('.tab-panel', target.parentElement).forEach(function (p) { if (p.parentElement === target.parentElement) p.classList.remove('active'); });
    target.classList.add('active');
  }
  function initTabs() {
    $all('.tabs').forEach(function (group) {
      group.setAttribute('role', 'tablist');
      $all('.tab', group).forEach(function (tab) {
        tab.setAttribute('role', 'tab');
        tab.addEventListener('click', function () { activateTab(tab); });
      });
    });
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      var t = $('.tab[data-tab="' + hash + '"]');
      if (t) activateTab(t);
    }
    $all('[data-open-tab]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = $('.tab[data-tab="' + a.getAttribute('data-open-tab') + '"]');
        if (!t) return;
        e.preventDefault();
        activateTab(t);
        t.scrollIntoView({ block: 'start' });
      });
    });
  }

  /* --- Modals ------------------------------------------------------------- */
  var lastFocus = null;
  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    var panel = $('.wf-modal-panel', modal);
    if (panel) { panel.setAttribute('tabindex', '-1'); panel.focus(); }
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initModals() {
    document.addEventListener('click', function (ev) {
      var trigger = ev.target.closest && ev.target.closest('[data-modal-open]');
      if (trigger) { ev.preventDefault(); openModal(trigger.getAttribute('data-modal-open')); return; }
      var m = ev.target.closest && ev.target.closest('.wf-modal');
      if (m && (ev.target === m || ev.target.classList.contains('wf-modal-close'))) closeModal(m);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      $all('.wf-modal.open').forEach(closeModal);
    });
  }

  /* --- Notes switch (R02) ------------------------------------------------
     Shows or hides the proposal panel and the numbered annotations. Off by
     default; remembered for the session so it carries between prototypes. */
  function initNotes() {
    var hidden = true;
    try { hidden = window.sessionStorage.getItem('mp-notes') !== 'on'; } catch (e) { /* private mode */ }
    var toggles = $all('[data-notes-toggle]');
    if (!$('.wf-note, .proposal')) {
      toggles.forEach(function (t) { t.hidden = true; });
      return;
    }
    function apply() {
      document.body.classList.toggle('wf-notes-hidden', hidden);
      toggles.forEach(function (t) {
        t.setAttribute('aria-checked', hidden ? 'false' : 'true');
        var l = $('.notes-label', t);
        if (l) l.textContent = hidden ? 'Notes off' : 'Notes on';
      });
    }
    toggles.forEach(function (t) {
      t.addEventListener('click', function () {
        hidden = !hidden;
        try { window.sessionStorage.setItem('mp-notes', hidden ? 'off' : 'on'); } catch (e) { /* private mode */ }
        apply();
        if (!hidden) {
          var panel = $('.proposal');
          if (panel && panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ block: 'start' });
        }
      });
    });
    apply();
  }

  /* --- Prototype navigator and pager (R01, R03) ------------------------- */
  function initProtoNav() {
    var file = currentFile().replace('.html', '') || 'index';
    var links = $all('.proto-links a[data-proto]');
    var index = -1;
    links.forEach(function (a, i) {
      if (a.getAttribute('data-proto').split(' ').indexOf(file) !== -1) { a.setAttribute('aria-current', 'page'); index = i; }
    });
    var current = $('.proto-links a[aria-current]');
    if (current && window.innerWidth < 1180) {
      var list = current.closest('.proto-links');
      if (list) list.scrollLeft = current.offsetLeft - 16;
    }
    var pager = $('[data-proto-pager]');
    if (!pager || index < 0) return;
    function label(a) { return a.textContent.replace(/\s+/g, ' ').trim(); }
    var html = '';
    if (index > 0) html += '<a class="prev" href="' + links[index - 1].getAttribute('href') + '"><span class="wf-meta">Previous</span>' + esc(label(links[index - 1])) + '</a>';
    if (index < links.length - 1) html += '<a class="next" href="' + links[index + 1].getAttribute('href') + '"><span class="wf-meta">Next</span>' + esc(label(links[index + 1])) + '</a>';
    pager.innerHTML = html;
  }

  function initHeaderHeight() {
    var header = $('.site-header');
    if (!header) return;
    function set() { document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px'); }
    set();
    window.addEventListener('resize', set);
  }

  /* --- Shortlist (R19, R26) ------------------------------------------------ */
  function saved() { return store('mp-saved') || []; }
  function isSaved(id) { return saved().indexOf(id) !== -1; }
  function toggleSaved(id) {
    var s = saved();
    var i = s.indexOf(id);
    if (i === -1) s.push(id); else s.splice(i, 1);
    store('mp-saved', s);
    var c = byId(id);
    toast(i === -1 ? 'Saved ' + carName(c) + ' to your shortlist' : 'Removed from your shortlist');
    renderSavedState();
  }
  function renderSavedState() {
    $all('[data-save]').forEach(function (b) {
      var on = isSaved(b.getAttribute('data-save'));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Saved' : 'Save';
    });
    $all('[data-saved-count]').forEach(function (el) { el.textContent = saved().length; });
    var body = $('#shortlist-body');
    if (!body) return;
    var s = saved().map(byId).filter(Boolean);
    body.innerHTML = s.length ? s.map(function (c) {
      return '<div class="mini-car">' + photo(c, 'mini') + '<div><h3><a href="' + pageHref('car.html') + '?car=' + c.id + '">' + esc(carName(c)) + '</a></h3><p>' + money(c.price) + ' · ' + num(c.miles) + ' miles</p><button type="button" class="btn-link small" data-save="' + c.id + '">Remove</button></div></div>';
    }).join('') : '<p class="muted">Nothing saved yet. Use Save on any car to keep it here for this visit.</p>';
    var foot = $('#shortlist-foot');
    if (foot) foot.hidden = !s.length;
  }
  function initShortlist() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-save]');
      if (b) { e.preventDefault(); toggleSaved(b.getAttribute('data-save')); return; }
      var o = e.target.closest && e.target.closest('[data-drawer-open]');
      if (o) { e.preventDefault(); setDrawer(document.getElementById(o.getAttribute('data-drawer-open')), true); return; }
      var x = e.target.closest && e.target.closest('[data-drawer-close]');
      if (x) { e.preventDefault(); setDrawer(x.closest('.drawer'), false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') $all('.drawer.open').forEach(function (d) { setDrawer(d, false); });
    });
    var email = $('#shortlist-email');
    if (email) email.addEventListener('click', function () { toast('The shortlist would be emailed to you, with consent to contact'); });
    renderSavedState();
  }
  function setDrawer(d, open) {
    if (!d) return;
    d.classList.toggle('open', open);
    d.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) { var h = $('h2', d); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
  }

  /* --- Car card markup (R16, R17, R18) ------------------------------------ */
  function photo(c, kind) {
    if (!c.photos) return '<div class="wf-placeholder" data-photo="' + c.id + '" data-photo-n="0">Photography in progress</div>';
    var label = kind === 'mini' ? 'Photo' : 'Photo · ' + esc(c.make) + ' front three-quarter';
    return '<div class="wf-placeholder" data-photo="' + c.id + '" data-photo-n="0">' + label + '</div>';
  }
  function statusBadge(c) {
    if (!c.status) return '';
    return '<span class="badge ' + (c.status === 'New arrival' ? 'solid' : '') + ' status">' + esc(c.status) + '</span>';
  }
  function carCard(c, opts) {
    opts = opts || {};
    var href = pageHref('car.html') + '?car=' + c.id;
    return '<article class="car-card">' +
      '<div class="car-media">' + photo(c) + statusBadge(c) +
      '<button type="button" class="save-btn" data-save="' + c.id + '" aria-pressed="false" aria-label="Save ' + esc(carName(c)) + '">Save</button>' +
      '<span class="price-tag">' + money(c.price) + '</span>' +
      (c.photos ? '<span class="count">' + c.photos + ' photos</span>' : '') + '</div>' +
      '<div class="car-body"><h3><a href="' + href + '">' + esc(carName(c)) + '</a></h3>' +
      '<p class="car-der">' + esc(c.der) + '</p>' +
      '<dl class="car-specs"><div><dt>Miles</dt><dd>' + num(c.miles) + '</dd></div><div><dt>Colour</dt><dd>' + esc(c.colour) + '</dd></div><div><dt>Gearbox</dt><dd>' + esc(c.gearbox) + '</dd></div><div><dt>Fuel</dt><dd>' + esc(c.fuel) + '</dd></div></dl></div>' +
      (opts.compare ? '<label class="compare-tick"><input type="checkbox" data-compare="' + c.id + '"> Compare</label>' : '') +
      '<div class="car-actions"><a class="btn btn-secondary" href="' + href + '">View car</a><a class="btn" href="' + pageHref('viewing.html') + '?car=' + c.id + '">Book a viewing</a></div>' +
      '</article>';
  }

  /* Collections (R11) */
  var COLLECTIONS = [
    { key: 'rolls-royce', label: 'Rolls-Royce', test: function (c) { return c.make === 'Rolls-Royce'; } },
    { key: 'ferrari', label: 'Ferrari', test: function (c) { return c.make === 'Ferrari'; } },
    { key: 'g-class', label: 'G-Class', test: function (c) { return c.model === 'G Class'; } },
    { key: 'classics', label: 'Classics', test: function (c) { return c.year < 2000; } },
    { key: 'electric', label: 'Electric and hybrid', test: function (c) { return /Electric|Hybrid/.test(c.fuel); } },
    { key: 'suv', label: 'SUVs', test: function (c) { return c.body === 'SUV'; } }
  ];
  function collection(key) { for (var i = 0; i < COLLECTIONS.length; i++) { if (COLLECTIONS[i].key === key) return COLLECTIONS[i]; } return null; }

  /* Budget bands that reach every car (R13) */
  var BANDS = [0, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 400000, 600000];
  var MILES = [[1000, 'Under 1,000'], [5000, 'Under 5,000'], [10000, 'Under 10,000'], [25000, 'Under 25,000'], [50000, 'Under 50,000']];
  var ERAS = [['classic', 'Classic (before 2000)', function (c) { return c.year < 2000; }], ['modern', '2000 to 2019', function (c) { return c.year >= 2000 && c.year < 2020; }], ['current', '2020 onwards', function (c) { return c.year >= 2020; }]];
  function colourFamily(c) {
    var s = c.colour.toLowerCase();
    if (/white|bianco|avus/.test(s)) return 'White';
    if (/black|nero|onyx|obsidian|raven/.test(s)) return 'Black';
    if (/rosso|red|barchetta|scuderia/.test(s)) return 'Red';
    if (/blue|sapphire|glacier/.test(s)) return 'Blue';
    if (/green|olive|british racing/.test(s)) return 'Green';
    if (/giallo|yellow/.test(s)) return 'Yellow';
    if (/grey|silver|grigio|lynx|iridium|selenite|carpathian|moonbeam|sand|opalith/.test(s)) return 'Grey or silver';
    return 'Other';
  }

  /* --- Prototype 1: homepage (R10, R11, R42) ------------------------------ */
  function fillMakeModel(makeSel, modelSel) {
    var makes = [];
    CARS.forEach(function (c) { if (makes.indexOf(c.make) === -1) makes.push(c.make); });
    makes.sort();
    makeSel.innerHTML = '<option value="">All makes</option>' + makes.map(function (m) {
      var n = CARS.filter(function (c) { return c.make === m; }).length;
      return '<option value="' + esc(m) + '">' + esc(m) + ' (' + n + ')</option>';
    }).join('');
    function models() {
      var mk = makeSel.value;
      var list = [];
      CARS.forEach(function (c) { if ((!mk || c.make === mk) && list.indexOf(c.model) === -1) list.push(c.model); });
      list.sort();
      var keep = modelSel.value;
      modelSel.innerHTML = '<option value="">All models</option>' + list.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('');
      if (list.indexOf(keep) !== -1) modelSel.value = keep;
    }
    makeSel.addEventListener('change', models);
    models();
  }
  function bandOptions(sel, isMax) {
    sel.innerHTML = '<option value="">' + (isMax ? 'No max' : 'No min') + '</option>' + BANDS.slice(1, -1).map(function (b) { return '<option value="' + b + '">' + money(b) + '</option>'; }).join('');
  }

  function initHome() {
    var app = $('#home-app');
    if (!app) return;
    var form = $('#home-search');
    fillMakeModel($('#hs-make'), $('#hs-model'));
    bandOptions($('#hs-min'), false);
    bandOptions($('#hs-max'), true);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = [];
      [['make', '#hs-make'], ['model', '#hs-model'], ['pmin', '#hs-min'], ['pmax', '#hs-max']].forEach(function (p) { var v = $(p[1]).value; if (v) q.push(p[0] + '=' + encodeURIComponent(v)); });
      var href = pageHref('inventory.html') + (q.length ? '?' + q.join('&') : '');
      store('mp-q', { file: 'inventory.html', q: q.join('&') });
      window.location.href = href;
    });
    function liveCount() {
      var n = CARS.filter(function (c) {
        return (!$('#hs-make').value || c.make === $('#hs-make').value) && (!$('#hs-model').value || c.model === $('#hs-model').value) &&
          (!$('#hs-min').value || c.price >= +$('#hs-min').value) && (!$('#hs-max').value || c.price <= +$('#hs-max').value);
      }).length;
      $('#hs-submit').textContent = 'Show ' + n + ' car' + (n === 1 ? '' : 's');
    }
    $all('select', form).forEach(function (s) { s.addEventListener('change', liveCount); });
    liveCount();

    var latest = CARS.slice().sort(function (a, b) { return a.arrived - b.arrived; }).slice(0, 6);
    $('#latest').innerHTML = latest.map(function (c) { return carCard(c); }).join('');

    $('#collections').innerHTML = COLLECTIONS.map(function (k) {
      var n = CARS.filter(k.test).length;
      return '<a class="collection" href="' + pageHref('inventory.html') + '?collection=' + k.key + '"><div class="wf-placeholder" data-collection="' + k.key + '">' + esc(k.label) + ' photo</div><b>' + esc(k.label) + '</b><span>' + n + ' in stock</span></a>';
    }).join('');
    renderSavedState();
  }

  /* --- Prototype 1: inventory (R12–R19) ------------------------------------ */
  function initInventory() {
    var app = $('#inv-app');
    if (!app) return;
    var PER = 12;
    var state = { page: 1 };
    var f = {
      make: $('#f-make'), model: $('#f-model'), pmin: $('#f-pmin'), pmax: $('#f-pmax'), miles: $('#f-miles'),
      era: $('#f-era'), body: $('#f-body'), fuel: $('#f-fuel'), gearbox: $('#f-gearbox'), colour: $('#f-colour'), sort: $('#f-sort')
    };
    fillMakeModel(f.make, f.model);
    bandOptions(f.pmin, false);
    bandOptions(f.pmax, true);
    f.miles.innerHTML = '<option value="">Any mileage</option>' + MILES.map(function (m) { return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join('');
    f.era.innerHTML = '<option value="">Any year</option>' + ERAS.map(function (e) { return '<option value="' + e[0] + '">' + e[1] + '</option>'; }).join('');
    function fillFrom(sel, getter, label) {
      var vals = [];
      CARS.forEach(function (c) { var v = getter(c); if (vals.indexOf(v) === -1) vals.push(v); });
      vals.sort();
      sel.innerHTML = '<option value="">' + label + '</option>' + vals.map(function (v) { return '<option>' + esc(v) + '</option>'; }).join('');
    }
    fillFrom(f.body, function (c) { return c.body; }, 'Any body style');
    fillFrom(f.fuel, function (c) { return c.fuel; }, 'Any fuel');
    fillFrom(f.gearbox, function (c) { return c.gearbox; }, 'Any gearbox');
    fillFrom(f.colour, colourFamily, 'Any colour');

    var coll = collection(param('collection'));
    ['make', 'model', 'pmin', 'pmax'].forEach(function (k) {
      var v = param(k);
      if (!v) return;
      if (k === 'make') { f.make.value = v; f.make.dispatchEvent(new Event('change')); } else f[k].value = v;
    });

    $all('#coll-chips .chip').forEach(function (b) {
      b.setAttribute('aria-pressed', coll && b.getAttribute('data-coll') === coll.key ? 'true' : 'false');
      var k = collection(b.getAttribute('data-coll'));
      if (k) $('.ct', b).textContent = CARS.filter(k.test).length;
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        $all('#coll-chips .chip').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        coll = on ? collection(b.getAttribute('data-coll')) : null;
        state.page = 1;
        render();
      });
    });

    function matches(c, skip) {
      if (coll && !coll.test(c)) return false;
      if (skip !== 'make' && f.make.value && c.make !== f.make.value) return false;
      if (skip !== 'model' && f.model.value && c.model !== f.model.value) return false;
      if (skip !== 'pmin' && f.pmin.value && c.price < +f.pmin.value) return false;
      if (skip !== 'pmax' && f.pmax.value && c.price > +f.pmax.value) return false;
      if (skip !== 'miles' && f.miles.value && c.miles >= +f.miles.value) return false;
      if (skip !== 'era' && f.era.value) { var e = ERAS.filter(function (x) { return x[0] === f.era.value; })[0]; if (e && !e[2](c)) return false; }
      if (skip !== 'body' && f.body.value && c.body !== f.body.value) return false;
      if (skip !== 'fuel' && f.fuel.value && c.fuel !== f.fuel.value) return false;
      if (skip !== 'gearbox' && f.gearbox.value && c.gearbox !== f.gearbox.value) return false;
      if (skip !== 'colour' && f.colour.value && colourFamily(c) !== f.colour.value) return false;
      return true;
    }
    /* Counts on options, and options with no cars disabled (R14) */
    function counts() {
      ['body', 'fuel', 'gearbox', 'colour', 'miles', 'era'].forEach(function (k) {
        $all('option', f[k]).forEach(function (o) {
          if (!o.value) return;
          if (!o.dataset.base) o.dataset.base = o.textContent;
          var n = CARS.filter(function (c) {
            if (!matches(c, k)) return false;
            if (k === 'body') return c.body === o.value;
            if (k === 'fuel') return c.fuel === o.value;
            if (k === 'gearbox') return c.gearbox === o.value;
            if (k === 'colour') return colourFamily(c) === o.value;
            if (k === 'miles') return c.miles < +o.value;
            if (k === 'era') return ERAS.filter(function (x) { return x[0] === o.value; })[0][2](c);
            return true;
          }).length;
          o.textContent = o.dataset.base + ' (' + n + ')';
          o.disabled = n === 0 && f[k].value !== o.value;
        });
      });
      $all('option', f.pmin).concat($all('option', f.pmax)).forEach(function (o) {
        if (!o.value) return;
        if (!o.dataset.base) o.dataset.base = o.textContent;
      });
    }
    function sortList(list) {
      var s = f.sort.value;
      var fns = {
        'price-desc': function (a, b) { return b.price - a.price; },
        'price-asc': function (a, b) { return a.price - b.price; },
        'newest': function (a, b) { return a.arrived - b.arrived; },
        'miles': function (a, b) { return a.miles - b.miles; },
        'year-desc': function (a, b) { return b.year - a.year; },
        'year-asc': function (a, b) { return a.year - b.year; }
      };
      return list.sort(fns[s] || fns['price-desc']);
    }
    function activeChips() {
      var out = [];
      if (coll) out.push(['coll', coll.label]);
      [['make', 'Make'], ['model', 'Model'], ['pmin', 'From'], ['pmax', 'Up to'], ['miles', ''], ['era', ''], ['body', ''], ['fuel', ''], ['gearbox', ''], ['colour', '']].forEach(function (p) {
        var el = f[p[0]];
        if (el.value) { var t = el.options[el.selectedIndex].textContent.replace(/ \(\d+\)$/, ''); out.push([p[0], (p[1] ? p[1] + ' ' : '') + t]); }
      });
      $('#active-filters').innerHTML = out.map(function (o) { return '<button type="button" class="chip" data-clear="' + o[0] + '" aria-label="Remove filter ' + esc(o[1]) + '">' + esc(o[1]) + ' ×</button>'; }).join('') +
        (out.length ? '<button type="button" class="btn-link small" data-clear="all">Clear all</button>' : '');
      $all('[data-filter-count]').forEach(function (el) { el.textContent = out.length ? ' (' + out.length + ')' : ''; });
    }
    function render() {
      counts();
      var list = sortList(CARS.filter(function (c) { return matches(c); }));
      var pages = Math.max(1, Math.ceil(list.length / PER));
      if (state.page > pages) state.page = pages;
      var slice = list.slice((state.page - 1) * PER, state.page * PER);
      $all('[data-result-count]').forEach(function (el) { el.textContent = list.length + ' car' + (list.length === 1 ? '' : 's'); });
      $('#results').innerHTML = slice.length ? slice.map(function (c) { return carCard(c, { compare: true }); }).join('') :
        '<div class="empty-state"><h3>No cars match these filters</h3><p class="muted">We can often find a car that isn\'t in stock. Tell us what you\'re after and we\'ll look.</p><a class="btn" href="' + pageHref('by-invitation.html') + '?make=' + encodeURIComponent(f.make.value) + '#find">Find me a car</a></div>';
      var pg = '';
      if (pages > 1) {
        pg += '<li><button type="button" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + '>Prev</button></li>';
        for (var i = 1; i <= pages; i++) pg += '<li><button type="button" data-page="' + i + '"' + (i === state.page ? ' aria-current="page"' : '') + '>' + i + '</button></li>';
        pg += '<li><button type="button" data-page="' + (state.page + 1) + '"' + (state.page === pages ? ' disabled' : '') + '>Next</button></li>';
      }
      $('#pages').innerHTML = pg;
      activeChips();
      renderSavedState();
      syncCompareTicks();
      if (window.MP_PHOTOS) window.MP_PHOTOS.apply();
    }
    Object.keys(f).forEach(function (k) { f[k].addEventListener('change', function () { state.page = 1; render(); }); });
    $('#pages').addEventListener('click', function (e) {
      var b = e.target.closest('[data-page]');
      if (!b || b.disabled) return;
      state.page = +b.getAttribute('data-page');
      render();
      $('#results-top').scrollIntoView({ block: 'start' });
    });
    $('#active-filters').addEventListener('click', function (e) {
      var b = e.target.closest('[data-clear]');
      if (!b) return;
      var k = b.getAttribute('data-clear');
      if (k === 'all') { Object.keys(f).forEach(function (x) { if (x !== 'sort') f[x].value = ''; }); coll = null; $all('#coll-chips .chip').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); }); f.make.dispatchEvent(new Event('change')); }
      else if (k === 'coll') { coll = null; $all('#coll-chips .chip').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); }); }
      else { f[k].value = ''; if (k === 'make') f.make.dispatchEvent(new Event('change')); }
      state.page = 1;
      render();
    });

    /* Mobile filter sheet (R15) */
    var sheet = $('#filters');
    function setSheet(open) {
      sheet.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      $('#open-filters').setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var h = $('h2', sheet); h.setAttribute('tabindex', '-1'); h.focus(); } else { $('#open-filters').focus(); }
    }
    $('#open-filters').addEventListener('click', function () { setSheet(true); });
    $all('[data-close-filters]').forEach(function (b) { b.addEventListener('click', function () { setSheet(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('open')) setSheet(false); });
    $('#m-sort').innerHTML = f.sort.innerHTML;
    $('#m-sort').addEventListener('change', function () { f.sort.value = this.value; render(); });

    /* Compare up to three (R19) */
    var compare = store('mp-compare') || [];
    function syncCompareTicks() {
      $all('[data-compare]').forEach(function (cb) {
        var id = cb.getAttribute('data-compare');
        cb.checked = compare.indexOf(id) !== -1;
        cb.disabled = !cb.checked && compare.length >= 3;
      });
      var tray = $('#compare-tray');
      tray.hidden = compare.length === 0;
      $('#compare-slots').innerHTML = compare.map(function (id) { var c = byId(id); return '<span class="slot">' + esc(carName(c)) + '</span>'; }).join('') +
        (compare.length < 3 ? '<span class="slot muted">Add ' + (3 - compare.length) + ' more</span>' : '');
      $('#compare-go').disabled = compare.length < 2;
      $('#compare-go').textContent = 'Compare ' + compare.length + ' cars';
    }
    $('#results').addEventListener('change', function (e) {
      var cb = e.target.closest('[data-compare]');
      if (!cb) return;
      var id = cb.getAttribute('data-compare');
      var i = compare.indexOf(id);
      if (cb.checked && i === -1 && compare.length < 3) compare.push(id);
      if (!cb.checked && i !== -1) compare.splice(i, 1);
      store('mp-compare', compare);
      syncCompareTicks();
    });
    $('#compare-clear').addEventListener('click', function () { compare = []; store('mp-compare', compare); syncCompareTicks(); });
    $('#compare-go').addEventListener('click', function () {
      var cs = compare.map(byId);
      var rows = [['Price', function (c) { return money(c.price); }], ['Mileage', function (c) { return num(c.miles) + ' miles'; }], ['Year', function (c) { return c.year; }], ['Colour', function (c) { return esc(c.colour); }], ['Interior', function (c) { return esc(c.interior); }], ['Owners', function (c) { return c.owners == null ? 'Ask us' : c.owners; }], ['Body', function (c) { return esc(c.body); }], ['Gearbox', function (c) { return esc(c.gearbox); }], ['Fuel', function (c) { return esc(c.fuel); }], ['Drive', function (c) { return esc(c.drive || '–'); }], ['From per month', function (c) { return money(monthly(c.price, 20, 48, 0).monthly) + '*'; }]];
      $('#compare-table').innerHTML = '<thead><tr><th scope="col"><span class="small muted">Comparing</span></th>' + cs.map(function (c) { return '<th scope="col"><a href="' + pageHref('car.html') + '?car=' + c.id + '">' + esc(carName(c)) + '</a></th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th>' + cs.map(function (c) { return '<td>' + r[1](c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
      openModal('compare-modal');
    });

    render();
  }

  /* --- Prototype 2: car page (R20–R29) ------------------------------------- */
  var OPTIONS = {
    'Ferrari': ['Carbon-fibre racing seats', 'Carbon-fibre steering wheel with LEDs', 'Scuderia Ferrari shields', 'Front lift system', 'Coloured brake callipers', 'Passenger display', 'Daytona-style stitching', 'Forged wheels'],
    'Rolls-Royce': ['Starlight headliner', 'Bespoke audio', 'Lambswool floor mats', 'Rear theatre configuration', 'Coachline', 'Illuminated treadplates', 'Night vision', 'Head-up display'],
    'Mercedes-Benz': ['AMG Night Package', 'Burmester surround sound', 'Rear entertainment', 'Massage seats', 'AMG carbon trim', '22-inch AMG wheels', 'Head-up display', 'Off-road package'],
    'default': ['Heated and ventilated seats', 'Premium audio', 'Panoramic roof', 'Adaptive cruise control', '360-degree camera', 'Upgraded wheels', 'Ambient lighting', 'Soft-close doors']
  };
  function carDescription(c) {
    return 'This ' + carName(c) + ' is finished in ' + c.colour + ' with ' + c.interior.toLowerCase() + ', and has covered ' + num(c.miles) + ' miles. ' +
      '[Two or three sentences written in house about this particular car: its specification, its history and what makes it worth seeing. Sample text.]';
  }
  function photoGroups(n) {
    var ext = Math.round(n * 0.45), int = Math.round(n * 0.35);
    return [['Exterior', 0, ext], ['Interior', ext, ext + int], ['Details', ext + int, n]];
  }
  function initCar() {
    var app = $('#car-app');
    if (!app) return;
    var c = byId(param('car')) || byId('2014-ferrari-458');
    var name = carName(c);
    document.title = name + ' – Mayfair Prestige prototype';
    $all('[data-car]').forEach(function (el) {
      var k = el.getAttribute('data-car');
      var v = {
        name: name, der: c.der, price: money(c.price), miles: num(c.miles) + ' miles', year: c.year, colour: c.colour, interior: c.interior,
        gearbox: c.gearbox, fuel: c.fuel, body: c.body, drive: c.drive || '–', owners: c.owners == null ? 'Ask us' : (c.owners === 0 ? 'Delivery miles' : c.owners), stock: stockNo(c),
        photos: c.photos ? c.photos + ' photos' : 'Photography in progress', make: c.make, desc: carDescription(c),
        speed: c.speed ? c.speed + 'mph' : '–'
      }[k];
      if (v !== undefined) el.textContent = v;
    });
    var fin = monthly(c.price, 20, 48, 0);
    $('#fin-from').textContent = money(fin.monthly);
    $('#fin-link').setAttribute('href', pageHref('finance.html') + '?car=' + c.id);
    ['viewing', 'reserve'].forEach(function (k) { $all('[data-go="' + k + '"]').forEach(function (a) { a.setAttribute('href', pageHref(k + '.html') + '?car=' + c.id); }); });
    $all('[data-save]').forEach(function (b) { b.setAttribute('data-save', c.id); });
    var waText = 'Hello, I\'m interested in the ' + name + ' (' + stockNo(c) + ', ' + money(c.price) + ').';
    $('#wa-msg').textContent = waText;
    $all('[data-wa-car]').forEach(function (a) { a.setAttribute('href', 'https://wa.me/' + FACTS.wa + '?text=' + encodeURIComponent(waText)); });
    $('#serp-title').textContent = c.year + ' ' + c.make + ' ' + c.model + ', ' + num(c.miles) + ' miles | Mayfair Prestige';
    $('#serp-url').textContent = 'mayfairprestigeuk.co.uk › vehicles › ' + c.id;
    $('#serp-desc').textContent = c.year + ' ' + c.make + ' ' + c.model + ' ' + c.der + ' in ' + c.colour + '. ' + num(c.miles) + ' miles, ' + money(c.price) + '. View by appointment at our Marylebone showroom.';

    /* Key information (R21) – sample */
    var info = [
      ['Owners', c.owners == null ? 'Ask us' : (c.owners === 0 ? 'None, delivery miles' : c.owners + ' from new')],
      ['Service history', c.year < 2000 ? 'Restoration and service file' : 'Full main-dealer history'],
      ['Last service', 'March 2026 at ' + num(Math.max(0, c.miles - 1200)) + ' miles'],
      ['Warranty', c.year >= 2023 ? 'Manufacturer warranty to 2028' : '[12-month warranty to confirm]'],
      ['Supplied', c.make === 'Micro' ? 'European supplied, left-hand drive' : 'UK supplied, right-hand drive'],
      ['Keys and books', 'Two keys, handbooks and tool kit']
    ];
    $('#keyinfo').innerHTML = info.map(function (i) { return '<li><span>' + i[0] + '</span><b>' + esc(i[1]) + '</b></li>'; }).join('');
    $('#options').innerHTML = (OPTIONS[c.make] || OPTIONS['default']).map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('');

    /* Gallery (R22) */
    var n = c.photos || 1;
    var cur = 0;
    var groups = photoGroups(n);
    function groupOf(i) { for (var g = 0; g < groups.length; g++) { if (i >= groups[g][1] && i < groups[g][2]) return groups[g][0]; } return 'Exterior'; }
    function show(i) {
      cur = (i + n) % n;
      var label = c.photos ? 'Photo ' + (cur + 1) + ' of ' + n + ' · ' + groupOf(cur).toLowerCase() : 'Photography in progress';
      $('#g-main').textContent = label;
      $('#g-main').setAttribute('data-photo-n', cur);
      $('#fs-main').textContent = label;
      $('#fs-main').setAttribute('data-photo-n', cur);
      $('#g-count').textContent = c.photos ? (cur + 1) + ' / ' + n : '0 photos';
      $all('.thumb').forEach(function (t) { t.setAttribute('aria-current', +t.getAttribute('data-i') === cur ? 'true' : 'false'); });
      $all('#g-groups .chip').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-g') === groupOf(cur) ? 'true' : 'false'); });
      if (window.MP_PHOTOS) window.MP_PHOTOS.apply();
    }
    function thumbs(group) {
      var g = groups.filter(function (x) { return x[0] === group; })[0] || groups[0];
      var out = '';
      for (var i = g[1]; i < Math.min(g[2], g[1] + 8); i++) out += '<button type="button" class="thumb" data-i="' + i + '" data-photo="' + c.id + '" data-photo-n="' + i + '" aria-label="Photo ' + (i + 1) + '">' + (i + 1) + '</button>';
      $('#thumbs').innerHTML = out;
    }
    $('#g-groups').innerHTML = c.photos ? groups.map(function (g) { return '<button type="button" class="chip" data-g="' + g[0] + '" aria-pressed="false">' + g[0] + ' <span class="ct">' + (g[2] - g[1]) + '</span></button>'; }).join('') : '';
    $('#g-groups').addEventListener('click', function (e) { var b = e.target.closest('[data-g]'); if (!b) return; thumbs(b.getAttribute('data-g')); var g = groups.filter(function (x) { return x[0] === b.getAttribute('data-g'); })[0]; show(g[1]); });
    $('#thumbs').addEventListener('click', function (e) { var t = e.target.closest('.thumb'); if (t) show(+t.getAttribute('data-i')); });
    $all('[data-g-step]').forEach(function (b) { b.addEventListener('click', function () { show(cur + (+b.getAttribute('data-g-step'))); }); });
    document.addEventListener('keydown', function (e) {
      if (!$('#fullscreen').classList.contains('open')) return;
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
    $('#g-main').setAttribute('data-photo', c.id);
    $('#fs-main').setAttribute('data-photo', c.id);
    thumbs('Exterior');
    show(0);

    /* More like this (R27) */
    var similar = CARS.filter(function (x) { return x !== c && (x.make === c.make || (Math.abs(x.price - c.price) <= c.price * 0.3 && x.body === c.body)); })
      .sort(function (a, b) { return Math.abs(a.price - c.price) - Math.abs(b.price - c.price); }).slice(0, 3);
    $('#similar').innerHTML = similar.map(function (x) { return carCard(x); }).join('');
    $('#similar-all').setAttribute('href', pageHref('inventory.html') + '?make=' + encodeURIComponent(c.make));

    /* Share (R26) */
    var link = 'https://www.mayfairprestigeuk.co.uk/vehicles/' + c.id + '/';
    $('#share-link').value = link;
    $('#share-wa').setAttribute('href', 'https://wa.me/?text=' + encodeURIComponent(name + ' at Mayfair Prestige ' + link));
    $('#share-email').setAttribute('href', 'mailto:?subject=' + encodeURIComponent(name + ' at Mayfair Prestige') + '&body=' + encodeURIComponent(link));
    $('#share-copy').addEventListener('click', function () {
      var input = $('#share-link');
      function fallback() { input.select(); toast('Link selected. Press Ctrl+C or Cmd+C to copy.'); }
      try { navigator.clipboard.writeText(input.value).then(function () { toast('Link copied'); }, fallback); } catch (e) { fallback(); }
    });
    $('#video-request').addEventListener('click', function () { toast('Video call request sent for the ' + name + ' (prototype)'); });

    document.body.classList.add('has-sticky-buy');
    renderSavedState();
    if (window.MP_PHOTOS) window.MP_PHOTOS.apply();
  }

  /* --- Shared: car summary on forms (R31, R33, R35) ------------------------ */
  function fillSummary(c) {
    $all('[data-summary]').forEach(function (box) {
      if (!c) { box.hidden = true; return; }
      box.hidden = false;
      box.innerHTML = photo(c, 'mini') + '<div><h2>' + esc(carName(c)) + '</h2><p class="muted">' + esc(c.der) + '</p><p><b>' + money(c.price) + '</b> · ' + num(c.miles) + ' miles · ' + esc(c.colour) + ' · Stock ' + stockNo(c) + '</p><p><a href="' + pageHref('car.html') + '?car=' + c.id + '">Back to the car</a></p></div>';
    });
    $all('[data-car-field]').forEach(function (inp) { if (c) inp.value = carName(c) + ' (' + stockNo(c) + ')'; });
  }

  /* --- Shared form validation (R33) ----------------------------------------- */
  function validate(form) {
    var ok = true;
    var first = null;
    $all('[required]', form).forEach(function (inp) {
      var field = inp.closest('.field') || inp.closest('fieldset') || inp.parentElement;
      var err = $('.field-error', field);
      var valid = inp.type === 'checkbox' ? inp.checked : inp.value.trim() !== '';
      if (valid && inp.type === 'email') valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value.trim());
      if (valid && inp.type === 'tel') valid = inp.value.replace(/[^\d]/g, '').length >= 10;
      field.classList.toggle('has-error', !valid);
      inp.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) {
        if (!err) { err = document.createElement('p'); err.className = 'field-error'; field.appendChild(err); }
        err.id = (inp.id || 'f') + '-err';
        inp.setAttribute('aria-describedby', err.id);
        err.textContent = inp.getAttribute('data-error') || 'Please complete this field.';
        ok = false;
        if (!first) first = inp;
      } else if (err) err.remove();
    });
    if (first) first.focus();
    return ok;
  }
  /* Forms with data-confirm="id" validate, then swap themselves for the
     confirmation panel and give it a reference number. */
  function initForms() {
    $all('form[data-confirm]').forEach(function (form) {
      form.setAttribute('novalidate', '');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        var conf = document.getElementById(form.getAttribute('data-confirm'));
        $all('[data-ref]', conf).forEach(function (r) { r.textContent = reference(r.getAttribute('data-ref')); });
        $all('[data-echo]', conf).forEach(function (el) { var src = document.getElementById(el.getAttribute('data-echo')); if (src && src.value) el.textContent = src.value; });
        form.hidden = true;
        conf.hidden = false;
        conf.setAttribute('tabindex', '-1');
        conf.focus();
      });
    });
    $all('[data-reset-form]').forEach(function (b) {
      b.addEventListener('click', function () {
        var form = document.getElementById(b.getAttribute('data-reset-form'));
        form.reset();
        form.hidden = false;
        b.closest('[hidden], .confirm').hidden = true;
      });
    });
  }

  /* --- Prototype 3: viewing (R30, R34) -------------------------------------- */
  function initViewing() {
    var app = $('#viewing-app');
    if (!app) return;
    var c = byId(param('car'));
    fillSummary(c);
    if (!c) $('#v-car-pick').hidden = false;
    var pick = $('#v-car');
    pick.innerHTML = '<option value="">Choose a car</option>' + CARS.map(function (x) { return '<option value="' + x.id + '">' + esc(carName(x)) + ' · ' + money(x.price) + '</option>'; }).join('');
    pick.addEventListener('change', function () { c = byId(pick.value); fillSummary(c); $('#v-car-pick').hidden = false; });
    var st = { step: 1, type: null, day: null, slot: null };
    function go(n, quiet) {
      st.step = n;
      $all('.v-step').forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== n; });
      $all('#v-stepper li').forEach(function (li, i) { li.toggleAttribute('aria-current', false); li.removeAttribute('aria-current'); li.classList.toggle('done', i + 1 < n); if (i + 1 === n) li.setAttribute('aria-current', 'step'); });
      var h = $('.v-step[data-step="' + n + '"] h2');
      if (h && !quiet) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }
    $all('[data-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.type = b.getAttribute('data-type');
        $all('[data-type]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        $('#v-next-1').disabled = false;
      });
    });
    /* Next twelve days; Sunday by arrangement (R04 hours) */
    var days = '';
    var now = new Date();
    for (var i = 1; i <= 12; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      var label = d.toLocaleDateString('en-GB', { weekday: 'short' });
      var date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      days += '<button type="button" class="day" data-day="' + d.toDateString() + '" data-sun="' + (d.getDay() === 0 ? 1 : 0) + '" aria-pressed="false"><span>' + label + '</span><b>' + date + '</b>' + (d.getDay() === 0 ? '<small>By arrangement</small>' : '') + '</button>';
    }
    $('#v-days').innerHTML = days;
    function slots(sun) {
      var list = sun ? ['Ask for a time'] : (st.type === 'video' ? ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'] : ['Morning (08:30 – 12:00)', 'Afternoon (12:00 – 16:00)', 'Late afternoon (16:00 – 19:00)']);
      $('#v-slots').innerHTML = list.map(function (s) { return '<button type="button" class="chip" data-slot="' + s + '" aria-pressed="false">' + s + '</button>'; }).join('');
    }
    $('#v-days').addEventListener('click', function (e) {
      var b = e.target.closest('.day');
      if (!b) return;
      st.day = b.getAttribute('data-day');
      st.slot = null;
      $all('.day').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      slots(b.getAttribute('data-sun') === '1');
      $('#v-slot-wrap').hidden = false;
      $('#v-next-2').disabled = true;
    });
    $('#v-slots').addEventListener('click', function (e) {
      var b = e.target.closest('[data-slot]');
      if (!b) return;
      st.slot = b.getAttribute('data-slot');
      $all('[data-slot]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      $('#v-next-2').disabled = false;
    });
    $('#v-next-1').addEventListener('click', function () {
      $('#v-when-title').textContent = st.type === 'video' ? 'When would you like the video call?' : 'When would you like to visit?';
      go(2);
    });
    $('#v-next-2').addEventListener('click', function () { go(3); });
    $all('[data-back]').forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-back')); }); });
    $('#v-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate($('#v-form'))) return;
      var d = new Date(st.day);
      $('#v-ref').textContent = reference('MPV');
      $('#v-what').textContent = (st.type === 'video' ? 'Video call viewing' : 'Showroom viewing at 91 Crawford Street') + (c ? ' of the ' + carName(c) : '');
      $('#v-when').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + st.slot.toLowerCase();
      $('#v-who').textContent = $('#v-name').value;
      go(4);
    });
    go(1, true);
  }

  /* --- Prototype 3: reserve (R31) ------------------------------------------ */
  function initReserve() {
    var app = $('#reserve-app');
    if (!app) return;
    var c = byId(param('car')) || byId('2020-rolls-royce-cullinan');
    fillSummary(c);
    $all('[data-car-name]').forEach(function (el) { el.textContent = carName(c); });
    var form = $('#r-form');
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      $('#r-ref').textContent = reference('MPR');
      $('#r-name').textContent = $('#r-fullname').value;
      form.hidden = true;
      $('#r-done').hidden = false;
      $('#r-done').setAttribute('tabindex', '-1');
      $('#r-done').focus();
    });
  }

  /* --- Prototype 3: contact (R32, R33) -------------------------------------- */
  function initContact() {
    var app = $('#contact-app');
    if (!app) return;
    var c = byId(param('car'));
    fillSummary(c);
    var wa = 'Hello, I have a question' + (c ? ' about the ' + carName(c) : '') + '.';
    $all('[data-wa-generic]').forEach(function (a) { a.setAttribute('href', 'https://wa.me/' + FACTS.wa + '?text=' + encodeURIComponent(wa)); });
  }

  /* --- Prototype 4: by invitation (R40, R41, R44) --------------------------- */
  function initInvite() {
    var app = $('#invite-app');
    if (!app) return;
    var makes = [];
    CARS.forEach(function (c) { if (makes.indexOf(c.make) === -1) makes.push(c.make); });
    ['Bugatti', 'Lamborghini', 'Aston Martin', 'Bentley', 'McLaren', 'Porsche'].forEach(function (m) { if (makes.indexOf(m) === -1) makes.push(m); });
    makes.sort();
    var chosen = [];
    var bodies = [];
    $('#a-makes').innerHTML = makes.map(function (m) { return '<button type="button" class="chip" data-mk="' + esc(m) + '" aria-pressed="false">' + esc(m) + '</button>'; }).join('');
    function count() {
      var min = +$('#a-min').value || 0;
      var max = +$('#a-max').value || Infinity;
      var list = CARS.filter(function (c) {
        return (!chosen.length || chosen.indexOf(c.make) !== -1) && (!bodies.length || bodies.indexOf(c.body) !== -1) && c.price >= min && c.price <= max;
      });
      $('#a-count').textContent = list.length;
      $('#a-count-text').textContent = list.length === 1 ? 'car in stock today matches' : 'cars in stock today match';
      $('#a-sample').innerHTML = list.slice(0, 3).map(function (c) { return '<li><a href="' + pageHref('car.html') + '?car=' + c.id + '">' + esc(carName(c)) + '</a> · ' + money(c.price) + '</li>'; }).join('');
      var q = [];
      if (chosen.length === 1) q.push('make=' + encodeURIComponent(chosen[0]));
      $('#a-see').setAttribute('href', pageHref('inventory.html') + (q.length ? '?' + q.join('&') : ''));
      $('#a-summary').textContent = (chosen.length ? chosen.join(', ') : 'Any marque') + ' · ' + (bodies.length ? bodies.join(', ') : 'any body style') + ' · ' + ($('#a-min').value ? 'from ' + money(+$('#a-min').value) : 'no minimum') + ' to ' + ($('#a-max').value ? money(+$('#a-max').value) : 'no maximum');
    }
    $('#a-makes').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mk]');
      if (!b) return;
      var m = b.getAttribute('data-mk');
      var i = chosen.indexOf(m);
      if (i === -1) chosen.push(m); else chosen.splice(i, 1);
      b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
      count();
    });
    $('#a-bodies').addEventListener('click', function (e) {
      var b = e.target.closest('[data-bd]');
      if (!b) return;
      var m = b.getAttribute('data-bd');
      var i = bodies.indexOf(m);
      if (i === -1) bodies.push(m); else bodies.splice(i, 1);
      b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
      count();
    });
    bandOptions($('#a-min'), false);
    bandOptions($('#a-max'), true);
    $('#a-min').addEventListener('change', count);
    $('#a-max').addEventListener('change', count);
    count();

    /* Find me a car, prefilled from a sold car, an empty search or a car (R41) */
    var like = param('like');
    var mk = param('make');
    var car = byId(param('car'));
    if (like) {
      var s = SOLD.filter(function (x) { return x.name === like; })[0];
      $('#fm-make').value = s ? s.make : '';
      $('#fm-model').value = s ? like.replace(s.make + ' ', '') : like;
      $('#fm-from').textContent = 'Prefilled from a car we sold: ' + like + '.';
      $('#fm-from').hidden = false;
    } else if (car) {
      $('#fm-make').value = car.make;
      $('#fm-model').value = car.model;
    } else if (mk) $('#fm-make').value = mk;
    if (like || mk || car) {
      var t = $('.tab[data-tab="find"]');
      if (t) activateTab(t);
    }
  }

  /* --- Prototype 4: previously sold (R43) ----------------------------------- */
  function initSold() {
    var app = $('#sold-app');
    if (!app) return;
    var makes = [];
    SOLD.forEach(function (s) { if (makes.indexOf(s.make) === -1) makes.push(s.make); });
    var mk = '';
    var shown = 24;
    $('#s-makes').innerHTML = '<button type="button" class="chip" data-smk="" aria-pressed="true">All <span class="ct">' + SOLD.length + '</span></button>' + makes.map(function (m) {
      return '<button type="button" class="chip" data-smk="' + esc(m) + '" aria-pressed="false">' + esc(m) + ' <span class="ct">' + SOLD.filter(function (s) { return s.make === m; }).length + '</span></button>';
    }).join('');
    function render() {
      var q = $('#s-search').value.trim().toLowerCase();
      var list = SOLD.filter(function (s) { return (!mk || s.make === mk) && (!q || s.name.toLowerCase().indexOf(q) !== -1); });
      if ($('#s-sort').value === 'za') list = list.slice().reverse();
      $('#s-count').textContent = list.length + ' car' + (list.length === 1 ? '' : 's');
      $('#s-grid').innerHTML = list.slice(0, shown).map(function (s, i) {
        return '<article class="sold-card"><div class="wf-placeholder" data-sold="' + esc(s.img) + '">Photo<span class="badge solid">Sold</span></div><div class="sb"><h3>' + esc(s.name) + '</h3><a class="btn btn-secondary btn-sm" href="' + pageHref('by-invitation.html') + '?like=' + encodeURIComponent(s.name) + '#find">Find me one like this</a></div></article>';
      }).join('') || '<div class="empty-state"><h3>Nothing matches</h3><p class="muted">Try another marque, or tell us what you\'re looking for.</p><a class="btn" href="' + pageHref('by-invitation.html') + '#find">Find me a car</a></div>';
      $('#s-more').hidden = list.length <= shown;
      $('#s-more').textContent = 'Show more (' + (list.length - shown) + ' more)';
      if (window.MP_PHOTOS) window.MP_PHOTOS.apply();
    }
    $('#s-makes').addEventListener('click', function (e) {
      var b = e.target.closest('[data-smk]');
      if (!b) return;
      mk = b.getAttribute('data-smk');
      $all('[data-smk]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      shown = 24;
      render();
    });
    $('#s-search').addEventListener('input', function () { shown = 24; render(); });
    $('#s-sort').addEventListener('change', render);
    $('#s-more').addEventListener('click', function () { shown += 24; render(); });
    render();
  }

  /* --- Prototype 5: services (R50–R54) -------------------------------------- */
  function initServices() {
    var app = $('#services-app');
    if (!app) return;
    var links = $all('.inpage a');
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    function onScroll() {
      var y = window.scrollY + 160;
      var cur = 0;
      sections.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
      links.forEach(function (a, i) { a.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    /* Storage cost from the published price: £950 a month, 12 weeks minimum (R53) */
    var r = $('#st-months');
    function cost() {
      var m = +r.value;
      $('#st-months-val').textContent = m + ' month' + (m === 1 ? '' : 's');
      $('#st-total').textContent = money(m * 950);
      $('#st-note').textContent = m < 3 ? 'The minimum storage period is 12 weeks, so this would be charged as 3 months.' : '£950 a month, billed [monthly in advance – to confirm].';
      $('#st-total').textContent = money(Math.max(3, m) * 950);
    }
    r.addEventListener('input', cost);
    cost();
  }

  /* --- Prototype 5: finance (R55) ------------------------------------------- */
  function initFinance() {
    var app = $('#finance-app');
    if (!app) return;
    var sel = $('#fc-car');
    sel.innerHTML = CARS.map(function (c) { return '<option value="' + c.id + '">' + esc(carName(c)) + ' · ' + money(c.price) + '</option>'; }).join('');
    var c = byId(param('car')) || byId('2021-rolls-royce-ghost');
    sel.value = c.id;
    var product = 'hp';
    function calc() {
      var car = byId(sel.value);
      var dep = +$('#fc-dep').value;
      var term = +$('#fc-term').value;
      var balloon = product === 'lp' ? +$('#fc-balloon').value : 0;
      var r = monthly(car.price, dep, term, balloon);
      $('#fc-dep-val').textContent = dep + '% · ' + money(r.deposit);
      $('#fc-term-val').textContent = term + ' months';
      $('#fc-balloon-val').textContent = balloon + '% · ' + money(r.balloon);
      $('#fc-monthly').textContent = money(r.monthly);
      $('#fc-kv').innerHTML = '<dt>Cash price</dt><dd>' + money(car.price) + '</dd><dt>Deposit</dt><dd>' + money(r.deposit) + '</dd><dt>Amount of credit</dt><dd>' + money(car.price - r.deposit) + '</dd>' +
        (product === 'lp' ? '<dt>Final payment</dt><dd>' + money(r.balloon) + '</dd>' : '') +
        '<dt>' + term + ' monthly payments</dt><dd>' + money(r.monthly) + '</dd><dt>Illustrative APR</dt><dd>' + APR + '%</dd><dt>Total amount payable</dt><dd>' + money(r.total) + '</dd>';
      $('#fc-car-link').setAttribute('href', pageHref('car.html') + '?car=' + car.id);
      $('#fc-enquire').setAttribute('href', pageHref('contact.html') + '?car=' + car.id + '#route-finance');
    }
    $all('#fc-product button').forEach(function (b) {
      b.addEventListener('click', function () {
        product = b.getAttribute('data-p');
        $all('#fc-product button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        $('#fc-balloon-field').hidden = product !== 'lp';
        calc();
      });
    });
    ['#fc-dep', '#fc-term', '#fc-balloon'].forEach(function (s) { $(s).addEventListener('input', calc); });
    sel.addEventListener('change', calc);
    calc();
  }

  /* --- Landing page: counts from the data ------------------------------------ */
  function initCounts() {
    $all('[data-count]').forEach(function (el) {
      var k = el.getAttribute('data-count');
      if (k === 'cars') el.textContent = CARS.length;
      if (k === 'sold') el.textContent = SOLD.length;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFacts();
    initNotes();
    initProtoNav();
    initHeaderHeight();
    initAccordions();
    initTabs();
    initModals();
    initShortlist();
    initForms();
    initCounts();
    initHome();
    initInventory();
    initCar();
    initViewing();
    initReserve();
    initContact();
    initInvite();
    initSold();
    initServices();
    initFinance();
  });

  /* Exposed for photos.js (phase 3) and the module library */
  window.MP = { byId: byId, carName: carName, money: money };
})();
