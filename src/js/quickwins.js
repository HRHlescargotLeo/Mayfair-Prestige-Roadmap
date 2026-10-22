/* ==========================================================================
   quickwins.js — behaviour for the Quick wins tab (R08, QW1–QW29)

   Each quick-win page carries one or more [data-qw="name"] blocks; the
   matching function below runs once the shared wireframe.js has loaded.
   Uses the same car data as the five big improvements (data.js).
   ========================================================================== */

(function () {
  'use strict';

  var CARS = window.MP_CARS || [];
  var SOLD = window.MP_SOLD || [];
  var MP = window.MP || {};
  var FACTS = MP.FACTS || {};
  var money = MP.money, num = MP.num, carName = MP.carName, stockNo = MP.stockNo, esc = MP.esc;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function byId(id) { for (var i = 0; i < CARS.length; i++) if (CARS[i].id === id) return CARS[i]; return null; }
  function photos() { if (window.MP_PHOTOS) window.MP_PHOTOS.apply(); }
  function param(name) { var m = new RegExp('[?&]' + name + '=([^&]+)').exec(window.location.search); return m ? decodeURIComponent(m[1]) : null; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function carPage(c) { return 'car.html?car=' + c.id; }
  function title(c) { return carName(c) + (c.der ? ' ' + c.der.split(' ').slice(0, 2).join(' ') : ''); }
  function ph(c, n, label) {
    if (!c.photos) return '<div class="wf-placeholder no-photo">Photography in progress</div>';
    return '<div class="wf-placeholder" data-photo="' + c.id + '" data-photo-n="' + (n || 0) + '">' + esc(label || 'Photo') + '</div>';
  }
  function mini(c) {
    return '<a class="qw-mini" href="' + carPage(c) + '">' + ph(c, 0) + '<span><b>' + esc(carName(c)) + '</b><span class="small muted">' + money(c.price) + ' · ' + num(c.miles) + ' miles</span></span></a>';
  }
  function grid(list, n) { return list.slice(0, n || list.length).map(function (c) { return MP.carCard(c); }).join(''); }

  /* Car picker shared by many demos: <select data-qw-car data-default="id"> */
  function carPicker(root, onChange) {
    var sel = $('[data-qw-car]', root);
    var start = byId(param('car')) || byId(sel && sel.getAttribute('data-default')) || CARS[0];
    if (sel) {
      sel.innerHTML = CARS.map(function (c) { return '<option value="' + c.id + '"' + (c === start ? ' selected' : '') + '>' + esc(carName(c)) + ' · ' + money(c.price) + '</option>'; }).join('');
      sel.addEventListener('change', function () { onChange(byId(sel.value)); photos(); });
    }
    onChange(start);
    photos();
  }

  /* Chips: [data-qw-chips] buttons with aria-pressed */
  function press(group, btn) { $all('button', group).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); }); }

  var DEMOS = {};

  /* QW1 Cars on the homepage */
  DEMOS.latest = function (el) {
    var list = CARS.slice().sort(function (a, b) { return a.arrived - b.arrived; });
    $('[data-latest]', el).innerHTML = grid(list, 8);
  };

  /* QW2 Sort */
  DEMOS.sort = function (el) {
    var sel = $('#qw-sort', el), out = $('[data-sorted]', el), today = $('[data-today-order]', el);
    var desc = CARS.slice().sort(function (a, b) { return b.price - a.price; });
    if (today) today.innerHTML = desc.slice(0, 6).map(function (c, i) { return '<li><span>' + (i + 1) + '. ' + esc(carName(c)) + '</span><b>' + money(c.price) + '</b></li>'; }).join('');
    var by = {
      'price-desc': function (a, b) { return b.price - a.price; },
      'price-asc': function (a, b) { return a.price - b.price; },
      'newest': function (a, b) { return a.arrived - b.arrived; },
      'miles': function (a, b) { return a.miles - b.miles; },
      'year': function (a, b) { return b.year - a.year; }
    };
    function render() {
      try { window.sessionStorage.setItem('mp-qw-sort', sel.value); } catch (e) { /* private mode */ }
      out.innerHTML = grid(CARS.slice().sort(by[sel.value]), 8);
      photos();
    }
    try { var s = window.sessionStorage.getItem('mp-qw-sort'); if (s && by[s]) sel.value = s; } catch (e) { /* private mode */ }
    sel.addEventListener('change', render);
    render();
  };

  /* QW3 Budget bands */
  var BANDS = [
    { label: 'Under £50,000', min: 0, max: 50000 },
    { label: '£50,000 to £100,000', min: 50000, max: 100000 },
    { label: '£100,000 to £200,000', min: 100000, max: 200000 },
    { label: '£200,000 to £300,000', min: 200000, max: 300000 },
    { label: '£300,000 and over', min: 300000, max: Infinity }
  ];
  DEMOS.budget = function (el) {
    var under = CARS.filter(function (c) { return c.price < 50000; }).sort(function (a, b) { return a.price - b.price; });
    $('[data-under]', el).innerHTML = under.map(function (c) { return '<li><span>' + esc(carName(c)) + '</span><b>' + money(c.price) + '</b></li>'; }).join('');
    $all('[data-under-count]', el).forEach(function (n) { n.textContent = under.length; });
    var chips = $('[data-bands]', el), out = $('[data-band-cars]', el), count = $('[data-band-count]', el);
    chips.innerHTML = BANDS.map(function (b, i) {
      var n = CARS.filter(function (c) { return c.price >= b.min && c.price < b.max; }).length;
      return '<button type="button" class="chip" data-i="' + i + '" aria-pressed="false">' + b.label + ' <span class="ct">' + n + '</span></button>';
    }).join('');
    function show(i) {
      var b = BANDS[i];
      var list = CARS.filter(function (c) { return c.price >= b.min && c.price < b.max; }).sort(function (a, c) { return a.price - c.price; });
      count.textContent = b.label + ': ' + list.length + ' car' + (list.length === 1 ? '' : 's');
      out.innerHTML = list.map(mini).join('');
      photos();
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      press(chips, b); show(+b.getAttribute('data-i'));
    });
    press(chips, $('button', chips)); show(0);
  };

  /* QW4 Fewer, more useful filters */
  DEMOS.filters = function (el) {
    var mileSel = $('[data-mile-today]', el);
    if (mileSel) {
      var o = '<option>Max Mileage</option>';
      for (var m = 1000; m <= 83000; m += 1000) o += '<option>' + num(m) + '</option>';
      mileSel.innerHTML = o;
    }
    var GROUPS = [
      { key: 'miles', label: 'Mileage', opts: [['Under 1,000', function (c) { return c.miles < 1000; }], ['Under 5,000', function (c) { return c.miles < 5000; }], ['Under 10,000', function (c) { return c.miles < 10000; }], ['Under 25,000', function (c) { return c.miles < 25000; }], ['Under 50,000', function (c) { return c.miles < 50000; }]] },
      { key: 'era', label: 'Era', opts: [['Classic, before 1990', function (c) { return c.year < 1990; }], ['Modern classic, 1990 to 2009', function (c) { return c.year >= 1990 && c.year < 2010; }], ['Current, 2010 on', function (c) { return c.year >= 2010; }]] },
      { key: 'body', label: 'Body', opts: ['Coupe', 'Convertible', 'Saloon', 'SUV'].map(function (b) { return [b, function (c) { return c.body === b; }]; }) },
      { key: 'gear', label: 'Gearbox', opts: [['Automatic', function (c) { return c.gearbox === 'Automatic'; }], ['Manual', function (c) { return c.gearbox === 'Manual'; }]] }
    ];
    var state = {};
    var box = $('[data-filter-groups]', el), out = $('[data-filter-cars]', el), count = $('[data-filter-count]', el);
    function pass(c, skip) {
      return GROUPS.every(function (g) {
        if (g.key === skip || state[g.key] == null) return true;
        return g.opts[state[g.key]][1](c);
      });
    }
    function render() {
      box.innerHTML = GROUPS.map(function (g) {
        var chips = g.opts.map(function (o, i) {
          var n = CARS.filter(function (c) { return pass(c, g.key) && o[1](c); }).length;
          if (!n) return '';
          return '<button type="button" class="chip" data-g="' + g.key + '" data-i="' + i + '" aria-pressed="' + (state[g.key] === i) + '">' + o[0] + ' <span class="ct">' + n + '</span></button>';
        }).join('');
        return '<fieldset class="qw-group"><legend>' + g.label + '</legend><div class="chip-set">' + chips + '</div></fieldset>';
      }).join('');
      var list = CARS.filter(function (c) { return pass(c); });
      count.textContent = list.length + ' car' + (list.length === 1 ? '' : 's');
      out.innerHTML = list.slice(0, 6).map(mini).join('') + (list.length > 6 ? '<p class="small muted">and ' + (list.length - 6) + ' more</p>' : '');
      photos();
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var g = b.getAttribute('data-g'), i = +b.getAttribute('data-i');
      state[g] = state[g] === i ? null : i;
      render();
      var again = $('button[data-g="' + g + '"][data-i="' + i + '"]', box); if (again) again.focus();
    });
    $('[data-filter-clear]', el).addEventListener('click', function () { state = {}; render(); });
    render();
  };

  /* QW5 Cars sooner on phones */
  DEMOS.phone = function (el) {
    var list = CARS.slice().sort(function (a, b) { return b.price - a.price; });
    $all('[data-phone-cars]', el).forEach(function (box) { box.innerHTML = list.slice(0, 3).map(function (c) { return MP.carCard(c); }).join(''); });
    var btn = $('[data-sheet-open]', el), sheet = $('[data-sheet]', el);
    btn.addEventListener('click', function () { sheet.hidden = false; $('button', sheet).focus(); });
    $all('[data-sheet-close]', el).forEach(function (b) { b.addEventListener('click', function () { sheet.hidden = true; btn.focus(); }); });
  };

  /* Card as it looks on the live site today */
  function todayCard(c, opts) {
    opts = opts || {};
    var t = carName(c);
    var media = c.photos ? ph(c, 0) : '<div class="wf-placeholder qw-coming">Image coming soon</div>';
    return '<article class="car-card qw-today-card"><div class="car-media">' + media + '<span class="price-tag">' + money(c.price) + '</span></div>' +
      '<div class="car-body"><h3 class="qw-trunc">' + esc(t) + (opts.long ? ' ' + esc(c.der) : '') + '</h3>' +
      '<p class="car-der">' + esc(opts.noDer ? '' : c.der) + '</p>' +
      '<dl class="car-specs qw-specs5"><div><dt>Miles</dt><dd>' + num(c.miles) + '</dd></div><div><dt>Gearbox</dt><dd>' + esc(c.gearbox) + '</dd></div><div><dt>Year</dt><dd>' + c.year + '</dd></div><div><dt>Fuel</dt><dd>' + esc(opts.fuel || c.fuel) + '</dd></div><div><dt>Speed</dt><dd>' + (c.speed ? c.speed + ' mph' : '-') + '</dd></div></dl></div></article>';
  }

  /* QW6 Colour and photo count on cards */
  DEMOS.colour = function (el) {
    carPicker(el, function (c) {
      $('[data-today-card]', el).innerHTML = todayCard(c);
      $('[data-new-card]', el).innerHTML = MP.carCard(c);
    });
  };

  /* QW7 Clean card details */
  DEMOS.cleancards = function (el) {
    var picks = [['2016-rolls-royce-phantom', {}], ['2024-mercedes-benz-g-class', { fuel: 'Petrol..' }], ['2013-rolls-royce-phantom-2', { noDer: true }], ['2022-mercedes-benz-maybach-gls', { long: true }]];
    $('[data-today-cards]', el).innerHTML = picks.map(function (p) { return todayCard(byId(p[0]), p[1]); }).join('');
    $('[data-new-cards]', el).innerHTML = picks.map(function (p) { return MP.carCard(byId(p[0])); }).join('');
  };

  /* QW8 Each car its own title and address */
  function seoTitle(c) { return carName(c) + ' ' + c.der.split(' ').slice(1, 2).join(' ') + ', ' + num(c.miles) + ' miles | Mayfair Prestige'; }
  function seoUrl(c) { return 'www.mayfairprestigeuk.co.uk › vehicles › ' + slug(carName(c)) + '-' + stockNo(c).toLowerCase(); }
  function seoDesc(c) { return carName(c) + ' ' + c.der + ' in ' + c.colour + ', ' + num(c.miles) + ' miles, ' + money(c.price) + '. Viewing by appointment at Mayfair Prestige, Crawford Street, Marylebone.'; }
  DEMOS.seo = function (el) {
    carPicker(el, function (c) {
      $('[data-serp-new]', el).innerHTML = '<div class="u">' + esc(seoUrl(c)) + '</div><div class="t">' + esc(seoTitle(c)) + '</div><p>' + esc(seoDesc(c).slice(0, 158)) + (seoDesc(c).length > 158 ? '…' : '') + '</p>';
      $('[data-link-new]', el).innerHTML = ph(c, 0) + '<div><b>' + esc(seoTitle(c).replace(' | Mayfair Prestige', '')) + '</b><span>mayfairprestigeuk.co.uk</span></div>';
    });
  };

  /* QW9 Car structured data */
  DEMOS.schema = function (el) {
    carPicker(el, function (c) {
      var data = {
        '@context': 'https://schema.org', '@type': 'Car', name: carName(c), vehicleModelDate: String(c.year), brand: { '@type': 'Brand', name: c.make }, model: c.model,
        vehicleConfiguration: c.der, color: c.colour, fuelType: c.fuel, vehicleTransmission: c.gearbox, bodyType: c.body,
        mileageFromOdometer: { '@type': 'QuantitativeValue', value: c.miles, unitCode: 'SMI' },
        offers: { '@type': 'Offer', price: c.price, priceCurrency: 'GBP', availability: 'https://schema.org/' + (c.status === 'Reserved' || c.status === 'Under offer' ? 'LimitedAvailability' : 'InStock'),
          seller: { '@type': 'AutoDealer', name: 'Mayfair Prestige', address: FACTS.address, telephone: FACTS.phone } }
      };
      $('[data-jsonld]', el).textContent = JSON.stringify(data, null, 2);
      $('[data-rich]', el).innerHTML = '<div class="u">' + esc(seoUrl(c)) + '</div><div class="t">' + esc(seoTitle(c)) + '</div><p class="qw-rich-row"><span>' + money(c.price) + '</span><span>' + (data.offers.availability.indexOf('InStock') > -1 ? 'In stock' : 'Limited availability') + '</span><span>' + num(c.miles) + ' miles</span><span>' + esc(c.fuel) + '</span></p>';
    });
  };

  /* QW10 Key facts beside the photos */
  DEMOS.keyfacts = function (el) {
    carPicker(el, function (c) {
      $all('[data-kf="name"]', el).forEach(function (n) { n.textContent = carName(c); });
      $all('[data-kf="der"]', el).forEach(function (n) { n.textContent = c.der; });
      $all('[data-kf="price"]', el).forEach(function (n) { n.textContent = money(c.price); });
      $all('[data-kf="photo"]', el).forEach(function (n) { n.innerHTML = ph(c, 0, 'Photo 1 of ' + (c.photos || 0)); });
      $('[data-kf="facts"]', el).innerHTML = [['Mileage', num(c.miles) + ' miles'], ['Year', c.year], ['Colour', c.colour], ['Interior', c.interior], ['Gearbox', c.gearbox], ['Owners', c.owners], ['Stock number', stockNo(c)]].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
      $all('[data-kf="miles"]', el).forEach(function (n) { n.textContent = num(c.miles) + ' miles'; });
      $all('[data-kf="view"]', el).forEach(function (a) { a.setAttribute('href', 'viewing.html?car=' + c.id); });
      $all('[data-kf="reserve"]', el).forEach(function (a) { a.setAttribute('href', 'reserve.html?car=' + c.id); });
      $all('[data-kf="wa"]', el).forEach(function (a) { a.setAttribute('href', 'https://wa.me/' + FACTS.wa + '?text=' + encodeURIComponent("Hello, I'm interested in the " + carName(c) + ' (' + stockNo(c) + ')')); });
    });
  };

  /* QW11 A better gallery */
  function group(path) {
    var f = String(path).split('/').pop();
    if (/interior|seat|steering|dash|door-card|roof-lining|rear-seat|boot|console|clock|gear/.test(f)) return 'Interior';
    if (/wheel|badge|engine|detail|key|book|light|exhaust|brake|caliper|logo|tyre/.test(f)) return 'Details';
    return 'Exterior';
  }
  DEMOS.gallery = function (el) {
    var cur = 0, c = null, members = {}, order = [];
    var main = $('[data-g-main]', el), count = $('[data-g-count]', el), groups = $('[data-g-groups]', el), thumbs = $('[data-g-thumbs]', el), full = $('[data-g-full]', el);
    var todayMain = $('[data-g-today]', el);
    function show(i) {
      if (!c || !c.img || !c.img.length) return;
      cur = (i + c.img.length) % c.img.length;
      main.setAttribute('data-photo', c.id); main.setAttribute('data-photo-n', cur); main.textContent = 'Photo ' + (cur + 1);
      full.setAttribute('data-photo', c.id); full.setAttribute('data-photo-n', cur); full.textContent = 'Photo ' + (cur + 1);
      count.textContent = (cur + 1) + ' of ' + c.img.length;
      $all('.thumb', thumbs).forEach(function (t) { t.setAttribute('aria-current', +t.getAttribute('data-n') === cur ? 'true' : 'false'); });
      var g = group(c.img[cur]);
      $all('button', groups).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-g') === g ? 'true' : 'false'); });
      photos();
    }
    function drawThumbs(g) {
      thumbs.innerHTML = (members[g] || []).map(function (n) { return '<button type="button" class="thumb wf-placeholder" data-photo="' + c.id + '" data-photo-n="' + n + '" data-n="' + n + '" aria-label="Photo ' + (n + 1) + '">' + (n + 1) + '</button>'; }).join('');
    }
    carPicker(el, function (car) {
      c = car; members = {}; order = ['Exterior', 'Interior', 'Details'];
      (c.img || []).forEach(function (p, i) { var g = group(p); (members[g] = members[g] || []).push(i); });
      groups.innerHTML = order.filter(function (g) { return members[g]; }).map(function (g) { return '<button type="button" class="chip" data-g="' + g + '" aria-pressed="false">' + g + ' <span class="ct">' + members[g].length + '</span></button>'; }).join('');
      todayMain.setAttribute('data-photo', c.id); todayMain.setAttribute('data-photo-n', 0);
      if (!c.img || !c.img.length) { main.textContent = 'Photography in progress'; count.textContent = '0 photos'; thumbs.innerHTML = ''; return; }
      drawThumbs('Exterior'); show(0);
    });
    groups.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var g = b.getAttribute('data-g'); drawThumbs(g); show(members[g][0]); });
    thumbs.addEventListener('click', function (e) { var b = e.target.closest('.thumb'); if (b) show(+b.getAttribute('data-n')); });
    $all('[data-g-step]', el).forEach(function (b) { b.addEventListener('click', function () { show(cur + (+b.getAttribute('data-g-step'))); }); });
    document.addEventListener('keydown', function (e) {
      if (!$('#qw-full.open')) return;
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
    var x0 = null;
    [main, full].forEach(function (s) {
      s.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      s.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
    });
  };

  /* QW12 Share a car */
  DEMOS.share = function (el) {
    carPicker(el, function (c) {
      var link = 'https://www.mayfairprestigeuk.co.uk/vehicles/' + slug(carName(c)) + '-' + stockNo(c).toLowerCase();
      var name = carName(c);
      $('[data-share-wa]', el).setAttribute('href', 'https://wa.me/?text=' + encodeURIComponent(name + ' at Mayfair Prestige: ' + link));
      $('[data-share-email]', el).setAttribute('href', 'mailto:?subject=' + encodeURIComponent(name + ' at Mayfair Prestige') + '&body=' + encodeURIComponent(link));
      $('[data-share-link]', el).value = link;
      $('[data-chat-new]', el).innerHTML = '<div class="qw-linkcard">' + ph(c, 0) + '<div><b>' + esc(name + ', ' + num(c.miles) + ' miles') + '</b><span>' + money(c.price) + ' · Mayfair Prestige</span></div></div><p>' + esc(link) + '</p>';
      $('[data-chat-today]', el).innerHTML = '<p>https://www.mayfairprestigeuk.co.uk/vehicles/' + esc(slug(carName(c))) + '-6b142a64…</p>';
    });
    $('[data-share-copy]', el).addEventListener('click', function () {
      var input = $('[data-share-link]', el);
      function fallback() { input.select(); MP.toast('Link selected. Press Ctrl+C or Cmd+C to copy.'); }
      try { navigator.clipboard.writeText(input.value).then(function () { MP.toast('Link copied'); }, fallback); } catch (e) { fallback(); }
    });
  };

  /* QW13 More like this */
  DEMOS.similar = function (el) {
    carPicker(el, function (c) {
      var others = CARS.filter(function (o) { return o !== c; });
      var same = others.filter(function (o) { return o.make === c.make; });
      $('[data-sim-today]', el).innerHTML = same.slice(0, 2).map(mini).join('') || '<p class="muted small">No other ' + esc(c.make) + ' in stock, so nothing is shown.</p>';
      var band = others.filter(function (o) { return o.make !== c.make && Math.abs(o.price - c.price) <= Math.max(60000, c.price * 0.25); })
        .sort(function (a, b) { return (a.body === c.body ? 0 : 1) - (b.body === c.body ? 0 : 1) || Math.abs(a.price - c.price) - Math.abs(b.price - c.price); });
      var pick = same.slice(0, 2).concat(band).slice(0, 4);
      $('[data-sim-new]', el).innerHTML = pick.map(function (o) {
        var why = o.make === c.make ? 'Same marque' : (o.body === c.body ? 'Similar price, also a ' + o.body.toLowerCase() : 'Similar price');
        return '<div class="qw-sim">' + mini(o) + '<span class="badge">' + why + '</span></div>';
      }).join('');
      $('[data-sim-all]', el).textContent = 'See all ' + (same.length + 1) + ' ' + c.make + (same.length ? 's' : '') + ' in stock';
    });
  };

  /* QW16 WhatsApp that knows the car */
  DEMOS.whatsapp = function (el) {
    carPicker(el, function (c) {
      var text = "Hello, I'm interested in the " + carName(c) + ' (' + stockNo(c) + ', ' + money(c.price) + '). Is it still available?';
      $('[data-wa-msg]', el).textContent = text;
      $all('[data-wa-new]', el).forEach(function (a) { a.setAttribute('href', 'https://wa.me/' + FACTS.wa + '?text=' + encodeURIComponent(text)); });
    });
  };

  /* QW17 Lighter forms: car summary */
  DEMOS.lightform = function (el) {
    carPicker(el, function (c) {
      $('[data-lf-car]', el).innerHTML = ph(c, 0) + '<div><b>' + esc(carName(c)) + '</b><p class="small muted">' + money(c.price) + ' · ' + num(c.miles) + ' miles · Stock ' + stockNo(c) + '</p></div>';
      $('[data-lf-today]', el).textContent = c.make;
      $('[data-lf-today-model]', el).textContent = c.model;
    });
  };

  /* QW22 Storage cost */
  DEMOS.storage = function (el) {
    var range = $('#st-months', el), out = $('[data-st-total]', el), lab = $('[data-st-months]', el);
    function calc() {
      var m = +range.value;
      lab.textContent = m + ' month' + (m === 1 ? '' : 's');
      out.textContent = money(950 * m);
    }
    range.addEventListener('input', calc); calc();
  };

  /* QW23 Delivery on every car */
  DEMOS.delivery = function (el) {
    carPicker(el, function (c) {
      $all('[data-dl="name"]', el).forEach(function (n) { n.textContent = carName(c); });
      $all('[data-dl="price"]', el).forEach(function (n) { n.textContent = money(c.price); });
      var f = $('#dl-car', el); if (f) f.value = carName(c) + ' (' + stockNo(c) + ')';
    });
  };

  /* QW24 One set of facts: edit once, see it everywhere */
  DEMOS.facts = function (el) {
    $all('[data-fact-in]', el).forEach(function (inp) {
      function sync() { $all('[data-fact-out="' + inp.getAttribute('data-fact-in') + '"]', el).forEach(function (o) { o.textContent = inp.value || '[not set]'; }); }
      inp.addEventListener('input', sync); sync();
    });
  };

  /* QW25 Homepage copy: highlight what changes */
  DEMOS.copy = function (el) {
    var t = $('[data-copy-mark]', el);
    t.addEventListener('change', function () { el.classList.toggle('qw-show-marks', t.checked); });
  };

  /* QW26 Homepage title and description: live character counts */
  DEMOS.meta = function (el) {
    var ti = $('#mt-title', el), de = $('#mt-desc', el);
    function sync() {
      $('[data-mt-t]', el).textContent = ti.value;
      $('[data-mt-d]', el).textContent = de.value.length > 158 ? de.value.slice(0, 157) + '…' : de.value;
      $('[data-mt-tc]', el).textContent = ti.value.length + ' characters' + (ti.value.length > 60 ? ', may be cut short' : '');
      $('[data-mt-dc]', el).textContent = de.value.length + ' characters' + (de.value.length > 158 ? ', may be cut short' : '');
    }
    ti.addEventListener('input', sync); de.addEventListener('input', sync); sync();
  };

  /* QW27 Fix the sitemaps */
  DEMOS.sitemap = function (el) {
    var rows = [['/', 'Homepage'], ['/vehicles/', 'Inventory'], ['/previously-sold/', 'Previously sold']];
    SOLD.slice(0, 5).forEach(function (s) { rows.push(['/previously-sold/' + slug(s.name) + '/', 'Sold: ' + s.name]); });
    var body = $('[data-sm-rows]', el), seg = $('[data-sm-seg]', el), note = $('[data-sm-note]', el);
    function render(mode) {
      body.innerHTML = rows.map(function (r) {
        var sold = /\/previously-sold\/./.test(r[0]);
        var st = mode === 'today' ? (sold ? '<span class="qw-bad">404 Not found</span>' : '<span class="qw-ok">200 OK</span>') : (sold ? '<span class="qw-ok">301 → /previously-sold/</span>' : '<span class="qw-ok">200 OK</span>');
        return '<tr><td><code>' + esc(r[0]) + '</code></td><td>' + esc(r[1]) + '</td><td>' + st + '</td></tr>';
      }).join('');
      note.textContent = mode === 'today'
        ? '/sitemap.xml returns the sitemap for www.mfpservices.co.uk. /xmlsitemap lists 137 addresses, and the 84 Previously Sold ones return "page not found".'
        : '/sitemap.xml lists Mayfair Prestige\'s own pages, every address on it returns a page, and it is submitted in Google Search Console.';
    }
    seg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; press(seg, b); render(b.getAttribute('data-mode')); });
    render('today');
  };

  document.addEventListener('DOMContentLoaded', function () {
    $all('[data-qw]').forEach(function (el) {
      var fn = DEMOS[el.getAttribute('data-qw')];
      if (fn) fn(el);
    });
    photos();
  });
})();
