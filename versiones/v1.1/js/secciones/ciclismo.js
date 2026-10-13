// Pestaña Ciclismo: volumen, velocidad, esfuerzo y detalle de cada salida.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeFechas, ejeY, tituloFecha, estiloBarra } = Tablero.graficos;
  const { kpis, delta } = Tablero.componentes;
  const { numero, duracion, ts, fechaCorta, fechaLarga, suma } = Tablero.formato;
  const { velocidadKmh } = Tablero.sesiones;

  const esBici = (a) => a.categoria === "Ciclismo";

  function render(ctx) {
    const salidas = ctx.actividades.filter(esBici);
    const anteriores = ctx.actividadesAnteriores?.filter(esBici);
    const c = colores();

    renderKpis(ctx, salidas, anteriores);

    if (!salidas.length) {
      ["g-bici-km", "g-bici-velocidad", "g-bici-fc", "g-bici-zonas"].forEach((id) =>
        sinDatos(id, "Sin salidas en bici en este período"));
    } else {
      renderKm(ctx, c);
      const linea = (id, etiqueta, valor, formato) => {
        const puntos = salidas.filter((a) => valor(a) != null).map((a) => ({ x: ts(a.fecha), y: valor(a) }));
        grafico(id, {
          type: "line",
          data: { datasets: [{ label: etiqueta, data: puntos, borderColor: c.categoria.Ciclismo, backgroundColor: c.categoria.Ciclismo, pointRadius: 4 }] },
          options: {
            interaction: { mode: "nearest", intersect: false },
            scales: { x: ejeFechas(ctx.desde, ctx.hasta), y: ejeY({ grace: "10%", ticks: { maxTicksLimit: 5, callback: formato } }) },
            plugins: { legend: { display: false }, tooltip: { callbacks: { title: tituloFecha, label: (i) => ` ${etiqueta}: ${formato(i.parsed.y)}` } } },
          },
        });
      };
      linea("g-bici-velocidad", "Velocidad media", (a) => velocidadKmh(a.distancia_m, a.duracion_s), (v) => `${numero(v, 1)} km/h`);
      linea("g-bici-fc", "FC media", (a) => a.fc_media, (v) => `${numero(v)} ppm`);
      renderZonas(salidas, c);
    }

    Tablero.sesiones.tabla("tabla-bici", salidas, [
      { titulo: "Fecha", valor: (a) => fechaLarga(a.fecha) },
      { titulo: "Km", num: true, valor: (a) => numero(a.distancia_m / 1000, 1) },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "km/h", num: true, valor: (a) => numero(velocidadKmh(a.distancia_m, a.duracion_s), 1) },
      { titulo: "Desnivel (m)", num: true, valor: (a) => a.desnivel_m ?? "—" },
      { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
    ], { vacio: "Sin salidas en bici en este período" });
  }

  function renderKpis(ctx, salidas, anteriores) {
    const totales = (lista) => ({
      n: lista.length,
      km: suma(lista, (a) => a.distancia_m) / 1000,
      horas: suma(lista, (a) => a.duracion_s) / 3600,
      desnivel: suma(lista, (a) => a.desnivel_m),
    });
    const t = totales(salidas);
    const p = anteriores ? totales(anteriores) : {};
    const per = ctx.etiquetaPeriodo;
    // Velocidad media ponderada: distancia total / tiempo total (no el promedio de promedios)
    const vel = t.horas ? t.km / t.horas : null;
    kpis("bici-kpis", [
      { etiqueta: "Salidas", valor: numero(t.n), delta: delta(t.n, p.n, per) },
      { etiqueta: "Distancia", valor: numero(t.km, 1), unidad: "km", delta: delta(t.km, p.km, per, (x) => `${numero(x, 1)} km`) },
      { etiqueta: "Velocidad media", valor: numero(vel, 1), unidad: "km/h" },
      { etiqueta: "Desnivel acumulado", valor: numero(t.desnivel), unidad: "m", delta: delta(t.desnivel, p.desnivel, per, (x) => `${numero(x)} m`) },
    ]);
  }

  function renderKm(ctx, c) {
    grafico("g-bici-km", {
      type: "bar",
      data: {
        labels: ctx.semanas.map((s) => fechaCorta(s.inicio)),
        datasets: [{ label: "Km", data: ctx.semanas.map((s) => (s.por_categoria.Ciclismo?.distancia_m ?? 0) / 1000), ...estiloBarra(c.categoria.Ciclismo) }],
      },
      options: {
        scales: { x: { grid: { display: false }, ticks: { maxRotation: 0 } }, y: ejeY({ beginAtZero: true, title: { display: true, text: "km" } }) },
        plugins: {
          legend: { display: false },
          tooltip: { filter: (i) => i.parsed.y > 0, callbacks: { title: (i) => `Semana del ${i[0].label}`, label: (i) => ` ${numero(i.parsed.y, 1)} km` } },
        },
      },
    });
  }

  function renderZonas(salidas, c) {
    const zonas = [0, 1, 2, 3, 4, 5, 6].map((z) => suma(salidas, (a) => a.zonas_s[z]) / 60);
    const total = zonas.reduce((a, b) => a + b, 0) || 1;
    grafico("g-bici-zonas", {
      type: "bar",
      data: {
        labels: zonas.map((_, z) => `Z${z + 1}`),
        datasets: [{ label: "Minutos", data: zonas, backgroundColor: c.rampa, borderRadius: { topRight: 4, bottomRight: 4 }, borderSkipped: "left", maxBarThickness: 22 }],
      },
      options: {
        indexAxis: "y",
        scales: { x: ejeY({ beginAtZero: true, title: { display: true, text: "minutos" } }), y: { grid: { display: false }, border: { display: false } } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (i) => ` ${numero(i.parsed.x)} min · ${numero((i.parsed.x / total) * 100)}% del tiempo` } },
        },
      },
    });
  }

  Tablero.secciones.ciclismo = { render };
})();
