// Piezas de interfaz que no son gráficos: tarjetas de KPI y tooltip flotante.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const escapar = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /**
   * Tarjetas de indicadores.
   * items: [{ etiqueta, valor, unidad?, delta?, variacion?, protagonista? }]
   *   delta       texto de contexto (una línea)
   *   variacion   { flecha, texto, tono } de Tablero.formato.variacion: va antes del contexto,
   *               con la flecha en --bien / --mal según convenga
   */
  function kpis(id, items) {
    document.getElementById(id).innerHTML = items.map((k) => {
      const v = k.variacion;
      const variacionHtml = v
        ? `<span class="${v.tono ?? ""}">${escapar(v.flecha)} ${escapar(v.texto)}</span>${k.delta ? " · " : ""}`
        : "";
      return `
      <div class="kpi${k.protagonista ? " protagonista" : ""}">
        <div class="kpi-etiqueta">${escapar(k.etiqueta)}</div>
        <div class="kpi-valor"><span>${escapar(k.valor)}</span>${k.unidad ? `<span class="kpi-unidad">${escapar(k.unidad)}</span>` : ""}</div>
        ${v || k.delta ? `<div class="kpi-delta">${variacionHtml}${escapar(k.delta ?? "")}</div>` : ""}
      </div>`;
    }).join("");
  }

  /** "+3 vs. 4 semanas anteriores" (o nada si no hay período anterior). */
  function delta(actual, anterior, periodo, formato = (x) => x) {
    if (anterior == null || actual == null) return "";
    const d = actual - anterior;
    const signo = d > 0 ? "+" : d < 0 ? "−" : "±";
    return `${signo}${formato(Math.abs(d))} vs. ${periodo} anteriores`;
  }

  const tooltip = () => document.getElementById("tooltip");

  function mostrarTooltip(html, x, y) {
    const t = tooltip();
    t.innerHTML = html;
    t.hidden = false;
    const r = t.getBoundingClientRect();
    const izq = Math.min(Math.max(8, x + 12), innerWidth - r.width - 8);
    const arriba = y - r.height - 12 < 8 ? y + 16 : y - r.height - 12;
    t.style.left = `${izq}px`;
    t.style.top = `${arriba}px`;
  }

  function ocultarTooltip() {
    tooltip().hidden = true;
  }

  Tablero.componentes = { kpis, delta, mostrarTooltip, ocultarTooltip, escapar };
})();
