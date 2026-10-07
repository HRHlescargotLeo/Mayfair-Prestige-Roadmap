/* ==========================================================================
   photos.js — Mayfair Prestige photography for the design layer (phase 3)

   Swaps the illustrated placeholders for Mayfair Prestige's own photography,
   loaded directly from mayfairprestigeuk.co.uk. Each image is applied only
   once it has loaded, so wherever the images can't be reached (for example
   inside a host that blocks external images) the illustration stays.
   Photography © Mayfair Prestige, used here to show how the proposals would
   look on the live site. Floorplans, maps, portraits and logos stay drawn.
   ========================================================================== */

(function () {
  'use strict';

  var BASE = 'https://www.mayfairprestigeuk.co.uk/media/';
  function src(path, w, h) {
    var file = /\.(png|jpe?g|webp)$/i.test(path) ? path : path + '.jpg';
    return BASE + file + '?width=' + w + (h ? '&height=' + h + '&mode=crop' : '') + '&quality=80&format=webp';
  }
  function car(id) {
    var list = window.MP_CARS || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* Lead photo for each collection tile, from cars in stock */
  var COLLECTION = {
    'rolls-royce': 'bicpaw1t/001-front-right',
    'ferrari': 'dqihknwh/001-front-right',
    'g-class': 'dqvh4zaq/001-front-right',
    'classics': 'mlnhl5cj/001-front-left',
    'electric': 'ifjhvu5s/001-front-right',
    'suv': 'vupcnrya/007-front-right'
  };

  /* Static placeholders matched on their label text */
  var LABEL = {
    'showroom photograph 1600 × 540': src('wlmcuoz5/mayfair-prestige-showroom-hero', 1600, 540),
    'the showroom online': src('wlmcuoz5/mayfair-prestige-showroom-hero', 800),
    'the car page': src('dqihknwh/001-front-right', 800),
    'viewing and reserving': src('kfxk35ow/hero-image-3', 800),
    'by invitation': src('ss2i1dxv/ferrari-f40', 800),
    'private services': src('s5vnr4p3/storage-page-mayfair-prestige', 800),
    'photo · storage facility': src('s5vnr4p3/storage-page-mayfair-prestige', 1200),
    'rolls-royce photo': src(COLLECTION['rolls-royce'], 600),
    'classics photo': src(COLLECTION.classics, 600)
  };

  /* Apply a photo once it has loaded; leave the illustration if it fails. */
  function apply(el, url, overlay) {
    if (!el || !url || el.getAttribute('data-photo-src') === url) return;
    el.setAttribute('data-photo-src', url);
    var img = new Image();
    img.onload = function () {
      if (el.getAttribute('data-photo-src') !== url) return;
      el.style.backgroundImage = (overlay ? overlay + ', ' : '') + 'url("' + url + '")';
      el.classList.add('has-photo');
      if (el.tagName !== 'BUTTON' && (!el.hasAttribute('role') || el.getAttribute('role') === 'img')) {
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', (el.textContent || 'Photo').trim());
      }
    };
    img.src = url;
  }

  function width(el) {
    var w = el.getBoundingClientRect().width || 400;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    return w * dpr > 900 ? 1600 : (w * dpr > 450 ? 800 : 400);
  }

  function applyAll() {
    /* Cars: cards, galleries, thumbnails, summaries and the featured car */
    document.querySelectorAll('[data-photo]').forEach(function (el) {
      var c = car(el.getAttribute('data-photo'));
      if (!c || !c.img || !c.img.length) return;
      var n = +el.getAttribute('data-photo-n') || 0;
      apply(el, src(c.img[n % c.img.length], width(el)));
    });
    /* Previously sold */
    document.querySelectorAll('[data-sold]').forEach(function (el) {
      apply(el, src(el.getAttribute('data-sold'), width(el)));
    });
    /* Collections */
    document.querySelectorAll('[data-collection]').forEach(function (el) {
      var p = COLLECTION[el.getAttribute('data-collection')];
      if (p) apply(el, src(p, 600));
    });
    /* Video walkaround on the car page: the car behind a play mark */
    var lead = document.getElementById('g-main');
    document.querySelectorAll('#car-app .ratio-16-9').forEach(function (el) {
      var c = lead && car(lead.getAttribute('data-photo'));
      if (c && c.img && c.img.length) apply(el, src(c.img[Math.min(2, c.img.length - 1)], 1200), 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45))');
      el.classList.add('is-video');
    });
    /* Everything else matched on its label */
    document.querySelectorAll('.wf-placeholder').forEach(function (el) {
      var url = LABEL[(el.getAttribute('aria-label') || el.textContent || '').trim().toLowerCase()];
      if (url) apply(el, url);
    });
  }

  window.MP_PHOTOS = { apply: applyAll };

  document.addEventListener('DOMContentLoaded', function () {
    applyAll();
    /* Cards are re-rendered as filters change, so watch for new ones. */
    if ('MutationObserver' in window) {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () { pending = false; applyAll(); });
      }).observe(document.body, { childList: true, subtree: true });
    }
  });
})();
