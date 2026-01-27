/* ============================================================
  main.js — PRONK GLOBAL (DELEGATION FIX)
  ✅ FIX REAL: el botón SIEMPRE responde (event delegation)
  ✅ Menú overlay encima de todo (solo clases)
  ✅ Cierra con overlay / ESC / click fuera
  ✅ Cierra al click en links del menú móvil
  ✅ Header glass + reveal + video fallback + transiciones
============================================================ */

(() => {
  "use strict";

  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  const getEls = () => {
    const navToggle = $("#navToggle") || $(".nav-toggle");
    const mobileNav = $("#mobileNav") || $(".mobile-nav");
    const mobileClose = $("#mobileNavClose") || $(".mobile-nav__close");
    const mobileOverlay =
      (mobileNav && $(".mobile-nav__overlay", mobileNav)) ||
      $(".mobile-nav__overlay") ||
      $('[data-close="mobile"]');
    const mobilePanel = mobileNav ? $(".mobile-nav__panel", mobileNav) : null;

    return { navToggle, mobileNav, mobileClose, mobileOverlay, mobilePanel };
  };

  const setMenuOpen = (isOpen) => {
    const { navToggle, mobileNav } = getEls();
    if (!navToggle || !mobileNav) return;

    mobileNav.classList.toggle("is-open", isOpen);
    mobileNav.style.display = isOpen ? "block" : "";

    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));

    // tu CSS usa esto (y además dejamos fallback)
    document.body.classList.toggle("menu-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  const toggleMenu = () => {
    const { mobileNav } = getEls();
    if (!mobileNav) return;
    setMenuOpen(!mobileNav.classList.contains("is-open"));
  };

  const closeMenu = () => setMenuOpen(false);

  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    /* =========================
      1) FADE IN al cargar
    ========================= */
    window.addEventListener("load", () => {
      body.classList.add("page-loaded");
      body.classList.remove("is-transitioning");
    });

    /* =========================
      2) HEADER GLASS
    ========================= */
    const isHome = body.classList.contains("home");
    const isInner = body.classList.contains("inner");
    const SCROLL_THRESHOLD = 60;

    if (isInner) body.classList.add("scrolled");

    const onScroll = () => {
      if (!isHome) return;
      if (window.scrollY > SCROLL_THRESHOLD) body.classList.add("scrolled");
      else body.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* =========================
      3) MENÚ MÓVIL (DELEGATION FIX)
      - No depende de “encontrar” el botón al inicio
      - Funciona aunque cambies IDs/clases o tengas otro HTML
    ========================= */

    // CLICK (captura) para que nada “mate” el evento
    document.addEventListener(
      "click",
      (e) => {
        const { mobileNav, mobileOverlay, mobileClose, mobilePanel } = getEls();

        // Si en esta página no existe menú, no hacemos nada
        const toggleBtn = e.target.closest("#navToggle, .nav-toggle");
        if (toggleBtn) {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
          return;
        }

        // Cerrar por botón X
        const closeBtn = e.target.closest("#mobileNavClose, .mobile-nav__close");
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          return;
        }

        // Cerrar por overlay
        if (mobileOverlay && e.target === mobileOverlay) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          return;
        }

        // Cerrar al click en links del menú móvil
        const mobileLink = e.target.closest(".mobile-nav__link");
        if (mobileLink && mobileNav && mobileNav.classList.contains("is-open")) {
          closeMenu();
          return;
        }

        // Cerrar al click fuera del panel (fallback)
        if (mobileNav && mobileNav.classList.contains("is-open")) {
          const clickedInsidePanel = mobilePanel ? mobilePanel.contains(e.target) : false;
          if (!clickedInsidePanel) closeMenu();
        }
      },
      true // CAPTURE
    );

    // TOUCHSTART (captura)
    document.addEventListener(
      "touchstart",
      (e) => {
        const toggleBtn = e.target.closest("#navToggle, .nav-toggle");
        if (toggleBtn) {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        }

        const closeBtn = e.target.closest("#mobileNavClose, .mobile-nav__close");
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        }

        const { mobileOverlay } = getEls();
        if (mobileOverlay && e.target === mobileOverlay) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        }
      },
      { passive: false, capture: true }
    );

    // ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    /* =========================
      4) REVEAL MANCHAS
    ========================= */
    const revealEls = $$("[data-reveal]");
    if (revealEls.length) {
      if (!("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      } else {
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -20% 0px" }
        );
        revealEls.forEach((el) => obs.observe(el));
      }
    }

    /* =========================
      5) VIDEO AUTOPLAY FALLBACK
    ========================= */
    const tryPlayHomeVideo = () => {
      const video = $(".home-video__video");
      if (!video) return;

      const isPlaying = !video.paused && !video.ended && video.readyState > 2;
      if (isPlaying) return;

      video.muted = true;
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    window.addEventListener("load", tryPlayHomeVideo);
    ["click", "touchstart", "scroll"].forEach((evt) => {
      window.addEventListener(evt, tryPlayHomeVideo, { passive: true, once: true });
    });

    /* =========================
      6) TRANSICIÓN SUAVE ENTRE HTML
    ========================= */
    const shouldSkipTransition = (link) => {
      const href = link.getAttribute("href");
      if (!href) return true;

      if (link.hasAttribute("data-no-transition")) return true;
      if (link.target && link.target !== "" && link.target !== "_self") return true;

      if (href.startsWith("#")) return true;
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("whatsapp:")) return true;
      if (href.startsWith("javascript:")) return true;

      if (/^https?:\/\//i.test(href)) return true;

      if (link.hasAttribute("download")) return true;

      return false;
    };

    $$("a[href]").forEach((link) => {
      if (shouldSkipTransition(link)) return;

      link.addEventListener("click", (e) => {
        if (body.classList.contains("is-transitioning")) {
          e.preventDefault();
          return;
        }

        e.preventDefault();

        // si el menú estaba abierto, lo cerramos antes de navegar
        closeMenu();

        const url = link.getAttribute("href");
        body.classList.add("is-transitioning");
        body.classList.remove("page-loaded");

        setTimeout(() => {
          window.location.href = url;
        }, 280);
      });
    });
  });
})();
