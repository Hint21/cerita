(function () {
  "use strict";

  var PASSWORD = "29072026";
  var gate     = document.getElementById("gate");
  var gateForm = document.getElementById("gateForm");
  var gateInput= document.getElementById("gateInput");
  var gateErr  = document.getElementById("gateErr");
  var site     = document.getElementById("site");

  /* ── sessionStorage helpers ─────────────────────────── */
  function readSession(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function writeSession(key, val) {
    try { sessionStorage.setItem(key, val); } catch (e) {} // eslint-disable-line no-empty
  }

  /* ── unlock ─────────────────────────────────────────── */
  function unlock() {
    if (gate) {
      gate.style.transition = "opacity .8s";
      gate.style.opacity    = "0";
      setTimeout(function () { gate.style.display = "none"; }, 820);
    }
    if (site) site.hidden = false;
    writeSession("entered", "1");
    // give fonts/images a tick to settle
    requestAnimationFrame(function () {
      requestAnimationFrame(initReveals);
    });
  }

  if (readSession("entered") === "1") { unlock(); }

  if (gateForm) {
    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (gateInput.value.trim() === PASSWORD) {
        unlock();
      } else {
        gateErr.textContent = "salah. coba lagi.";
        gateInput.value = "";
        gateInput.focus();
      }
    });
  }

  /* ── Lenis smooth scroll ─────────────────────────────── */
  var lenis = null;
  if (typeof Lenis === "function") {
    try {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.4 });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    } catch (e) { lenis = null; }
  }

  function scrollToEl(el) {
    if (!el) return;
    if (lenis) {
      try { lenis.scrollTo(el, { duration: 1.3, offset: -20 }); return; } catch (e) {}
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  var btnEnter = document.getElementById("btnEnter");
  if (btnEnter) {
    btnEnter.addEventListener("click", function () {
      scrollToEl(document.getElementById("awal"));
    });
    btnEnter.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollToEl(document.getElementById("awal"));
      }
    });
  }

  /* ── Asset manifest ──────────────────────────────────── */
  var manifest = [];
  fetch("assets/images/manifest.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      manifest = data || [];
      renderSmall();
      renderYou();
      renderAwalFinal();
      initReveals();
    })
    .catch(function () { initReveals(); });

  /* ── DOM helpers ─────────────────────────────────────── */
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    return e;
  }

  /* ── Render: hal-hal kecil (screenshots → .small-item) ─ */
  function renderSmall() {
    var list = document.getElementById("smallList");
    if (!list) return;
    var shots = manifest.filter(function (m) { return m.kind === "shot"; });
    shots.forEach(function (m) {
      var wrap = el("div", { "class": "small-item" });
      var img  = el("img", {
        src: "assets/images/" + m.file,
        alt: "",
        loading: "lazy"
      });
      wrap.appendChild(img);
      list.appendChild(wrap);
    });
  }

  /* ── Render: tentang kamu (photos → .you-item) ────────── */
  function renderYou() {
    var gal = document.getElementById("youGallery");
    if (!gal) return;
    var photos = manifest.filter(function (m) { return m.kind === "photo"; });
    photos.forEach(function (m) {
      var wrap = el("div", { "class": "you-item" });
      var img  = el("img", {
        src: "assets/images/" + m.file,
        alt: "",
        loading: "lazy"
      });
      wrap.addEventListener("click", function () { openViewer("assets/images/" + m.file); });
      wrap.setAttribute("role", "button");
      wrap.setAttribute("tabindex", "0");
      wrap.setAttribute("aria-label", "lihat foto");
      wrap.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openViewer("assets/images/" + m.file);
        }
      });
      wrap.appendChild(img);
      gal.appendChild(wrap);
    });
  }

  /* ── Render: awal (first shot) + final (img07) ───────── */
  function renderAwalFinal() {
    var awal   = document.getElementById("img-awal");
    var final  = document.getElementById("img-final");
    var shots  = manifest.filter(function (m) { return m.kind === "shot"; });
    var photos = manifest.filter(function (m) { return m.kind === "photo"; });

    if (awal && shots.length) {
      var imgA = el("img", {
        src: "assets/images/" + shots[0].file,
        alt: "",
        loading: "lazy"
      });
      awal.appendChild(imgA);
      // observe for scale-in
      if (io) io.observe(imgA);
    }

    if (final && photos.length) {
      var pick = photos.find(function (m) { return m.file === "img07.webp"; }) || photos[0];
      var imgF = el("img", {
        src: "assets/images/" + pick.file,
        alt: "",
        loading: "lazy"
      });
      final.appendChild(imgF);
      if (io) io.observe(imgF);
    }
  }

  /* ── Photo viewer ────────────────────────────────────── */
  var viewer      = document.getElementById("viewer");
  var viewerImg   = document.getElementById("viewerImg");
  var viewerClose = document.getElementById("viewerClose");

  function openViewer(src) {
    if (!viewer || !viewerImg) return;
    viewerImg.src = src;
    viewer.hidden = false;
    viewerClose.focus();
    document.body.style.overflow = "hidden";
  }
  function closeViewer() {
    if (!viewer) return;
    viewer.hidden = true;
    if (viewerImg) viewerImg.src = "";
    document.body.style.overflow = "";
  }

  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  if (viewer) {
    viewer.addEventListener("click", function (e) {
      if (e.target === viewer) closeViewer();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && viewer && !viewer.hidden) closeViewer();
  });

  /* ── Intersection Observer (reveal system) ───────────── */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: "0px 0px -30px 0px" });
  }

  function revealAll(selector) {
    document.querySelectorAll(selector).forEach(function (n) {
      if (io) io.observe(n);
      else n.classList.add("is-visible");
    });
  }

  /* ── initReveals ─────────────────────────────────────── */
  function initReveals() {
    // opening cinematic entrance
    var opening = document.getElementById("opening");
    if (opening) setTimeout(function () { opening.classList.add("is-ready"); }, 180);

    revealAll(".timeline__item");
    revealAll(".me-line");
    revealAll(".letter p");
    revealAll(".thanks-lines p");
    revealAll(".fade-line");
    revealAll(".fade-final");
    revealAll(".small-item");
    revealAll(".you-item");
    revealAll(".img-single--final img");
    revealAll(".reveal");

    initParallax();
    initFadeBlack();
  }

  /* ── Subtle parallax on hero + big-date ─────────────── */
  function initParallax() {
    // skip on mobile (< 700px) or reduced motion
    var mq = window.matchMedia("(max-width: 700px), (prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    var targets = document.querySelectorAll("[data-parallax]");
    if (!targets.length) return;

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var sy = window.scrollY;
        targets.forEach(function (el) {
          var speed  = parseFloat(el.getAttribute("data-parallax")) || 0.08;
          var rect   = el.parentElement.getBoundingClientRect();
          var center = rect.top + rect.height / 2;
          var offset = (window.innerHeight / 2 - center) * speed;
          // clamp to ±30px
          offset = Math.max(-30, Math.min(30, offset));
          el.style.transform = "translateY(" + offset + "px)";
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Fade to black when fadeout section enters view ──── */
  function initFadeBlack() {
    var fadeBlack = document.getElementById("fadeBlack");
    var fadeout   = document.getElementById("fadeout");
    if (!fadeout || !fadeBlack || !("IntersectionObserver" in window)) return;

    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) fadeBlack.classList.add("is-active");
        else fadeBlack.classList.remove("is-active");
      });
    }, { threshold: 0.28 });
    fio.observe(fadeout);
  }

})();
