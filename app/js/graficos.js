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
      zonas: [1, 2, 3, 4, 5, 6, 7].map((i) => v(`--zona-${i}`)),   // zonas de FC
      tinta: v("--tinta"), bien: v("--bien"), mal: v("--mal"),
      diario: v("--serie-diaria"),   // métricas diarias (pasos, sueño)
    };
  }

  /**
   * Tipografía de los gráficos leída de los tokens --t-* del CSS (DESIGN.md §1): nada de
   * tamaños ni fuentes escritos en JS. Cada rol devuelve
   *   { family, size, weight, lineHeight }  → para Chart.js (font: {...})
   *   canvas                                → "700 10px Nunito, …" para ctx.font
   * Uso: tipografia().eje, tipografia().chico, tipografia().etiqueta…
   */
  const ROLES = ["hero", "kpi", "pagina", "titulo", "base", "control", "chico", "eje", "etiqueta"];
  function tipografia() {
    const s = getComputedStyle(document.documentElement);
    const roles = {};
    for (const rol of ROLES) {
      // El token es "peso tamaño/interlineado familia" (con la familia ya resuelta)
      const m = /^(\d+)\s+([\d.]+)px\/([\d.]+)px\s+(.+)$/.exec(s.getPropertyValue(`--t-${rol}`).trim());
      if (!m) continue;
      const [, weight, size, lineHeight, family] = m;
      roles[rol] = {
        family, size: Number(size), weight, lineHeight: Number(lineHeight) / Number(size),
        canvas: `${weight} ${size}px ${family}`,
      };
    }
    return roles;
  }
  const fuenteChart = ({ family, size, weight, lineHeight }) => ({ family, size, weight, lineHeight });

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
    // Por defecto, todo texto de Chart.js es de eje (--t-eje); leyendas y tooltips, --t-chico
    Chart.defaults.font = fuenteChart(t.eje);
    Chart.defaults.color = c.muted;
    Chart.defaults.borderColor = c.grilla;
    Chart.defaults.maintainAspectRatio = false;
    // Sin animación: cada gráfico se dibuja de una vez (con animación, el dibujo seguía en
    // cuadros posteriores y ahí fallaba en algunos navegadores)
    Chart.defaults.animation = false;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.font = fuenteChart(t.chico);
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.color = c.textoSec;
    Chart.defaults.plugins.legend.align = "start";
    Chart.defaults.plugins.legend.labels.sort = (a, b) => a.datasetIndex - b.datasetIndex;
    Object.assign(Chart.defaults.plugins.tooltip, {
      backgroundColor: c.superficie, titleColor: c.texto, bodyColor: c.textoSec,
      borderColor: c.eje, borderWidth: 1, padding: 8, boxPadding: 4, usePointStyle: true, cornerRadius: 6,
      titleFont: { ...fuenteChart(t.chico), weight: "600" }, bodyFont: fuenteChart(t.chico),
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

  /** Plugin: bandas horizontales de fondo con las zonas de FC (Z1 abajo, Z7 arriba). */
  const BANDAS_ZONAS = {
    id: "bandasZonas",
    beforeDatasetsDraw(chart) {
      const op = chart.options.plugins.bandasZonas;
      if (!op) return;
      const { ctx, chartArea: area, scales: { y } } = chart;
      ctx.save();
      ctx.globalAlpha = 0.25;   // bandas horizontales de FC
      let inferior = y.min;
      op.limites.forEach((sup, z) => {
        const desde = Math.max(inferior, y.min), hasta = Math.min(z === op.limites.length - 1 ? y.max : sup, y.max);
        if (hasta > desde) {
          const top = y.getPixelForValue(hasta), bottom = y.getPixelForValue(desde);
          ctx.fillStyle = op.colores[z];
          ctx.fillRect(area.left, top, area.right - area.left, bottom - top);
        }
        inferior = sup;
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = Chart.defaults.color;
      ctx.font = Tablero.graficos.tipografia().etiqueta.canvas;   // "Z1"…"Z7" en --t-etiqueta
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      inferior = y.min;
      op.limites.forEach((sup, z) => {
        const desde = Math.max(inferior, y.min), hasta = Math.min(z === op.limites.length - 1 ? y.max : sup, y.max);
        const alto = y.getPixelForValue(desde) - y.getPixelForValue(hasta);
        if (alto > 12) ctx.fillText(`Z${z + 1}`, area.right - 4, y.getPixelForValue((desde + hasta) / 2));
        inferior = sup;
      });
      ctx.restore();
    },
  };

  /**
   * Plugin: una franja por sesión justo debajo del área del gráfico, pintada minuto a minuto
   * con el color de su zona de FC. A la izquierda, un cuadradito con el color de la sesión.
   */
  /** Recorre los minutos de una franja con su tramo en píxeles (de la mitad hacia el anterior a la mitad hacia el siguiente). */
  function tramosZona(pts, x, area, hacer) {
    pts.forEach((p, i) => {
      if (p.z == null) return;
      const ant = pts[i - 1]?.z != null ? pts[i - 1].x : null, sig = pts[i + 1]?.z != null ? pts[i + 1].x : null;
      const medio = ((sig ?? (ant != null ? 2 * p.x - ant : p.x + 0.5)) - (ant ?? (sig != null ? 2 * p.x - sig : p.x - 0.5))) / 2;
      const x0 = Math.max(x.getPixelForValue(ant != null ? (ant + p.x) / 2 : p.x - medio / 2), area.left);
      const x1 = Math.min(x.getPixelForValue(sig != null ? (p.x + sig) / 2 : p.x + medio / 2), area.right);
      const r0 = Math.round(x0), r1 = Math.round(x1);   // píxeles enteros: sin rayitas entre minutos
      if (r1 > r0) hacer(r0, r1 - r0, p.z);
    });
  }

  const FRANJAS_ZONAS = {
    id: "franjasZonas",
    // Con una sola sesión, además, el fondo del gráfico se pinta con la zona de cada minuto
    beforeDatasetsDraw(chart) {
      const op = chart.options.plugins.franjasZonas;
      if (!op?.fondo || op.franjas.length !== 1) return;
      const { ctx, chartArea: area, scales: { x } } = chart;
      ctx.save();
      ctx.globalAlpha = 0.35;   // fondo por minuto
      tramosZona(op.franjas[0].puntos, x, area, (x0, ancho, z) => {
        ctx.fillStyle = op.colores[z];
        ctx.fillRect(x0, area.top, ancho, area.bottom - area.top);
      });
      ctx.restore();
    },
    afterDraw(chart) {
      const op = chart.options.plugins.franjasZonas;
      if (!op) return;
      const { ctx, chartArea: area, scales: { x } } = chart;
      ctx.save();
      op.franjas.forEach((f, k) => {
        const top = area.bottom + 4 + k * (op.alto + op.sep);
        tramosZona(f.puntos, x, area, (x0, ancho, z) => {
          ctx.fillStyle = op.colores[z];
          ctx.fillRect(x0, top, ancho, op.alto);
        });
        if (op.franjas.length > 1) { ctx.fillStyle = f.color; ctx.fillRect(area.left - 10, top, op.alto, op.alto); }
      });
      ctx.restore();
    },
  };

  Tablero.graficos = { FRANJAS_ZONAS, BANDAS_ZONAS, colores, aplicarEstiloGlobal, grafico, sinDatos, destruirTodos, ejeFechas, tituloFecha, ejeY, estiloBarra, GRUPOS, VAR_GRUPO, grupoDe, tipografia, conAlfa };
})();
