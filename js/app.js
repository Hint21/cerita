(function () {
  "use strict";

  var PASSWORD = "29072026";
  var gate = document.getElementById("gate");
  var gateForm = document.getElementById("gateForm");
  var gateInput = document.getElementById("gateInput");
  var gateErr = document.getElementById("gateErr");
  var site = document.getElementById("site");

  function readSession(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function writeSession(key, val) {
    try { sessionStorage.setItem(key, val); } catch (e) {}
  }

  function unlock() {
    if (gate) gate.style.display = "none";
    if (site) site.hidden = false;
    writeSession("entered", "1");
    initReveals();
  }

  if (readSession("entered") === "1") {
    unlock();
  }

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

  // Lenis
  var lenis = null;
  if (typeof Lenis === "function") {
    try {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.3 });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }

  function scrollToEl(el) {
    if (!el) return;
    if (lenis) { try { lenis.scrollTo(el, { duration: 1.2 }); return; } catch (e) {} }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  var btnEnter = document.getElementById("btnEnter");
  if (btnEnter) {
    btnEnter.addEventListener("click", function () {
      scrollToEl(document.getElementById("awal"));
    });
  }

  // Manifest
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

  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    return e;
  }

  function renderSmall() {
    var list = document.getElementById("smallList");
    if (!list) return;
    manifest.filter(function (m) { return m.kind === "shot"; }).forEach(function (m) {
      var img = el("img", { src: "assets/images/" + m.file, alt: "", loading: "lazy" });
      list.appendChild(img);
    });
  }

  function renderYou() {
    var gal = document.getElementById("youGallery");
    if (!gal) return;
    manifest.filter(function (m) { return m.kind === "photo"; }).forEach(function (m) {
      var img = el("img", { src: "assets/images/" + m.file, alt: "", loading: "lazy" });
      img.addEventListener("click", function () { openViewer(img.src); });
      gal.appendChild(img);
    });
  }

  function renderAwalFinal() {
    var awal = document.getElementById("img-awal");
    var final = document.getElementById("img-final");
    var shots = manifest.filter(function (m) { return m.kind === "shot"; });
    var photos = manifest.filter(function (m) { return m.kind === "photo"; });
    if (awal && shots.length) {
      awal.appendChild(el("img", { src: "assets/images/" + shots[0].file, alt: "", loading: "lazy" }));
    }
    if (final && photos.length) {
      var pick = photos.find(function (m) { return m.file === "img07.webp"; }) || photos[0];
      final.appendChild(el("img", { src: "assets/images/" + pick.file, alt: "", loading: "lazy" }));
    }
  }

  // Viewer
  var viewer = document.getElementById("viewer");
  var viewerImg = document.getElementById("viewerImg");
  var viewerClose = document.getElementById("viewerClose");
  function openViewer(src) {
    if (!viewer || !viewerImg) return;
    viewerImg.src = src;
    viewer.hidden = false;
  }
  function closeViewer() {
    if (viewer) viewer.hidden = true;
    if (viewerImg) viewerImg.src = "";
  }
  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  if (viewer) viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (viewer && !viewer.hidden) closeViewer();
    }
  });

  // Reveal system
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }
  function revealAll(selector) {
    var nodes = document.querySelectorAll(selector);
    nodes.forEach(function (n) {
      if (io) io.observe(n);
      else n.classList.add("is-visible");
    });
  }

  function initReveals() {
    // opening ready
    var opening = document.getElementById("opening");
    if (opening) setTimeout(function () { opening.classList.add("is-ready"); }, 200);

    // timeline items
    revealAll(".timeline__item");
    // me lines
    revealAll(".me-line");
    // letter paragraphs
    revealAll(".letter p");
    // thanks
    revealAll(".thanks-lines p");
    // fade lines
    revealAll(".fade-line");
    revealAll(".fade-final");
    // small images
    revealAll(".small-list img");
    // you gallery
    revealAll(".you-gallery img");
    // generic reveal
    revealAll(".reveal");
  }

  // Opening scene ready on load even without unlock? site hidden until unlock; initReveals called in unlock.

  // Letter text
  var letterEl = document.getElementById("letterText");
  if (letterEl) {
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
      "mudah mudahan nanti kamu nemuin cowok yang benar benar bisa ngejauhin hal hal yang nggak kamu suka, yang bisa lebih ngerti kamu dan bisa bikin kamu lebih bahagia.",
      "maaf yaa sayang atas semua yang udah aku lakuin, maaf udah bikin kamu sakit hati, maaf udah bikin kamu capek dan harus berusaha memaklumi aku selama ini.",
      "aku benar benar sayang kamu kok.",
      "makasih yaa udah pernah nemenin aku, udah pernah milih aku, dan udah pernah jadi bagian dari hidup aku.",
      "jaga diri baik baik yaa sayang, semoga kamu baik baik aja dan semoga semua yang kamu impiin bisa tercapai.",
      "makasih buat semuanya 🤍"
    ];
    paragraphs.forEach(function (t) {
      var p = document.createElement("p");
      p.textContent = t;
      letterEl.appendChild(p);
    });
  }

  // Fade to black on fadeout section
  var fadeBlack = document.getElementById("fadeBlack");
  var fadeout = document.getElementById("fadeout");
  if (fadeout && fadeBlack && "IntersectionObserver" in window) {
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) fadeBlack.classList.add("is-active");
        else fadeBlack.classList.remove("is-active");
      });
    }, { threshold: 0.3 });
    fio.observe(fadeout);
  }
})();