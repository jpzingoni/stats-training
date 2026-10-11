// Pestaña Pádel: sesiones, carga, frecuencia cardíaca y zonas.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { grafico, sinDatos, colores, ejeY, estiloBarra } = Tablero.graficos;
  const { kpis, delta } = Tablero.componentes;
  const { numero, duracion, fechaCorta, fechaLarga, suma, promedio } = Tablero.formato;

  function render(ctx) {
    const sesiones = ctx.actividades.filter((a) => a.categoria === "Pádel");
    const anteriores = ctx.actividadesAnteriores?.filter((a) => a.categoria === "Pádel");
    const per = ctx.etiquetaPeriodo;
    const c = colores();

    const horas = suma(sesiones, (a) => a.duracion_s) / 3600;
    const cargaMedia = promedio(sesiones, (a) => a.carga);
    const fcMedia = promedio(sesiones, (a) => a.fc_media);
    kpis("padel-kpis", [
      { etiqueta: "Sesiones", valor: numero(sesiones.length), delta: delta(sesiones.length, anteriores?.length, per) },
      { etiqueta: "Tiempo total", valor: numero(horas, 1), unidad: "h",
        delta: delta(horas, anteriores && suma(anteriores, (a) => a.duracion_s) / 3600, per, (x) => `${numero(x, 1)} h`) },
      { etiqueta: "Carga media", valor: numero(cargaMedia), unidad: "HRSS" },
      { etiqueta: "FC media", valor: numero(fcMedia), unidad: "ppm" },
    ]);

    Tablero.sesiones.tabla("tabla-padel", sesiones, [
      { titulo: "Fecha", valor: (a) => fechaLarga(a.fecha) },
      { titulo: "Tiempo", num: true, valor: (a) => duracion(a.duracion_s) },
      { titulo: "FC media / máx", num: true, valor: (a) => `${a.fc_media ?? "—"} / ${a.fc_max ?? "—"}` },
      { titulo: "Carga", num: true, valor: (a) => a.carga ?? "—" },
      { titulo: "Calorías", num: true, valor: (a) => numero(a.calorias) },
    ], { vacio: "Sin sesiones de pádel en este período" });

    if (!sesiones.length) {
      ["g-padel-carga", "g-padel-fc", "g-padel-zonas"].forEach((id) => sinDatos(id, "Sin sesiones de pádel en este período"));
      return;
    }

    const etiquetas = sesiones.map((a) => fechaCorta(a.fecha));
    const titulo = (i) => `${fechaLarga(sesiones[i[0].dataIndex].fecha)} · ${duracion(sesiones[i[0].dataIndex].duracion_s)}`;
    const ejeX = { grid: { display: false }, ticks: { maxRotation: 0 } };

    grafico("g-padel-carga", {
      type: "bar",
      data: { labels: etiquetas, datasets: [{ label: "Carga", data: sesiones.map((a) => a.carga), ...estiloBarra(c.categoria["Pádel"]) }] },
      options: {
        scales: { x: ejeX, y: ejeY({ beginAtZero: true, title: { display: true, text: "HRSS" } }) },
        plugins: { legend: { display: false }, tooltip: { callbacks: { title: titulo, label: (i) => ` Carga: ${i.parsed.y} HRSS` } } },
      },
    });

    grafico("g-padel-fc", {
      type: "bar",
      data: {
        labels: etiquetas,
        datasets: [
          { label: "FC media", data: sesiones.map((a) => a.fc_media), ...estiloBarra(c.serie[0]) },
          { label: "FC máxima", data: sesiones.map((a) => a.fc_max), ...estiloBarra(c.serie[1]) },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: { x: ejeX, y: ejeY({ beginAtZero: true, title: { display: true, text: "ppm" } }) },
        plugins: { tooltip: { callbacks: { title: titulo, label: (i) => ` ${i.dataset.label}: ${i.parsed.y} ppm` } } },
      },
    });

    const zonas = [0, 1, 2, 3, 4, 5, 6].map((z) => suma(sesiones, (a) => a.zonas_s[z]) / 60);
    const total = zonas.reduce((a, b) => a + b, 0) || 1;
    grafico("g-padel-zonas", {
      type: "bar",
      data: {
        labels: zonas.map((_, z) => `Z${z + 1}`),
        datasets: [{
          label: "Minutos", data: zonas, backgroundColor: c.rampa,
          borderRadius: { topRight: 4, bottomRight: 4 }, borderSkipped: "left", maxBarThickness: 22,
        }],
      },
      options: {
        indexAxis: "y",
        scales: {
          x: ejeY({ beginAtZero: true, title: { display: true, text: "minutos" } }),
          y: { grid: { display: false }, border: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (i) => ` ${numero(i.parsed.x)} min · ${numero((i.parsed.x / total) * 100)}% del tiempo` } },
        },
      },
    });
  }

  Tablero.secciones.padel = { render };
})();
