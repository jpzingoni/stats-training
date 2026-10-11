// Pestaña Carrera: progreso, volumen, intensidad y técnica.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeFechas, ejeY, tituloFecha, estiloBarra } = Tablero.graficos;
  const { kpis, delta, escapar } = Tablero.componentes;
  const { numero, ritmo, duracion, ts, fechaCorta, fechaLarga, suma, promedio } = Tablero.formato;

  const SUBTIPOS = ["Bloques", "Series", "Libre"];

  function render(ctx) {
    const corridas = ctx.actividades.filter((a) => a.categoria === "Carrera");
    const anteriores = ctx.actividadesAnteriores?.filter((a) => a.categoria === "Carrera");
    const conBloque = corridas.filter((a) => a.bloque_principal);

    renderKpis(ctx, corridas, anteriores, conBloque);
    renderBloquePrincipal(ctx, conBloque);
    renderEficiencia(ctx, corridas);
    renderKm(ctx);
    renderZonas(ctx);
    renderDinamica(ctx, corridas);
    renderTabla(corridas);
  }

  function renderKpis(ctx, corridas, anteriores, conBloque) {
    const per = ctx.etiquetaPeriodo;
    const kmAct = suma(corridas, (a) => a.distancia_m) / 1000;
    const kmAnt = anteriores ? suma(anteriores, (a) => a.distancia_m) / 1000 : null;
    const efAct = promedio(corridas, (a) => a.eficiencia);
    const efAnt = anteriores ? promedio(anteriores, (a) => a.eficiencia) : null;

    let bloque = { etiqueta: "Último bloque principal", valor: "—", unidad: "/km" };
    if (conBloque.length) {
      const ultimo = conBloque.at(-1).bloque_principal;
      const primero = conBloque[0].bloque_principal;
      const dif = ultimo.ritmo_s_km - primero.ritmo_s_km;
      bloque = {
        ...bloque,
        valor: ritmo(ultimo.ritmo_s_km),
        delta: conBloque.length > 1
          ? `${dif < 0 ? "−" : dif > 0 ? "+" : "±"}${ritmo(Math.abs(dif))} vs. el primero del período`
          : "",
      };
    }

    kpis("carrera-kpis", [
      { etiqueta: "Corridas", valor: numero(corridas.length), delta: delta(corridas.length, anteriores?.length, per) },
      { etiqueta: "Distancia", valor: numero(kmAct, 1), unidad: "km", delta: delta(kmAct, kmAnt, per, (x) => `${numero(x, 1)} km`) },
      bloque,
      { etiqueta: "Eficiencia media", valor: numero(efAct, 2), unidad: "m/latido", delta: delta(efAct, efAnt, per, (x) => numero(x, 2)) },
    ]);
  }

  function lineaTiempo(id, ctx, puntos, { color, etiqueta, formato, invertir = false, minimo = 2 }) {
    if (puntos.length < minimo) {
      return sinDatos(id, puntos.length ? "Hace falta más de una sesión para ver la tendencia" : "Sin datos en este período");
    }
    grafico(id, {
      type: "line",
      data: { datasets: [{ label: etiqueta, data: puntos, borderColor: color, backgroundColor: color, pointRadius: 4 }] },
      options: {
        interaction: { mode: "nearest", intersect: false },
        scales: {
          x: ejeFechas(ctx.desde, ctx.hasta),
          y: ejeY({ reverse: invertir, grace: "10%", ticks: { maxTicksLimit: 5, callback: formato } }),
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { title: tituloFecha, label: (i) => ` ${etiqueta}: ${formato(i.parsed.y)}` } },
        },
      },
    });
  }

  function renderBloquePrincipal(ctx, conBloque) {
    const c = colores();
    lineaTiempo("g-bp-ritmo", ctx,
      conBloque.map((a) => ({ x: ts(a.fecha), y: a.bloque_principal.ritmo_s_km })),
      { color: c.subtipo.Bloques, etiqueta: "Ritmo", formato: (v) => `${ritmo(v)} /km`, invertir: true });
    lineaTiempo("g-bp-fc", ctx,
      conBloque.map((a) => ({ x: ts(a.fecha), y: a.bloque_principal.fc_media })),
      { color: c.subtipo.Bloques, etiqueta: "FC media", formato: (v) => `${numero(v)} ppm` });
  }

  function renderEficiencia(ctx, corridas) {
    const c = colores();
    const conDato = corridas.filter((a) => a.eficiencia != null);
    if (!conDato.length) return sinDatos("g-eficiencia");
    const subtipos = SUBTIPOS.filter((s) => conDato.some((a) => a.subtipo === s));
    grafico("g-eficiencia", {
      type: "line",
      data: {
        datasets: subtipos.map((s) => ({
          label: s,
          data: conDato.filter((a) => a.subtipo === s).map((a) => ({ x: ts(a.fecha), y: a.eficiencia, a })),
          borderColor: c.subtipo[s], backgroundColor: c.subtipo[s],
          showLine: false, pointRadius: 5, pointHoverRadius: 7,
          pointBorderColor: c.superficie, pointBorderWidth: 2,
        })),
      },
      options: {
        interaction: { mode: "nearest", intersect: false },
        scales: { x: ejeFechas(ctx.desde, ctx.hasta), y: ejeY({ grace: "5%", title: { display: true, text: "m/latido" } }) },
        plugins: {
          tooltip: {
            callbacks: {
              title: tituloFecha,
              label: (i) => {
                const a = i.raw.a;
                return [` ${i.dataset.label}: ${numero(i.parsed.y, 2)} m/latido`,
                  ` ${numero(a.distancia_m / 1000, 2)} km a ${ritmo(a.ritmo_s_km)} /km, ${a.fc_media} ppm`];
              },
            },
          },
        },
      },
    });
  }

  function renderKm(ctx) {
    const c = colores();
    const semanas = ctx.semanas;
    if (!semanas.length) return sinDatos("g-km");
    const subtipos = SUBTIPOS.filter((s) => semanas.some((w) => w.por_categoria.Carrera?.distancia_m_por_subtipo?.[s]));
    grafico("g-km", {
      type: "bar",
      data: {
        labels: semanas.map((s) => fechaCorta(s.inicio)),
        datasets: subtipos.map((s) => ({
          label: s,
          data: semanas.map((w) => (w.por_categoria.Carrera?.distancia_m_por_subtipo?.[s] ?? 0) / 1000),
          ...estiloBarra(c.subtipo[s], true),
        })),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0 } },
          y: ejeY({ stacked: true, title: { display: true, text: "km" } }),
        },
        plugins: {
          tooltip: {
            filter: (i) => i.parsed.y > 0,
            callbacks: {
              title: (i) => `Semana del ${i[0].label}`,
              label: (i) => ` ${i.dataset.label}: ${numero(i.parsed.y, 1)} km`,
              footer: (items) => `Total: ${numero(items.reduce((t, i) => t + i.parsed.y, 0), 1)} km`,
            },
          },
        },
      },
    });
  }

  function renderZonas(ctx) {
    const c = colores();
    const semanas = ctx.semanas.filter((s) => s.por_categoria.Carrera);
    if (!semanas.length) return sinDatos("g-zonas");
    const limites = ctx.meta.zonas_fc_carrera;
    const nombreZona = (z) => `Z${z + 1} (${z === 0 ? "<" : `${limites[z - 1] + 1}–`}${limites[z]})`;
    const pct = semanas.map((s) => {
      const zonas = s.por_categoria.Carrera.zonas_s;
      const total = zonas.reduce((a, b) => a + b, 0) || 1;
      return zonas.map((z) => (z / total) * 100);
    });
    grafico("g-zonas", {
      type: "bar",
      data: {
        labels: semanas.map((s) => fechaCorta(s.inicio)),
        datasets: limites.map((_, z) => ({
          label: `Z${z + 1}`,
          data: pct.map((p) => p[z]),
          segundos: semanas.map((s) => s.por_categoria.Carrera.zonas_s[z]),
          ...estiloBarra(c.rampa[z], true),
          borderRadius: 0,
        })),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0 } },
          y: ejeY({ stacked: true, max: 100, ticks: { callback: (v) => `${v}%`, stepSize: 25 } }),
        },
        plugins: {
          tooltip: {
            itemSort: (a, b) => b.datasetIndex - a.datasetIndex,
            callbacks: {
              title: (i) => `Semana del ${i[0].label}`,
              label: (i) => ` ${nombreZona(i.datasetIndex)}: ${numero(i.parsed.y)}% · ${duracion(i.dataset.segundos[i.dataIndex])}`,
            },
          },
        },
      },
    });
  }

  function renderDinamica(ctx, corridas) {
    const c = colores();
    const metricas = [
      ["g-cadencia", "cadencia", "Cadencia", (v) => `${numero(v)} ppm`],
      ["g-zancada", "zancada", "Zancada", (v) => `${numero(v, 2)} m`],
      ["g-contacto", "contacto", "Contacto", (v) => `${numero(v)} ms`],
      ["g-oscilacion", "oscilacion", "Oscilación", (v) => `${numero(v, 1)} cm`],
    ];
    for (const [id, clave, etiqueta, formato] of metricas) {
      const puntos = corridas.filter((a) => a.dinamica[clave] != null).map((a) => ({ x: ts(a.fecha), y: a.dinamica[clave] }));
      lineaTiempo(id, ctx, puntos, { color: c.categoria.Carrera, etiqueta, formato });
      const g = Chart.getChart(id);
      if (g) {
        g.options.elements.point.radius = 2;
        g.options.scales.x.ticks.maxTicksLimit = 4;
        g.options.scales.y.ticks.maxTicksLimit = 4;
        g.update("none");
      }
    }
  }

  function renderTabla(corridas) {
    Tablero.sesiones.tabla("tabla-carreras", corridas, [
      { titulo: "Fecha", valor: (a) => fechaLarga(a.fecha) },
      { titulo: "Tipo", valor: (a) => escapar(a.subtipo ?? "—") },
      { titulo: "Km", num: true, valor: (a) => numero(a.distancia_m / 1000, 2) },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "Ritmo prom.", num: true, valor: (a) => ritmo(a.ritmo_s_km) },
      { titulo: "Bloque 2", num: true, valor: (a) => (a.bloque_principal ? ritmo(a.bloque_principal.ritmo_s_km) : "—") },
      { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
    ], { vacio: "Sin corridas en este período" });
  }

  Tablero.secciones.carrera = { render };
})();
