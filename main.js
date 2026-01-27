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


const openMobileNav = () => {
  mobileNav.classList.add("is-open");
  mobileNav.style.display = "block";
  setAria(true);
  body.classList.add("menu-open");   // ✅ AÑADIR
};

const closeMobileNav = () => {
  mobileNav.classList.remove("is-open");
  mobileNav.style.display = "";
  setAria(false);
  body.classList.remove("menu-open"); // ✅ AÑADIR
};



/* =========================================================
  VIDEO FULL WIDTH — AUTOPLAY FIX + CTA SCROLL
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".home-video-full__video");
  const ctaBtn = document.querySelector(".home-video-full__button");

  // 1) Intento de autoplay (en iOS/Android puede fallar aunque esté muted)
  if (video) {
    // Asegura condiciones de autoplay
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (err) {
        // Autoplay bloqueado: no hacemos nada agresivo.
        // Queda listo para que el usuario toque el video o el botón.
        // console.warn("Autoplay bloqueado:", err);
      }
    };

    // Primer intento
    tryPlay();

    // Reintento cuando la pestaña vuelve a estar activa (muy común en móvil)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tryPlay();
    });

    // Opcional: click/tap en el video = play/pause (útil cuando autoplay falla)
    video.addEventListener("click", () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
  }

  // 2) Botón CTA: scroll suave a "¿Quiénes somos?" (ajusta el destino)
  if (ctaBtn) {
    ctaBtn.addEventListener("click", (e) => {
      // Si lo dejaste como link a otra página, NO prevenimos
      // Si lo quieres para scroll dentro del index, usa #quienesSomos
      const href = ctaBtn.getAttribute("href") || "";

      // Caso A: es ancla interna (#algo)
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Caso B: si quieres forzar scroll a una sección específica del index
      // aunque no sea ancla (descomenta y ajusta):
      /*
      e.preventDefault();
      const target = document.querySelector("#quienesSomos");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      */
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const v = document.querySelector(".hero-video__media");
  if (!v) return;

  // intento de autoplay (por si Safari se pone especial)
  const tryPlay = () => {
    v.muted = true;
    v.playsInline = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  tryPlay();

  // si el navegador bloquea, se activa al primer toque
  window.addEventListener("touchstart", tryPlay, { once: true });
});
