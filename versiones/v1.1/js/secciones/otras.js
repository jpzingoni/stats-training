// Pestaña Otras actividades: todo lo que no tiene pestaña propia (caminata, …).
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeY, estiloBarra } = Tablero.graficos;
  const { kpis, delta, escapar } = Tablero.componentes;
  const { numero, ritmo, duracion, fechaCorta, fechaLarga, suma } = Tablero.formato;

  const PROPIAS = ["Carrera", "Pádel", "Ciclismo"];     // tienen su propia pestaña
  const GRUPOS = ["Caminata", "Otras"];                 // mismo agrupamiento que el Resumen
  const grupo = (a) => (GRUPOS.includes(a.categoria) ? a.categoria : "Otras");
  const esOtra = (a) => !PROPIAS.includes(a.categoria);

  function render(ctx) {
    const sesiones = ctx.actividades.filter(esOtra);
    const anteriores = ctx.actividadesAnteriores?.filter(esOtra);
    renderKpis(ctx, sesiones, anteriores);
    renderSemanal(ctx, "g-otras-horas", (c) => c.duracion_s / 3600, "horas", (v) => duracion(v * 3600), true);
    renderSemanal(ctx, "g-otras-km", (c) => c.distancia_m / 1000, "km", (v) => `${numero(v, 1)} km`, false);
    renderTabla(sesiones);
  }

  function totales(lista) {
    return {
      sesiones: lista.length,
      horas: suma(lista, (a) => a.duracion_s) / 3600,
      km: suma(lista, (a) => a.distancia_m) / 1000,
      carga: suma(lista, (a) => a.carga),
    };
  }

  function renderKpis(ctx, sesiones, anteriores) {
    const t = totales(sesiones);
    const p = anteriores ? totales(anteriores) : {};
    const per = ctx.etiquetaPeriodo;
    kpis("otras-kpis", [
      { etiqueta: "Sesiones", valor: numero(t.sesiones), delta: delta(t.sesiones, p.sesiones, per) },
      { etiqueta: "Tiempo total", valor: numero(t.horas, 1), unidad: "h", delta: delta(t.horas, p.horas, per, (x) => `${numero(x, 1)} h`) },
      { etiqueta: "Distancia", valor: numero(t.km, 1), unidad: "km", delta: delta(t.km, p.km, per, (x) => `${numero(x, 1)} km`) },
      { etiqueta: "Carga total", valor: numero(t.carga), unidad: "HRSS", delta: delta(t.carga, p.carga, per, (x) => numero(x)) },
    ]);
  }

  /** Barras por semana y por grupo. Las horas se apilan; los km van lado a lado
   *  (distancias de actividades distintas no se suman). */
  function renderSemanal(ctx, id, valor, unidad, formato, apilar) {
    const c = colores();
    const semanas = ctx.semanas;
    const grupos = GRUPOS.filter((g) => semanas.some((s) => s.por_categoria[g]));
    if (!grupos.length) return sinDatos(id, "Sin otras actividades en este período");
    grafico(id, {
      type: "bar",
      data: {
        labels: semanas.map((s) => fechaCorta(s.inicio)),
        datasets: grupos.map((g) => ({
          label: g,
          data: semanas.map((s) => (s.por_categoria[g] ? valor(s.por_categoria[g]) : 0)),
          ...estiloBarra(c.categoria[g], apilar),
        })),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { stacked: apilar, grid: { display: false }, ticks: { maxRotation: 0 } },
          y: ejeY({ stacked: apilar, beginAtZero: true, title: { display: true, text: unidad } }),
        },
        plugins: {
          tooltip: {
            filter: (i) => i.parsed.y > 0,
            callbacks: {
              title: (i) => `Semana del ${i[0].label}`,
              label: (i) => ` ${i.dataset.label}: ${formato(i.parsed.y)}`,
            },
          },
        },
      },
    });
  }

  function renderTabla(sesiones) {
    const c = colores();
    Tablero.sesiones.tabla("tabla-otras", sesiones, [
      { titulo: "Fecha", valor: (a) => fechaLarga(a.fecha) },
      { titulo: "Tipo", valor: (a) => `<span class="punto" style="background:${c.categoria[grupo(a)]}"></span>${escapar(a.categoria)}` },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "Km", num: true, valor: (a) => (a.distancia_m ? numero(a.distancia_m / 1000, 2) : "—") },
      { titulo: "Ritmo /km", num: true, valor: (a) => ritmo(a.ritmo_s_km) },
      { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
    ], { vacio: "Sin otras actividades en este período" });
  }

  Tablero.secciones.otras = { render };
})();
