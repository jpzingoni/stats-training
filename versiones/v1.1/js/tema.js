// Tema: automático (según el sistema), claro u oscuro. Se recuerda en este navegador.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const MODOS = ["auto", "claro", "oscuro"];
  const ETIQUETAS = { auto: "Tema: auto", claro: "Tema: claro", oscuro: "Tema: oscuro" };

  function leer() {
    try { return MODOS.includes(localStorage.getItem("tema")) ? localStorage.getItem("tema") : "auto"; }
    catch { return "auto"; }
  }

  function aplicar(modo) {
    const raiz = document.documentElement;
    if (modo === "auto") delete raiz.dataset.theme;
    else raiz.dataset.theme = modo === "claro" ? "light" : "dark";
    document.getElementById("boton-tema").textContent = ETIQUETAS[modo];
  }

  /** Configura el botón y avisa (alCambiar) cuando cambian los colores, para redibujar. */
  function iniciarTema(alCambiar) {
    let modo = leer();
    aplicar(modo);
    document.getElementById("boton-tema").addEventListener("click", () => {
      modo = MODOS[(MODOS.indexOf(modo) + 1) % MODOS.length];
      try { localStorage.setItem("tema", modo); } catch { /* sin almacenamiento: solo esta visita */ }
      aplicar(modo);
      alCambiar();
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (modo === "auto") alCambiar();
    });
  }

  Tablero.tema = { iniciarTema };
})();
