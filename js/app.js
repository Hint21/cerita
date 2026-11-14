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
  var photoList = [];

  fetch("assets/images/manifest.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      manifest = data || [];
      photoList = manifest.filter(function (m) { return m.kind === "photo"; });
      renderSmall();
      renderYou();
      renderAwalFinal();
      renderLetter();
      initReveals();
    })
    .catch(function () {
      renderLetter();
      initReveals();
    });

  /* ── DOM helpers ─────────────────────────────────────── */
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    return e;
  }

  function padZero(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  /* ── Render: hal-hal kecil (screenshots → .small-item) ─ */
  function renderSmall() {
    var list = document.getElementById("smallList");
    if (!list) return;
    list.innerHTML = "";
    var shots = manifest.filter(function (m) { return m.kind === "shot"; });
    shots.forEach(function (m) {
      var wrap = el("div", { "class": "small-item" });
      var img  = el("img", {
        src: "assets/images/" + m.file,
        alt: "foto",
        loading: "lazy",
        decoding: "async"
      });
      wrap.appendChild(img);
      list.appendChild(wrap);
    });
  }

  /* ── Render: tentang kamu (editorial storytelling photo layout) ── */
  function renderYou() {
    var gal = document.getElementById("youGallery");
    if (!gal) return;
    gal.innerHTML = "";

    var photos = photoList;
    if (!photos.length) return;

    // Editorial layout pattern rhythm:
    // Hero -> Pair-L -> Trio -> Single -> Pair-R -> Cinema ->
    // Pair-L -> Trio -> Hero-Tall -> Pair-R -> Single -> Trio -> Cinema ->
    // Pair-L -> Trio -> Pair-R -> Hero
    var pattern = [
      { type: "hero",      count: 1, cls: "editorial-hero" },
      { type: "pair-l",    count: 2, cls: "editorial-pair editorial-pair--left" },
      { type: "trio",      count: 3, cls: "editorial-trio" },
      { type: "single",    count: 1, cls: "editorial-single" },
      { type: "pair-r",    count: 2, cls: "editorial-pair editorial-pair--right" },
      { type: "cinema",    count: 1, cls: "editorial-cinema" },
      { type: "pair-l",    count: 2, cls: "editorial-pair editorial-pair--left" },
      { type: "trio",      count: 3, cls: "editorial-trio" },
      { type: "hero-tall", count: 1, cls: "editorial-hero editorial-hero--tall" },
      { type: "pair-r",    count: 2, cls: "editorial-pair editorial-pair--right" },
      { type: "single",    count: 1, cls: "editorial-single" },
      { type: "trio",      count: 3, cls: "editorial-trio" },
      { type: "cinema",    count: 1, cls: "editorial-cinema" },
      { type: "pair-l",    count: 2, cls: "editorial-pair editorial-pair--left" },
      { type: "trio",      count: 3, cls: "editorial-trio" },
      { type: "pair-r",    count: 2, cls: "editorial-pair editorial-pair--right" },
      { type: "hero",      count: 1, cls: "editorial-hero" }
    ];

    var pIdx = 0;
    var bIdx = 0;
    while (pIdx < photos.length) {
      var pat = pattern[bIdx % pattern.length];
      var count = Math.min(pat.count, photos.length - pIdx);
      var block = el("div", { "class": pat.cls });

      for (var i = 0; i < count; i++) {
        (function (globalIdx) {
          var m = photos[globalIdx];
          var wrap = el("div", { "class": "you-item" });
          var img = el("img", {
            src: "assets/images/" + m.file,
            alt: "foto",
            loading: "lazy",
            decoding: "async"
          });
          wrap.appendChild(img);
          wrap.setAttribute("role", "button");
          wrap.setAttribute("tabindex", "0");
          wrap.setAttribute("aria-label", "lihat foto " + (globalIdx + 1));

          wrap.addEventListener("click", function () {
            openViewer(globalIdx);
          });
          wrap.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openViewer(globalIdx);
            }
          });

          block.appendChild(wrap);
        })(pIdx + i);
      }

      gal.appendChild(block);
      pIdx += count;
      bIdx++;
    }
  }

  /* ── Render: surat utama (23 paragraf asli) ──────────── */
  function renderLetter() {
    var letterEl = document.getElementById("letterText");
    if (!letterEl || letterEl.children.length > 0) return;

    var paragraphs = [
      "yaudah kalau emang kamu dah mutusin gitu, aku terima. ini emang salah aku yang masih belum bisa jauhin hal hal yang nggak kamu suka, wajar banget kamu marah, wajar kamu nggak suka, aku yang salah sayang. aku juga nggak mau banyak alasan lagi karena aku tau dari sisi kamu itu pasti sakit, apalagi kalau hal yang sama udah pernah kamu bilang tapi aku masih ngelakuin lagi.",
      "maaf yaa udah bikin kamu sakit hati ama semua kelakuan aku, maaf yaa belum bisa jadi cowok yang kamu impiin, maaf juga karena selama ini kamu harus banyak maklumin aku. kamu dah baik banget kok, aku aja yang ngelunjak.",
      "mungkin aku juga selama ini terlalu mikirin kalau aku udah jujur ama kamu, tapi aku lupa kalau jujur setelah ngelakuin sesuatu juga nggak bikin kamu jadi nggak sakit hati.",
      "jujur berat banget buat aku nge iyain kemauan kamu ini, aku masih sayang banget ama kamu, masih pengen sama kamu juga. tapi ini bukan pertama kali kamu minta udahan, jadi daripada kamu makan hati mulu ama kelakuan aku, kayaknya emang lebih baik sampai sini aja.",
      "aku nggak mau juga kalau setiap ada masalah kamu harus sampai ngerasa capek dan sakit hati terus. mungkin emang aku belum bisa jadi orang yang kamu butuhin.",
      "aku juga minta maaf kalau selama sama aku kamu pernah ngerasa sendirian, ngerasa nggak didengerin, atau ngerasa harus ngejelasin hal yang sama berkali kali.",
      "aku sadar masih banyak kurangnya aku dan mungkin selama ini aku nggak sadar kalau beberapa hal yang aku anggap sepele ternyata bisa bikin kamu sakit hati.",
      "makasih yaa atas semua hal yang udah kamu kasih ke aku.",
      "makasih karena udah nemenin aku selama 4 bulan pdkt dan 3 bulan pacaran ini.",
      "aku nggak nyangka yang awalnya cuman temen roblox, yang awalnya kamu manggil ayah sampai akhirnya manggil sayang. lucu yaa kalau diingat ingat.",
      "siapa sih yang bakal nyangka orang yang awalnya aku kenal nggak sengaja di roblox, yang aku kira paling cuman ketemu di satu kali main doang ternyata bisa jadi orang yang benar benar aku sayang.",
      "banyak banget hal kecil dari kita yang bakal aku inget nanti, dari ngobrol, main bareng, telfonan, cerita cerita, sampai hal hal random yang mungkin kelihatannya biasa aja tapi buat aku tetap berarti.",
      "aku nggak mau rasa kangen aku malah jadi alasan buat maksa kamu tetap bertahan.",
      "kalau nanti aku udah bukan jadi orang yang kamu sayang lagi, kamu tetap hubungin aku yaa kalau perlu bantuan, bakal aku usahain bantu kok.",
      "kamu tetap semangat yaa ngejar impian kamu, aku doain kamu bisa masuk ke univ yang kamu impikan, bisa masuk ke jurusan yang kamu suka.",
      "kamu udah mau lulus sayang, yang semangat yaa belajarnya. nanti kuliahnya juga yang semangat, jangan malas malasan mulu, ngeluh boleh, capek boleh, istirahat juga boleh, asal jangan nyerah dan tugasnya tetap dikerjain.",
      "aku juga doain kamu bisa dapetin semua yang kamu mau.",
      "mudah mudahan nanti kamu nemuin cowok yang benar benar bisa ngejauhin hal hal yang nggak kamu suka, yang bisa lebih ngerti kamu dan bisa bikin kamu lebih bahagia.",
      "maaf yaa sayang atas semua yang udah aku lakuin, maaf udah bikin kamu sakit hati, maaf udah bikin kamu capek dan harus berusaha memaklumi aku selama ini.",
      "aku benar benar sayang kamu kok.",
      "makasih yaa udah pernah nemenin aku, udah pernah milih aku, dan udah pernah jadi bagian dari hidup aku.",
      "jaga diri baik baik yaa sayang, semoga kamu baik baik aja dan semoga semua yang kamu impiin bisa tercapai.",
      "makasih buat semuanya 🤍"
    ];

    paragraphs.forEach(function (text) {
      var p = document.createElement("p");
      p.textContent = text;
      letterEl.appendChild(p);
    });
  }

  /* ── Render: awal (roblox photo) ──────────────────────── */
  function renderAwalFinal() {
    var awal   = document.getElementById("img-awal");
    var roblox = manifest.find(function (m) { return m.kind === "roblox"; });
    var shots  = manifest.filter(function (m) { return m.kind === "shot"; });

    var awalItem = roblox || (shots.length ? shots[0] : null);
    if (awal && awalItem && !awal.children.length) {
      var imgA = el("img", {
        src: "assets/images/" + awalItem.file,
        alt: "pertemuan pertama di roblox",
        loading: "lazy",
        decoding: "async"
      });
      awal.appendChild(imgA);
      if (io) io.observe(imgA);
    }
  }

  /* ── Photo viewer (Lightbox) ─────────────────────────── */
  var viewer        = document.getElementById("viewer");
  var viewerImg     = document.getElementById("viewerImg");
  var viewerCounter = document.getElementById("viewerCounter");
  var viewerClose   = document.getElementById("viewerClose");
  var viewerPrev    = document.getElementById("viewerPrev");
  var viewerNext    = document.getElementById("viewerNext");
  var viewerStage   = document.getElementById("viewerStage");
  var currentViewerIdx = 0;

  function showViewerPhoto(idx) {
    if (!photoList || !photoList.length || !viewerImg) return;
    currentViewerIdx = (idx + photoList.length) % photoList.length;
    var item = photoList[currentViewerIdx];
    var src = "assets/images/" + item.file;

    // Smooth image transition
    viewerImg.style.opacity = "0.2";
    viewerImg.style.transform = "scale(0.97)";

    var loader = new Image();
    loader.onload = function () {
      viewerImg.src = src;
      viewerImg.style.opacity = "1";
      viewerImg.style.transform = "scale(1)";
    };
    loader.src = src;

    if (viewerCounter) {
      viewerCounter.textContent = padZero(currentViewerIdx + 1) + " / " + padZero(photoList.length);
    }
  }

  function openViewer(idx) {
    if (!viewer || !viewerImg) return;
    var targetIdx = typeof idx === "number" ? idx : 0;
    viewer.hidden = false;
    showViewerPhoto(targetIdx);
    if (viewerClose) viewerClose.focus();
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    if (!viewer) return;
    viewer.hidden = true;
    if (viewerImg) viewerImg.src = "";
    document.body.style.overflow = "";
  }

  function prevPhoto() {
    showViewerPhoto(currentViewerIdx - 1);
  }

  function nextPhoto() {
    showViewerPhoto(currentViewerIdx + 1);
  }

  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  if (viewerPrev) {
    viewerPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      prevPhoto();
    });
  }
  if (viewerNext) {
    viewerNext.addEventListener("click", function (e) {
      e.stopPropagation();
      nextPhoto();
    });
  }

  if (viewer) {
    viewer.addEventListener("click", function (e) {
      // close when clicking backdrop or stage area outside image
      if (e.target === viewer || e.target === viewerStage) {
        closeViewer();
      }
    });

    // Touch swipe navigation for mobile
    var touchStartX = 0;
    var touchStartY = 0;
    viewer.addEventListener("touchstart", function (e) {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    viewer.addEventListener("touchend", function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) nextPhoto();
        else prevPhoto();
      }
    }, { passive: true });
  }

  document.addEventListener("keydown", function (e) {
    if (!viewer || viewer.hidden) return;
    if (e.key === "Escape") {
      closeViewer();
    } else if (e.key === "ArrowLeft") {
      prevPhoto();
    } else if (e.key === "ArrowRight") {
      nextPhoto();
    }
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

  /* ── Fade to black when fadeout section enters view (calm, unhurried) ── */
  function initFadeBlack() {
    var fadeBlack = document.getElementById("fadeBlack");
    var fadeout   = document.getElementById("fadeout");
    if (!fadeout || !fadeBlack || !("IntersectionObserver" in window)) return;

    var fadeTimer = null;

    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // If already scheduled, don't re-trigger
          if (fadeTimer) return;
          // Wait 16s so reader can comfortably read all lines and sit in quiet reflection
          fadeTimer = setTimeout(function () {
            fadeBlack.classList.add("is-active");
          }, 16000);
        } else {
          // If user scrolls back up, cancel timer and restore visibility
          if (fadeTimer) {
            clearTimeout(fadeTimer);
            fadeTimer = null;
          }
          fadeBlack.classList.remove("is-active");
        }
      });
    }, { threshold: 0.4 });
    fio.observe(fadeout);

    // If user touches/clicks or interacts with the ending section to keep reading,
    // clear the black overlay and give them ample time
    fadeout.addEventListener("pointerdown", function () {
      if (fadeBlack.classList.contains("is-active")) {
        fadeBlack.classList.remove("is-active");
      }
      if (fadeTimer) {
        clearTimeout(fadeTimer);
        fadeTimer = setTimeout(function () {
          fadeBlack.classList.add("is-active");
        }, 18000);
      }
    });
  }

  /* ── Auto-pause video when scrolled out of view ──────── */
  var penutupVideo = document.getElementById("penutupVideo");
  if (penutupVideo && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting && !penutupVideo.paused) {
          penutupVideo.pause();
        }
      });
    }, { threshold: 0.1 });
    vio.observe(penutupVideo);
  }

  /* ── Optional background music (graceful if file missing) ─ */
  var bgMusic    = document.getElementById("bgMusic");
  var musicCtrl  = document.getElementById("musicCtrl");
  var musicOn    = false;
  var musicMuted = false;
  var musicFadeTimer = null;

  function fadeMusicTo(target, ms) {
    if (!bgMusic) return;
    if (musicFadeTimer) clearInterval(musicFadeTimer);
    var start = bgMusic.volume;
    var steps = Math.max(1, Math.round(ms / 50));
    var i = 0;
    musicFadeTimer = setInterval(function () {
      i++;
      var t = i / steps;
      bgMusic.volume = Math.max(0, Math.min(1, start + (target - start) * t));
      if (i >= steps) {
        clearInterval(musicFadeTimer);
        musicFadeTimer = null;
        bgMusic.volume = target;
      }
    }, 50);
  }

  function setMusicMuted(muted) {
    musicMuted = muted;
    if (!bgMusic) return;
    if (muted) {
      bgMusic.pause();
      if (musicCtrl) { musicCtrl.classList.add("is-muted"); musicCtrl.setAttribute("aria-pressed", "false"); }
    } else if (musicOn) {
      bgMusic.play().catch(function () {});
      if (musicCtrl) { musicCtrl.classList.remove("is-muted"); musicCtrl.setAttribute("aria-pressed", "true"); }
    }
  }

  if (bgMusic && musicCtrl) {
    bgMusic.volume = 0;
    bgMusic.addEventListener("canplaythrough", function () {
      musicCtrl.hidden = false;
    }, { once: true });
    bgMusic.addEventListener("error", function () {
      musicCtrl.hidden = true;
    }, { once: true });
    try { bgMusic.load(); } catch (e) {}

    musicCtrl.addEventListener("click", function () {
      if (musicMuted) setMusicMuted(false);
      else setMusicMuted(true);
    });

    function startMusic() {
      if (!musicOn) {
        musicOn = true;
        bgMusic.play().then(function () {
          fadeMusicTo(0.32, 2000);
          musicCtrl.hidden = false;
          musicCtrl.setAttribute("aria-pressed", "true");
        }).catch(function () {
          musicOn = false;
        });
      }
    }
    window.__startMusic = startMusic;

    var fadeout = document.getElementById("fadeout");
    if (fadeout && "IntersectionObserver" in window) {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) fadeMusicTo(0, 2500);
        });
      }, { threshold: 0.3 });
      mio.observe(fadeout);
    }

    if (penutupVideo) {
      penutupVideo.addEventListener("play", function () {
        if (musicOn && !musicMuted) fadeMusicTo(0.06, 600);
      });
      penutupVideo.addEventListener("pause", function () {
        if (musicOn && !musicMuted) fadeMusicTo(0.32, 900);
      });
      penutupVideo.addEventListener("ended", function () {
        if (musicOn && !musicMuted) fadeMusicTo(0.32, 900);
      });
    }
  }

  if (btnEnter) {
    btnEnter.addEventListener("click", function () {
      if (typeof window.__startMusic === "function") window.__startMusic();
    });
  }

})();
