/* =========================================================
   CATÁLOGO — VISOR PDF TIPO LIBRO (DearFlip)
   Archivo: js-catalogo.js

   Requisitos en catalogo.html:
   1) Cargar jQuery
   2) Cargar DearFlip CSS + JS
   3) Tener estos elementos:
      - #book
      - #loadingText
      - #prevPage, #nextPage
      - #pageInfo
========================================================= */

(() => {
  // ✅ Cambia aquí el nombre del PDF
  const PDF_FILE = "ejemplorevista.pdf";

  // Elementos UI
  const bookEl = document.getElementById("book");
  const loadingEl = document.getElementById("loadingText");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  if (!bookEl) {
    console.warn("[Catálogo] No existe #book en el HTML.");
    return;
  }

  // Helpers
  const setLoading = (msg) => {
    if (!loadingEl) return;
    loadingEl.textContent = msg;
    loadingEl.style.display = "block";
  };

  const hideLoading = () => {
    if (!loadingEl) return;
    loadingEl.style.display = "none";
  };

  const setPageInfo = (current, total) => {
    if (!pageInfo) return;
    if (!total) {
      pageInfo.textContent = "—";
      return;
    }
    pageInfo.textContent = `${current} / ${total}`;
  };

  // Validar librería
  const hasJQ = typeof window.jQuery !== "undefined";
  if (!hasJQ) {
    setLoading("Falta jQuery para el catálogo (DearFlip lo necesita).");
    console.error("[Catálogo] Falta jQuery.");
    return;
  }

  // DearFlip se expone como jQuery plugin: $(el).dearflip(...)
  const $ = window.jQuery;

  const init = () => {
    setLoading("Cargando catálogo…");

    // Limpia contenedor
    bookEl.innerHTML = "";

    // ⚙️ Configuración DearFlip
    // Nota: se llama sobre #book y le pasas el PDF.
    const options = {
      source: PDF_FILE,

      // Vista libro:
      // "flipbook" es libro con animación de página
      // En algunas builds puede variar; DearFlip detecta.
      type: "flipbook",

      // UX
      autoSound: false,
      enableSound: false,
      duration: 700,     // velocidad de volteo
      enableDownload: false, // nosotros ya damos botón de descarga externo

      // Ajuste de tamaño
      height: "100%",
      width: "100%",

      // Responsive
      isResponsive: true,

      // Algunas opciones visuales típicas
      backgroundColor: "transparent",
      showPrintControl: false,

      // Callbacks (si tu build los soporta)
      onReady: function (app) {
        hideLoading();

        // Intentamos leer total páginas si está disponible
        try {
          const total = app?.book?.pageCount || app?.options?.pageCount || null;
          setPageInfo(1, total);
        } catch (e) {
          setPageInfo(1, null);
        }
      },

      onPageChanged: function (app) {
        try {
          const current = (app?.book?.currentPage || 0) + 1;
          const total = app?.book?.pageCount || null;
          setPageInfo(current, total);
        } catch (e) {
          // Si no se puede leer, no hacemos nada
        }
      },

      onError: function () {
        setLoading("No se pudo cargar el PDF. Verifica el nombre/ruta.");
      }
    };

    // Inicializar plugin DearFlip
    // Guardamos instancia para botones
    let instance = null;

    try {
      instance = $(bookEl).dearflip(options);
    } catch (err) {
      console.error(err);
      setLoading("Error inicializando el visor. Revisa librerías (DearFlip).");
      return;
    }

    // Botones
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        try {
          // DearFlip suele exponer métodos en instance.data("df-app")
          const app = $(bookEl).data("df-app");
          app?.openPage?.("prev");
        } catch (e) {}
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        try {
          const app = $(bookEl).data("df-app");
          app?.openPage?.("next");
        } catch (e) {}
      });
    }

    // Navegación teclado
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prevBtn?.click();
      if (e.key === "ArrowRight") nextBtn?.click();
    });
  };

  // Espera a que cargue todo
  window.addEventListener("load", init);
})();
