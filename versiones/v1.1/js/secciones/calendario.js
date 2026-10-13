// Vista Calendario: el mes completo, día por día, con los datos diarios (sueño, FC en
// reposo, pasos) y los entrenamientos de cada día. Al tocar un entrenamiento se abre su detalle.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { escapar } = Tablero.componentes;
  const { VAR_GRUPO } = Tablero.graficos;
  const { numero, duracion, ts, sumarDias, lunesDe, suma, MESES_LARGOS: MESES, hoyLocal, sumarMes, ultimoDiaMes: ultimoDia } = Tablero.formato;

  const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const svg = (d) => `<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONOS = {
    sueno: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    fc: svg('<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>'),
    pasos: svg('<path d="M8 16c-2 0-3-2-3-5s1-6 3-6 3 3 3 6-1 5-3 5zM6 18h4v2a2 2 0 0 1-4 0zM16 12c-2 0-3-2-3-5s1-4 3-4 3 2 3 4-1 5-3 5zM14 14h4v2a2 2 0 0 1-4 0z"/>'),
  };
  const DIARIOS = [
    { clave: "sueno", nombre: "Sueño" },
    { clave: "fc", nombre: "FC en reposo" },
    { clave: "pasos", nombre: "Pasos" },
  ];

  const estado = { mes: null, ctx: null, enlazado: false };

  /** Número de semana ISO (lunes a domingo), como en Intervals. */
  function semanaIso(f) {
    const d = new Date(ts(f));
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + 3);   // jueves de esa semana
    const enero4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    return 1 + Math.round(((d - enero4) / 86400000 - 3 + ((enero4.getUTCDay() + 6) % 7)) / 7);
  }
  /** 7.47 → "7h28" */
  const horasMin = (h) => `${Math.floor(h)}h${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

  function render(ctx) {
    estado.ctx = ctx;
    const limites = { min: ctx.meta.desde.slice(0, 7), max: [ctx.meta.hasta, hoyLocal()].sort()[1].slice(0, 7) };
    estado.limites = limites;
    if (!estado.mes) estado.mes = ctx.meta.hasta.slice(0, 7);
    if (!estado.enlazado) enlazar();
    dibujar();
  }

  function enlazar() {
    estado.enlazado = true;
    const mover = (n) => { estado.mes = sumarMes(estado.mes, n); dibujar(); };
    document.getElementById("mes-anterior").onclick = () => mover(-1);
    document.getElementById("mes-siguiente").onclick = () => mover(1);
    document.getElementById("mes-actual").onclick = () => { estado.mes = estado.limites.max; dibujar(); };

    const dialogo = document.getElementById("dialogo-sesion");
    document.getElementById("dialogo-cerrar").onclick = () => dialogo.close();
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });   // clic en el fondo
    document.getElementById("calmes").addEventListener("click", (e) => {
      const b = e.target.closest(".act");
      if (!b) return;
      const a = estado.ctx.todo.actividades.find((x) => x.id === b.dataset.id);
      document.getElementById("dialogo-cuerpo").innerHTML = Tablero.sesiones.detalle(a);
      dialogo.showModal();
      Tablero.sesiones.montarMinutos(document.getElementById("dialogo-cuerpo"), a);
    });
  }

  function dibujar() {
    const ctx = estado.ctx;
    const { mes, limites } = estado;
    const [anio, m] = mes.split("-").map(Number);
    document.getElementById("mes-titulo").textContent = `${MESES[m - 1]} ${anio}`;
    document.getElementById("mes-anterior").disabled = mes <= limites.min;
    document.getElementById("mes-siguiente").disabled = mes >= limites.max;
    document.getElementById("mes-actual").disabled = mes === limites.max;

    const diarios = DIARIOS.filter((d) => ctx.filtros.bienestar.has(d.clave));
    document.getElementById("cal-leyenda-dia").innerHTML =
      diarios.map((d) => `<span>${ICONOS[d.clave]}${d.nombre}</span>`).join("");

    const bienestar = new Map(ctx.todo.bienestar.map((d) => [d.fecha, d]));
    const actPorDia = new Map();
    for (const a of ctx.todo.actividades.filter((x) => ctx.visible(x))) {
      if (!actPorDia.has(a.fecha)) actPorDia.set(a.fecha, []);
      actPorDia.get(a.fecha).push(a);
    }
    const hoy = hoyLocal();

    const celdas = ['<div class="cal-nombre-dia">Semana</div>', ...DIAS.map((d) => `<div class="cal-nombre-dia">${d}</div>`)];
    const inicio = lunesDe(`${mes}-01`);
    const fin = ultimoDia(mes);
    for (let lunes = inicio; lunes <= fin; lunes = sumarDias(lunes, 7)) {
      celdas.push(celdaSemana(lunes, actPorDia, bienestar));
      for (let i = 0; i < 7; i++) {
        const f = sumarDias(lunes, i);
        celdas.push(celdaDia(f, i, f.slice(0, 7) !== mes, f === hoy, bienestar.get(f), actPorDia.get(f) ?? [], diarios));
      }
    }
    document.getElementById("calmes").innerHTML = celdas.join("");
  }

  function celdaSemana(lunes, actPorDia, bienestar) {
    const dias = [0, 1, 2, 3, 4, 5, 6].map((i) => sumarDias(lunes, i));
    const acts = dias.flatMap((f) => actPorDia.get(f) ?? []);
    const ultimo = [...dias].reverse().map((f) => bienestar.get(f)).find((d) => d?.ctl != null);
    const km = suma(acts, (a) => a.distancia_m) / 1000;
    const filas = [
      ["Sesiones", acts.length],
      ["Tiempo", acts.length ? duracion(suma(acts, (a) => a.duracion_s)) : "—"],
      ["Distancia", km ? `${numero(km, 1)} km` : "—"],
      ["Carga", acts.length ? numero(suma(acts, (a) => a.carga)) : "—"],
      ["Fitness", ultimo ? numero(ultimo.ctl) : "—"],
      ["Fatiga", ultimo ? numero(ultimo.atl) : "—"],
    ];
    return `<div class="sem">
      <div class="sem-titulo">Sem. ${semanaIso(lunes)}</div>
      <dl>${filas.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    </div>`;
  }

  function celdaDia(f, diaSemana, otroMes, esHoy, b, acts, diarios) {
    const dia = Number(f.slice(8, 10));
    const numeroDia = dia === 1 ? `1 ${MESES[Number(f.slice(5, 7)) - 1].slice(0, 3).toLowerCase()}` : dia;
    const datos = [];
    if (b) {
      for (const d of diarios) {
        if (d.clave === "sueno" && b.sueno_horas != null) {
          datos.push(`<span title="Sueño: ${horasMin(b.sueno_horas)}${b.sueno_puntaje != null ? ` · puntaje ${b.sueno_puntaje}` : ""}">${ICONOS.sueno}${horasMin(b.sueno_horas)}${b.sueno_puntaje != null ? ` <small>${b.sueno_puntaje}</small>` : ""}</span>`);
        }
        if (d.clave === "fc" && b.fc_reposo != null) {
          datos.push(`<span title="FC en reposo: ${b.fc_reposo} ppm">${ICONOS.fc}${b.fc_reposo}</span>`);
        }
        if (d.clave === "pasos" && b.pasos != null) {
          datos.push(`<span title="Pasos: ${numero(b.pasos)}">${ICONOS.pasos}${numero(b.pasos)}</span>`);
        }
      }
    }
    const entrenamientos = acts.map((a) => {
      const nombre = Tablero.sesiones.nombreSesion(a);
      return `<button type="button" class="act" data-id="${escapar(a.id)}" style="--color-cat:${VAR_GRUPO[Tablero.graficos.grupoDe(a)]}"
        title="${escapar(nombre)} · ${duracion(a.duracion_s)} — tocá para ver el detalle">
        <span class="act-nombre">${escapar(nombre)}</span><small>${duracion(a.duracion_s)}</small></button>`;
    }).join("");
    const clases = ["dia", otroMes && "otro-mes", esHoy && "hoy"].filter(Boolean).join(" ");
    return `<div class="${clases}">
      <div class="dia-num">${numeroDia}<span class="dia-sem">${DIAS[diaSemana]}</span></div>
      ${datos.length ? `<div class="dia-bienestar">${datos.join("")}</div>` : ""}
      ${entrenamientos}
    </div>`;
  }

  Tablero.secciones.calendario = { render, DIARIOS };
})();
