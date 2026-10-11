// Punto de entrada: toma los datos de data/datos.js, maneja la navegación lateral, los
// filtros y el período, y dibuja la vista activa.
(() => {
  const Tablero = (window.Tablero ??= { secciones: {} });

  const { aplicarEstiloGlobal, destruirTodos, GRUPOS, VAR_GRUPO, grupoDe } = Tablero.graficos;
  const { iniciarTema } = Tablero.tema;
  const { escapar } = Tablero.componentes;
  const { sumarDias, fechaLarga, ts } = Tablero.formato;
  const S = Tablero.secciones;

  const SECCIONES = {
    inicio: S.inicio, calendario: S.calendario, resumen: S.resumen, carrera: S.carrera, padel: S.padel,
    ciclismo: S.ciclismo, otras: S.otras, recuperacion: S.recuperacion, datos: S.datos,
  };
  const TITULOS = {
    inicio: "Este mes", calendario: "Calendario", resumen: "Resumen", carrera: "Carrera", padel: "Pádel",
    ciclismo: "Ciclismo", otras: "Otras actividades", recuperacion: "Recuperación", datos: "Datos",
  };
  const CON_FILTROS = ["inicio", "calendario", "resumen"];   // vistas a las que aplican los filtros laterales
  const SIN_PERIODO = ["inicio", "calendario", "datos"];     // esas vistas navegan por mes; los datos crudos no se filtran
  const PERIODOS = { 4: "4 semanas", 12: "12 semanas", todo: "todo el historial" };

  const estado = {
    pestana: "inicio",
    periodo: "12",
    datos: null,
    filtros: { grupos: new Set(GRUPOS), bienestar: new Set(S.calendario.DIARIOS.map((d) => d.clave)) },
  };

  // ─── Filtros (se recuerdan en este navegador) ──────────────────────────────

  function leerFiltros() {
    try {
      const f = JSON.parse(localStorage.getItem("filtros") ?? "null");
      if (f?.grupos) estado.filtros.grupos = new Set(f.grupos.filter((g) => GRUPOS.includes(g)));
      if (f?.bienestar) estado.filtros.bienestar = new Set(f.bienestar);
    } catch { /* sin almacenamiento o dato corrupto: se usan los valores por defecto */ }
  }

  function guardarFiltros() {
    try {
      localStorage.setItem("filtros", JSON.stringify({
        grupos: [...estado.filtros.grupos], bienestar: [...estado.filtros.bienestar],
      }));
    } catch { /* sin almacenamiento: vale solo para esta visita */ }
  }

  function armarFiltros() {
    const cuenta = {};
    for (const a of estado.datos.actividades) cuenta[grupoDe(a)] = (cuenta[grupoDe(a)] ?? 0) + 1;
    const check = (tipo, valor, texto, extra = "") => `
      <label class="check">
        <input type="checkbox" data-tipo="${tipo}" value="${escapar(valor)}"${estado.filtros[tipo].has(valor) ? " checked" : ""}>
        ${extra}<span>${escapar(texto)}</span>${tipo === "grupos" ? `<span class="cuenta">${cuenta[valor] ?? 0}</span>` : ""}
      </label>`;
    document.getElementById("filtro-categorias").innerHTML = GRUPOS
      .filter((g) => cuenta[g])
      .map((g) => check("grupos", g, g, `<span class="muestra" style="background:${VAR_GRUPO[g]}"></span>`)).join("");
    document.getElementById("filtro-bienestar").innerHTML = S.calendario.DIARIOS
      .map((d) => check("bienestar", d.clave, d.nombre)).join("");
    document.getElementById("filtros-lateral").addEventListener("change", (e) => {
      const c = e.target;
      if (!c.dataset.tipo) return;
      const conjunto = estado.filtros[c.dataset.tipo];
      if (c.checked) conjunto.add(c.value); else conjunto.delete(c.value);
      guardarFiltros();
      dibujar();
    });
  }

  // ─── Contexto de cada vista ────────────────────────────────────────────────

  /** Rango de fechas del período elegido, el período anterior de igual largo y los filtros. */
  function contexto() {
    const { meta, actividades, semanas, bienestar } = estado.datos;
    const hasta = meta.hasta;
    let desde = meta.desde;
    let anterior = null;
    if (estado.periodo !== "todo") {
      const dias = Number(estado.periodo) * 7;
      desde = sumarDias(hasta, -(dias - 1));
      if (desde < meta.desde) desde = meta.desde;
      else anterior = { desde: sumarDias(desde, -dias), hasta: sumarDias(desde, -1) };
    }
    const enRango = (f, r = { desde, hasta }) => f >= r.desde && f <= r.hasta;
    const aplicaFiltro = CON_FILTROS.includes(estado.pestana);
    const visible = (a) => !aplicaFiltro || estado.filtros.grupos.has(grupoDe(a));
    return {
      meta, desde, hasta, anterior, enRango, visible,
      filtros: estado.filtros,
      gruposVisibles: aplicaFiltro ? estado.filtros.grupos : new Set(GRUPOS),
      etiquetaPeriodo: PERIODOS[estado.periodo],
      actividades: actividades.filter((a) => enRango(a.fecha) && visible(a)),
      actividadesAnteriores: anterior ? actividades.filter((a) => enRango(a.fecha, anterior) && visible(a)) : null,
      bienestar: bienestar.filter((d) => enRango(d.fecha)),
      semanas: semanas.filter((s) => sumarDias(s.inicio, 6) >= desde && s.inicio <= hasta),
      todo: estado.datos,
    };
  }

  function dibujar() {
    destruirTodos();
    aplicarEstiloGlobal();
    const ctx = contexto();
    document.getElementById("filtro-rango").textContent = `${fechaLarga(ctx.desde)} → ${fechaLarga(ctx.hasta)}`;
    const aviso = document.getElementById("error-render");
    aviso.hidden = true;
    try {
      SECCIONES[estado.pestana].render(ctx);
    } catch (e) {
      // Sin esto, un error deja los gráficos en blanco sin ninguna pista
      console.error(e);
      mostrarError(e.message);
    }
  }

  function mostrarPestana(nombre) {
    if (!SECCIONES[nombre]) nombre = "inicio";
    estado.pestana = nombre;
    document.body.dataset.vista = nombre;
    for (const b of document.querySelectorAll("[data-pestana]")) {
      if (b.dataset.pestana === nombre) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    }
    for (const s of document.querySelectorAll(".seccion")) s.hidden = s.id !== `panel-${nombre}`;
    document.getElementById("titulo-vista").textContent = TITULOS[nombre];
    document.getElementById("filtro").hidden = SIN_PERIODO.includes(nombre);
    document.getElementById("filtros-lateral").hidden = !CON_FILTROS.includes(nombre);
    document.getElementById("grupo-bienestar").hidden = nombre !== "calendario";
    cerrarMenu();
    scrollTo(0, 0);
    dibujar();
  }

  function marcarPeriodo() {
    for (const b of document.querySelectorAll("[data-periodo]")) {
      b.setAttribute("aria-pressed", String(b.dataset.periodo === estado.periodo));
    }
  }

  function mostrarError(mensaje) {
    const aviso = document.getElementById("error-render");
    aviso.textContent = `Hubo un error al dibujar esta vista: ${mensaje}`;
    aviso.hidden = false;
  }

  // Errores fuera del try/catch de dibujar(). Solo se avisan los de los archivos del
  // tablero: las extensiones del navegador inyectan sus propios scripts y sus errores
  // llegan como "Script error." sin archivo; esos van a la consola y no al aviso.
  const BASE = location.href.replace(/[#?].*$/, "").replace(/[^/]*$/, "");
  addEventListener("error", (e) => {
    if (e.filename && e.filename.startsWith(BASE)) mostrarError(e.message);
    else console.warn("Error ajeno al tablero (extensión del navegador?):", e.message, e.filename || "(sin archivo)");
  });

  // ─── Menú lateral en celular ───────────────────────────────────────────────

  function abrirMenu() {
    document.getElementById("lateral").classList.add("abierta");
    document.getElementById("fondo-lateral").classList.add("visible");
    document.getElementById("boton-menu").setAttribute("aria-expanded", "true");
  }
  function cerrarMenu() {
    document.getElementById("lateral").classList.remove("abierta");
    document.getElementById("fondo-lateral").classList.remove("visible");
    document.getElementById("boton-menu").setAttribute("aria-expanded", "false");
  }

  function iniciar() {
    // data/datos.js se carga con <script> (no con fetch) para que el tablero también
    // funcione abriendo index.html directo, sin servidor
    if (!window.DATOS_TABLERO) {
      document.getElementById("actualizado").textContent =
        "No se encontraron los datos. Corré: python scripts/generar_datos_app.py";
      return;
    }
    estado.datos = window.DATOS_TABLERO;
    const { meta } = estado.datos;
    const [fecha, hora] = meta.generado.split(" ");
    document.getElementById("actualizado").textContent =
      `Datos del ${fechaLarga(meta.desde)} al ${fechaLarga(meta.hasta)} · actualizado ${fechaLarga(fecha)} ${hora.slice(0, 5)}`;

    // Con menos de 12 semanas de historial, "12 semanas" y "todo" son lo mismo: arrancar en 4
    const semanasHistorial = (ts(meta.hasta) - ts(meta.desde)) / (7 * 86400000);
    if (semanasHistorial < 12) estado.periodo = "4";

    leerFiltros();
    armarFiltros();

    document.querySelectorAll("[data-pestana]").forEach((b) =>
      b.addEventListener("click", () => {
        if (location.hash.slice(1) === b.dataset.pestana) cerrarMenu();
        else location.hash = b.dataset.pestana;
      }));
    document.querySelectorAll("[data-periodo]").forEach((b) =>
      b.addEventListener("click", () => { estado.periodo = b.dataset.periodo; marcarPeriodo(); dibujar(); }));
    addEventListener("hashchange", () => mostrarPestana(location.hash.slice(1)));

    document.getElementById("boton-menu").addEventListener("click", abrirMenu);
    document.getElementById("fondo-lateral").addEventListener("click", cerrarMenu);
    addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });

    iniciarTema(dibujar);
    marcarPeriodo();
    mostrarPestana(location.hash.slice(1));
  }

  iniciar();
})();
