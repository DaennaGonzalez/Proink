/* ============================================================
  js-principal.js — Base (Productos / Internas)
  ✅ Menú móvil overlay: abrir/cerrar con delegación de eventos
  ✅ Cierra con overlay / botón X / ESC / click fuera / click en links
  ✅ Bloquea scroll del body mientras está abierto (body.menu-open)
============================================================ */

(() => {
  "use strict";

  const $ = (sel, parent = document) => parent.querySelector(sel);

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

    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));

    document.body.classList.toggle("menu-open", isOpen);
  };

  const toggleMenu = () => {
    const { mobileNav } = getEls();
    if (!mobileNav) return;
    setMenuOpen(!mobileNav.classList.contains("is-open"));
  };

  const closeMenu = () => setMenuOpen(false);

  document.addEventListener("DOMContentLoaded", () => {
    // CLICK en captura para que nada “mate” el evento
    document.addEventListener(
      "click",
      (e) => {
        const { mobileNav, mobileOverlay, mobilePanel } = getEls();

        // Abrir/cerrar por hamburguesa
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

        // Cerrar por overlay (click exacto sobre overlay)
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
      true
    );

    // TOUCHSTART (captura) para móviles
    document.addEventListener(
      "touchstart",
      (e) => {
        const toggleBtn = e.target.closest("#navToggle, .nav-toggle");
        if (toggleBtn) {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
          return;
        }

        const closeBtn = e.target.closest("#mobileNavClose, .mobile-nav__close");
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          return;
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
  });
})();



/* =========================================================
   EFECTO GELATINA INTENSO — WHATSAPP FLOAT
========================================================= */
(function () {
  const whatsapp = document.querySelector('.whatsapp-float');
  if (!whatsapp) return;

  function gelatinaFuerte(element, duration = 850) {
    element.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.35, 0.80)' },
        { transform: 'scale(0.75, 1.1)' },
        { transform: 'scale(1.25, 0.85)' },
        { transform: 'scale(0.9, 1.4)' },
        { transform: 'scale(1.08)' },
        { transform: 'scale(1)' }
      ],
      {
        duration,
        easing: 'cubic-bezier(.25,1.7,.45,1)',
        fill: 'both'
      }
    );
  }

  // Hover → rebote grande
  whatsapp.addEventListener('mouseenter', () => {
    gelatinaFuerte(whatsapp, 750);
  });

  // Click → rebote MÁS fuerte
  whatsapp.addEventListener('click', () => {
    gelatinaFuerte(whatsapp, 1000);
  });
})();


/* =========================================================
   COPIAR CORREO AL PORTAPAPELES (EMAIL)
========================================================= */
const emailBtn = document.getElementById('emailBtn');

if (emailBtn) {
  emailBtn.addEventListener('click', () => {
    const email = 'proinkqro@gmail.com';

    navigator.clipboard.writeText(email).then(() => {
      // Feedback visual
      emailBtn.classList.add('is-copied');

      // Cambiar texto temporalmente
      const label = emailBtn.querySelector('.contacto-proink__label');
      const originalText = label.textContent;
      label.textContent = '¡Correo copiado! proinkqro@gmail.com';

      setTimeout(() => {
        label.textContent = originalText;
        emailBtn.classList.remove('is-copied');
      }, 1600);
    }).catch(err => {
      console.error('Error al copiar el correo:', err);
    });
  });
}
