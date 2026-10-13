// Helpers comunes para Chart.js: colores desde CSS, opciones base y registro de gráficos.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { ts, iso, fechaCorta, fechaLarga, lunesDe, sumarDias } = Tablero.formato;

  const registro = new Map();
  const SEMANA_MS = 7 * 86400000;

  /** Lee los tokens de color del CSS (cambian con el tema). */
  function colores() {
    const s = getComputedStyle(document.documentElement);
    const v = (n) => s.getPropertyValue(n).trim();
    return {
      texto: v("--texto"), textoSec: v("--texto-sec"), muted: v("--texto-muted"),
      grilla: v("--grilla"), eje: v("--eje"), superficie: v("--superficie"),
      categoria: { Carrera: v("--serie-1"), "Pádel": v("--serie-2"), Caminata: v("--serie-3"), Ciclismo: v("--serie-4"), Otras: v("--serie-otras") },
      subtipo: { Bloques: v("--serie-1"), Series: v("--serie-2"), Libre: v("--serie-3"), "Sin subtipo": v("--serie-otras") },
      serie: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => v(`--serie-${i}`)),
      rampa: [1, 2, 3, 4, 5, 6, 7].map((i) => v(`--rampa-${i}`)),
      rampaVacio: v("--rampa-vacio"),
      tinta: v("--tinta"), bien: v("--bien"), mal: v("--mal"),
    };
  }

  /** Tipografía de los gráficos leída de los tokens (nada de tamaños fijos en JS). */
  function tipografia() {
    const s = getComputedStyle(document.documentElement);
    const v = (n) => s.getPropertyValue(n).trim();
    return {
      familia: v("--fuente-num"), familiaTexto: v("--fuente"),
      chico: parseFloat(v("--tx-chico")), etiqueta: parseFloat(v("--tx-etiqueta")),
    };
  }

  /** "#2a78d6" + 0.6 → "rgba(42, 120, 214, 0.6)" (para atenuar barras sin inventar colores). */
  function conAlfa(color, alfa) {
    const m = /^#([0-9a-f]{6})$/i.exec(color.trim());
    if (!m) return color;
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
  }

  function aplicarEstiloGlobal() {
    const c = colores();
    const t = tipografia();
    // Los ejes son casi todo números: fuente condensada; tamaño --tx-chico (DESIGN.md)
    Chart.defaults.font.family = t.familia;
    Chart.defaults.font.size = t.chico;
    Chart.defaults.color = c.muted;
    Chart.defaults.borderColor = c.grilla;
    Chart.defaults.maintainAspectRatio = false;
    // Sin animación: cada gráfico se dibuja de una vez (con animación, el dibujo seguía en
    // cuadros posteriores y ahí fallaba en algunos navegadores)
    Chart.defaults.animation = false;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.font = { family: t.familiaTexto, size: t.chico };
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.color = c.textoSec;
    Chart.defaults.plugins.legend.align = "start";
    Chart.defaults.plugins.legend.labels.sort = (a, b) => a.datasetIndex - b.datasetIndex;
    Object.assign(Chart.defaults.plugins.tooltip, {
      backgroundColor: c.superficie, titleColor: c.texto, bodyColor: c.textoSec,
      borderColor: c.eje, borderWidth: 1, padding: 8, boxPadding: 4, usePointStyle: true, cornerRadius: 6,
      titleFont: { family: t.familiaTexto, size: t.chico, weight: "600" }, bodyFont: { family: t.familia, size: t.chico },
    });
    Chart.defaults.elements.line.borderWidth = 2;
    Chart.defaults.elements.point.radius = 3;
    Chart.defaults.elements.point.hoverRadius = 5;
    Chart.defaults.elements.point.hitRadius = 8;
  }

  /** Crea (o reemplaza) un gráfico en el canvas con ese id. */
  function grafico(id, config) {
    destruir(id);
    const canvas = document.getElementById(id);
    canvas.hidden = false;
    canvas.parentElement.querySelector(".vacio")?.remove();
    const g = new Chart(canvas, config);
    registro.set(id, g);
    return g;
  }

  /** Muestra un mensaje en lugar del gráfico (por ejemplo, sin datos en el período). */
  function sinDatos(id, mensaje = "Sin datos en este período") {
    destruir(id);
    const canvas = document.getElementById(id);
    canvas.hidden = true;
    const cont = canvas.parentElement;
    let aviso = cont.querySelector(".vacio");
    if (!aviso) { aviso = document.createElement("div"); aviso.className = "vacio"; cont.append(aviso); }
    aviso.textContent = mensaje;
  }

  function destruir(id) {
    registro.get(id)?.destroy();
    registro.delete(id);
  }

  function destruirTodos() {
    for (const id of [...registro.keys()]) destruir(id);
  }

  /** Eje X temporal (lineal en ms) con marcas cada lunes, sin necesidad de adaptador de fechas. */
  function ejeFechas(desde, hasta) {
    return {
      type: "linear",
      min: ts(desde) - 86400000 / 2,
      max: ts(hasta) + 86400000 / 2,
      grid: { display: false },
      border: { color: colores().eje },
      afterBuildTicks(eje) {
        const marcas = [];
        const total = (ts(hasta) - ts(desde)) / SEMANA_MS;
        const paso = total > 16 ? 2 : 1;              // con muchas semanas, una marca cada dos
        let f = lunesDe(desde);
        if (ts(f) < ts(desde)) f = sumarDias(f, 7);
        for (let i = 0; ts(f) <= ts(hasta); i++, f = sumarDias(f, 7)) {
          if (i % paso === 0) marcas.push({ value: ts(f) });
        }
        eje.ticks = marcas;
      },
      ticks: { callback: (v) => fechaCorta(iso(v)), maxRotation: 0, autoSkip: true },
    };
  }

  const tituloFecha = (items) => (items.length ? fechaLarga(iso(items[0].parsed.x)) : "");

  function ejeY(opciones = {}) {
    return {
      grid: { color: colores().grilla },
      border: { display: false },
      ticks: { maxTicksLimit: 5 },
      ...opciones,
    };
  }

  /** Estilo de barras: extremo redondeado y separación de 2 px con el color de la superficie. */
  function estiloBarra(color, apilada = false) {
    return {
      backgroundColor: color,
      borderColor: colores().superficie,
      borderWidth: apilada ? { top: 2 } : 0,
      borderRadius: apilada ? 0 : { topLeft: 2, topRight: 2 },   // radio superior de 2px (DESIGN.md)
      borderSkipped: "bottom",
      maxBarThickness: 36,
    };
  }

  /** Grupos de actividad (los mismos que usan el Resumen y los filtros) y su color como variable CSS. */
  const GRUPOS = ["Carrera", "Pádel", "Ciclismo", "Caminata", "Otras"];
  const VAR_GRUPO = {
    Carrera: "var(--serie-1)", "Pádel": "var(--serie-2)", Caminata: "var(--serie-3)",
    Ciclismo: "var(--serie-4)", Otras: "var(--serie-otras)",
  };
  const grupoDe = (a) => (GRUPOS.includes(a.categoria) ? a.categoria : "Otras");

  Tablero.graficos = { colores, aplicarEstiloGlobal, grafico, sinDatos, destruirTodos, ejeFechas, tituloFecha, ejeY, estiloBarra, GRUPOS, VAR_GRUPO, grupoDe, tipografia, conAlfa };
})();
