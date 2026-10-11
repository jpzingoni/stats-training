// Formatos de números, ritmos, duraciones y fechas (español rioplatense).
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const DIA_MS = 86400000;

  const numero = (v, decimales = 0) =>
    v == null ? "—" : v.toLocaleString("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

  /** 550 → "9:10" */
  function ritmo(segundos) {
    if (segundos == null) return "—";
    const s = Math.round(segundos);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  /** 2691 → "45 min" · 5400 → "1 h 30 min" */
  function duracion(segundos) {
    if (segundos == null) return "—";
    const min = Math.round(segundos / 60);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
  }

  /** Fechas ISO "YYYY-MM-DD" como timestamp UTC (evita corrimientos por zona horaria). */
  const ts = (iso) => Date.parse(iso + "T00:00:00Z");
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const sumarDias = (isoFecha, dias) => iso(ts(isoFecha) + dias * DIA_MS);
  const lunesDe = (isoFecha) => {
    const d = new Date(ts(isoFecha));
    return sumarDias(isoFecha, -((d.getUTCDay() + 6) % 7));
  };

  /** "2026-07-18" → "18/07" */
  const fechaCorta = (f) => `${f.slice(8, 10)}/${f.slice(5, 7)}`;

  /** "2026-07-18" → "sáb 18 jul" */
  function fechaLarga(f) {
    const d = new Date(ts(f));
    return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
  }

  const mesCorto = (f) => MESES[Number(f.slice(5, 7)) - 1];

  const km = (metros) => (metros == null ? null : metros / 1000);

  const suma = (lista, fn) => lista.reduce((t, x) => t + (fn(x) ?? 0), 0);
  function promedio(lista, fn) {
    const v = lista.map(fn).filter((x) => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }

  Tablero.formato = { numero, ritmo, duracion, ts, iso, sumarDias, lunesDe, fechaCorta, fechaLarga, mesCorto, km, suma, promedio };
})();
