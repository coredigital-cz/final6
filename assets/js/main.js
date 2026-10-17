/* Răzvan Instal — main.js */
(function () {
  "use strict";

  // ===== SETĂRI =====
  // Pune aici cheia Web3Forms (de pe web3forms.com). Cât timp e "PUNE_AICI_CHEIA",
  // formularul trimite mesajul pe WhatsApp în loc de email.
  var CONFIG = {
    web3formsKey: "PUNE_AICI_CHEIA",
    whatsapp: "40725376962",
    phoneDisplay: "0725 376 962"
  };

  var root = document.documentElement.getAttribute("data-root") || "";

  // ---------- Tracking (Google Ads / GA4, dacă e instalat) ----------
  function track(name, params) {
    params = params || {};
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params);
      window.dataLayer = window.dataLayer || [];
      var ev = { event: name };
      for (var k in params) ev[k] = params[k];
      window.dataLayer.push(ev);
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href*="wa.me/"]');
    if (!a) return;
    var isTel = a.getAttribute("href").indexOf("tel:") === 0;
    track(isTel ? "click_telefon" : "click_whatsapp", { locatie: a.getAttribute("data-track") || "" });
  });

  // ---------- Meniu ----------
  var body = document.body;
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Închide meniul" : "Deschide meniul");
    body.classList.toggle("nav-open", open);
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (nav) {
    nav.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && body.classList.contains("nav-open")) setMenu(false);
    });
  }
  function closeSubs(except) {
    document.querySelectorAll(".has-sub.open").forEach(function (li) {
      if (li === except) return;
      li.classList.remove("open");
      var b = li.querySelector(".sub-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  document.querySelectorAll(".sub-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = btn.closest(".has-sub");
      var open = btn.getAttribute("aria-expanded") === "true";
      closeSubs(li);
      btn.setAttribute("aria-expanded", String(!open));
      li.classList.toggle("open", !open);
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-sub")) closeSubs();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeSubs(); setMenu(false); }
  });
  var mq = window.matchMedia("(min-width: 981px)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { setMenu(false); });

  // ---------- Formulare ----------
  var keyMissing = !CONFIG.web3formsKey || CONFIG.web3formsKey.indexOf("PUNE_") === 0;
  var thanksUrl = new URL(root + "multumim.html", window.location.href).href;

  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    form.elements.access_key.value = keyMissing ? "" : CONFIG.web3formsKey;
    form.elements.redirect.value = thanksUrl;
    var note = form.querySelector(".form-note");
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (form.elements.botcheck && form.elements.botcheck.checked) return;
      var data = new FormData(form);

      if (keyMissing) {
        var msg = "Bună ziua, Răzvan! Vă contactez de pe site.\n" +
          "Nume: " + (data.get("nume") || "") + "\n" +
          "Telefon: " + (data.get("telefon") || "") + "\n" +
          "Localitate: " + (data.get("localitate") || "-") + "\n" +
          "Lucrare: " + (data.get("serviciu") || "-") +
          (data.get("mesaj") ? "\n" + data.get("mesaj") : "");
        track("trimitere_formular", { metoda: "whatsapp" });
        window.location.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
        return;
      }

      data.delete("redirect");
      if (btn) { btn.disabled = true; btn.textContent = "Se trimite…"; }
      if (note) { note.textContent = ""; note.classList.remove("is-error"); }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json || !json.success) throw new Error((json && json.message) || "error");
          track("trimitere_formular", { metoda: "email" });
          window.location.href = thanksUrl;
        })
        .catch(function () {
          if (note) {
            note.textContent = "Mesajul nu s-a trimis. Sunați direct la " + CONFIG.phoneDisplay + " sau scrieți pe WhatsApp.";
            note.classList.add("is-error");
          }
          if (btn) { btn.disabled = false; btn.innerHTML = btnText; }
        });
    });
  });

  // ---------- Video: pornește singur (fără sunet) când e pe ecran ----------
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var autoVids = document.querySelectorAll("video[data-autoplay]");
  if (!reduce && "IntersectionObserver" in window && autoVids.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.4 });
    autoVids.forEach(function (v) { io.observe(v); });
  }

  // ---------- Galerie: filtre ----------
  var filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var cat = b.getAttribute("data-filter");
      filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      document.querySelectorAll(".g-item").forEach(function (it) {
        it.hidden = !(cat === "toate" || it.getAttribute("data-cat") === cat);
      });
    });
  });

  // ---------- Lightbox ----------
  var box = document.querySelector(".lightbox");
  if (box && typeof box.showModal === "function") {
    var bImg = box.querySelector("img");
    var bCap = box.querySelector("p");
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-lightbox]");
      if (!a) return;
      e.preventDefault();
      bImg.src = a.getAttribute("href");
      bImg.alt = a.getAttribute("data-caption") || "";
      bCap.textContent = a.getAttribute("data-caption") || "";
      box.showModal();
    });
    box.querySelector(".lightbox-close").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  }

  // ---------- An curent în footer ----------
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
