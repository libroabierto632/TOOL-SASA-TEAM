
// =====================================
// NAVEGACIÓN PRINCIPAL
// Usa: .main-tab + data-target + .main-section (id)
// =====================================

document.addEventListener("DOMContentLoaded", function () {

  const buttons = document.querySelectorAll(".main-tab");
  const sections = document.querySelectorAll(".main-section");

  function showSection(id) {
    sections.forEach(sec => {
      sec.style.display = "none";
      sec.classList.remove("active");
    });

    buttons.forEach(btn => btn.classList.remove("active"));

    const target = document.getElementById(id);
    if (!target) {
      console.warn("No existe sección con id:", id);
      return;
    }

   target.style.display = "block";

setTimeout(() => {
  target.classList.add("active");
}, 10);

    const activeBtn = document.querySelector(`.main-tab[data-target="${id}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    if (id === "tarifas") {
      setTimeout(renderTablasTarifas, 50);
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      showSection(targetId);
    });
  });

  if (buttons.length > 0) {
    showSection(buttons[0].getAttribute("data-target"));
  }

});
 

// =====================================

// UTIL

// =====================================

function eur(n){

  return (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + " €";

}

 

// =====================================

// TABLAS TARIFAS VIGENTES ASISA

// Requiere en HTML:

// tbody#tablaTarifasBaseBody

// tbody#tablaDescuentosBody

// =====================================

function renderTablasTarifas(){

  const bodyBase = document.getElementById("tablaTarifasBaseBody");

  const bodyDesc = document.getElementById("tablaDescuentosBody");

 

  if(!bodyBase || !bodyDesc){

    console.warn("⚠️ No encuentro tablaTarifasBaseBody o tablaDescuentosBody en el HTML.");

    return;

  }

 

  const sinDental = {

    "0-44": 58.16,

    "45-59": 59.27,

    "60-64": 63.81,

    "65-69": 116.56,

    "70+": 136.77

  };

  const conDental = {

    "0-44": 63.18,

    "45-59": 64.39,

    "60-64": 69.32,

    "65-69": 120.47,

    "70+": 141.35

  };

 

  const tramos = ["0-44","45-59","60-64","65-69","70+"];

 

  bodyBase.innerHTML = "";

  bodyDesc.innerHTML = "";

 

  // Tabla base

  tramos.forEach(t => {

    const sdM = sinDental[t];

    const cdM = conDental[t];

    const sdA = sdM * 12;

    const cdA = cdM * 12;

 

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td><strong>${t}</strong></td>

      <td>${eur(sdM)}</td>

      <td>${eur(sdA)}</td>

      <td>${eur(cdM)}</td>

      <td>${eur(cdA)}</td>

    `;

    bodyBase.appendChild(tr);

  });

 

  // Tabla descuentos (2026 20%, 2027 15%, 2028 10%)

  const d2026 = 0.20; // promoción 2026 (si contrata antes del 31/03)

  const d2027 = 0.15;

  const d2028 = 0.10;

 

  tramos.forEach(t => {

    // Sin dental

    {

      const base = sinDental[t];

      const tr = document.createElement("tr");

      tr.innerHTML = `

        <td><strong>${t}</strong></td>

        <td>Sin dental</td>

        <td>${eur(base)}</td>

        <td>${eur(base * (1 - d2026))}</td>

        <td>${eur(base * (1 - d2027))}</td>

        <td>${eur(base * (1 - d2028))}</td>

      `;

      bodyDesc.appendChild(tr);

    }

 

    // Con dental

    {

      const base = conDental[t];

      const tr = document.createElement("tr");

      tr.innerHTML = `

        <td><strong>${t}</strong></td>

        <td>Con dental</td>

        <td>${eur(base)}</td>

        <td>${eur(base * (1 - d2026))}</td>

        <td>${eur(base * (1 - d2027))}</td>

        <td>${eur(base * (1 - d2028))}</td>

      `;

      bodyDesc.appendChild(tr);

    }

  });

}

 

document.addEventListener("DOMContentLoaded", () => {

  renderTablasTarifas();

});

 

// =====================================

// COTIZADOR ASISA EMPRESAS 2026

// Requiere en HTML (IDs exactos):

// - #asisaEmpresaNombre, #asisaEmpresaCif, #asisaFecha

// - #asisaDental (checkbox)

// - #asisaPromo20 (checkbox)

// - #asisaFormaPago (select: mensual|trimestral|semestral|anual)

// - #tablaAsisaCotizador (tr con data-tramo="0-44"... y input.numAsegurados)

// - spans: #asisaTotalMensual #asisaTotalAnual #asisaConsorcioMensual #asisaConsorcioAnual #asisaBeneficioFiscal

// - botones: #btnCalcularAsisa #btnImprimirAsisa

// =====================================

const tarifasAsisa = {

  sinDental: { "0-44": 58.16, "45-59": 59.27, "60-64": 63.81, "65-69": 116.56, "70+": 136.77 },

  conDental: { "0-44": 63.18, "45-59": 64.39, "60-64": 69.32, "65-69": 120.47, "70+": 141.35 }

};

 

const descuentoFormaPago = {

  mensual: 0,

  trimestral: 0.02,

  semestral: 0.04,

  anual: 0.06

};

 

function calcularCotizacionAsisa(){

  const dental = document.getElementById("asisaDental")?.checked || false;

  const promo20 = document.getElementById("asisaPromo20")?.checked || false;

  const formaPago = document.getElementById("asisaFormaPago")?.value || "mensual";

 

  const tabla = document.getElementById("tablaAsisaCotizador");

  if(!tabla){

    console.warn("⚠️ No encuentro #tablaAsisaCotizador");

    return;

  }

 

  const tarifas = dental ? tarifasAsisa.conDental : tarifasAsisa.sinDental;

 

  let totalMensualBase = 0;

 

  tabla.querySelectorAll("tbody tr").forEach(tr => {

    const tramo = tr.getAttribute("data-tramo");

    const n = parseInt(tr.querySelector("input.numAsegurados")?.value || "0", 10) || 0;

    const precio = tarifas[tramo] || 0;

 

    const mensual = n * precio;

    const anual = mensual * 12;

 

    const celM = tr.querySelector(".primaMensual");

    const celA = tr.querySelector(".primaAnual");

 

    if(celM) celM.textContent = eur(mensual);

    if(celA) celA.textContent = eur(anual);

 

    totalMensualBase += mensual;

  });

 

  // 1) descuento promoción 20% (2026, si contrata antes del 31/03)

  let totalMensual = promo20 ? totalMensualBase * (1 - 0.20) : totalMensualBase;

 

  // 2) descuento por forma de pago

  const dFP = descuentoFormaPago[formaPago] || 0;

  totalMensual = totalMensual * (1 - dFP);

 

  const totalAnual = totalMensual * 12;

 

  // Consorcio 0,15% sobre prima (mostrado aparte)

  const consorcioAnual = totalAnual * 0.0015;

  const consorcioMensual = consorcioAnual / 12;

 

  // Beneficio fiscal estimado (tope IRPF 500€/asegurado/año) -> estimación

  const totalAsegurados = Array.from(tabla.querySelectorAll("input.numAsegurados"))

    .reduce((acc, el) => acc + (parseInt(el.value || "0", 10) || 0), 0);

 

  const exentoMax = totalAsegurados * 500;

  const beneficioFiscalEstimado = Math.min(totalAnual, exentoMax);

 

  // Pintar resultados

  const setTxt = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };

 

  setTxt("asisaTotalMensual", eur(totalMensual));

  setTxt("asisaTotalAnual", eur(totalAnual));

  setTxt("asisaConsorcioMensual", eur(consorcioMensual));

  setTxt("asisaConsorcioAnual", eur(consorcioAnual));

  setTxt("asisaBeneficioFiscal", eur(beneficioFiscalEstimado));

}

 

function imprimirCotizacionAsisa(){

  const bloque = document.getElementById("asisaPresupuestoImprimible");
if(!bloque){
  console.warn("⚠️ No encuentro #asisaPresupuestoImprimible");
  return;
}

document.getElementById("asisaPresupuestoImprimible").style.display = "block";
 

  const win = window.open("", "_blank", "width=900,height=700");

  win.document.write(`

    <html lang="es">

      <head>

        <meta charset="UTF-8" />

        <title>Presupuesto ASISA Empresas</title>

        <style>

          body{ font-family: Arial, sans-serif; padding: 20px; }

          h1,h2{ margin: 0 0 10px; }

          table{ width:100%; border-collapse: collapse; margin-top: 10px; }

          th,td{ border:1px solid #ccc; padding:8px; text-align:center; }

          th{ background:#0b4aa2; color:#fff; }

          .azul{ color:#0b4aa2; font-weight:700; }

          .verde{ color:#0a7a2a; font-weight:700; }

          .rojo{ color:#b30000; font-weight:700; }
          @media print{

            *{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          }
          .nota{ font-size:12px; color:#333; margin-top:10px; }
.aviso-presupuesto{
background:#ffe3e3;
border:2px solid #c62828;
color:#7a0000;
font-weight:700;
padding:12px;
margin:15px 0;
border-radius:8px;
text-align:center;
}

        </style>



      </head>

      <body>

        ${bloque.innerHTML}

      </body>

    </html>

  `);

  win.document.close();

  win.focus();

  win.print();

}

 

// Conectar botones si existen
const btnCalc = document.getElementById("btnCalcularAsisa");
const btnPrint = document.getElementById("btnImprimirAsisa");

if (btnCalc) btnCalc.addEventListener("click", calcularCotizacionAsisa);
if (btnPrint) btnPrint.addEventListener("click", imprimirCotizacionAsisa);

// Rellenar bloque imprimible antes de imprimir
function prepararImpresionAsisa(){

  const nombre = document.getElementById("asisaEmpresaNombre")?.value || "";

  const cif = document.getElementById("asisaEmpresaCif")?.value || "";

  const fecha = document.getElementById("asisaFecha")?.value || "";

 

  const tabla = document.getElementById("tablaAsisaCotizador");

  const printTabla = document.getElementById("printTabla");

 

  if(printTabla && tabla){

    // Clon limpio de la tabla (sin inputs)

    let html = `<table style="width:100%;border-collapse:collapse;">

      <thead>

        <tr>

          <th style="border:1px solid #ccc;padding:8px;background:#0b4aa2;color:#fff;">Tramo</th>

          <th style="border:1px solid #ccc;padding:8px;background:#0b4aa2;color:#fff;">Asegurados</th>

          <th style="border:1px solid #ccc;padding:8px;background:#0b4aa2;color:#fff;">Mensual</th>

          <th style="border:1px solid #ccc;padding:8px;background:#0b4aa2;color:#fff;">Anual</th>

        </tr>

      </thead><tbody>`;

 

    tabla.querySelectorAll("tbody tr").forEach(tr => {

      const tramo = tr.getAttribute("data-tramo") || "";

      const n = tr.querySelector("input.numAsegurados")?.value || "0";

      const m = tr.querySelector(".primaMensual")?.textContent || "0,00 €";

      const a = tr.querySelector(".primaAnual")?.textContent || "0,00 €";

 

      html += `<tr>

        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${tramo}</td>

        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${n}</td>

        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${m}</td>

        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${a}</td>

      </tr>`;

    });

 

    html += `</tbody></table>`;

    printTabla.innerHTML = html;

  }

 

  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

 

  set("printEmpresa", nombre);

  set("printCif", cif);

  set("printFecha", fecha);

 

  set("printTotalMensual", document.getElementById("asisaTotalMensual")?.textContent || "0,00 €");

  set("printTotalAnual", document.getElementById("asisaTotalAnual")?.textContent || "0,00 €");

  set("printConsorcioAnual", document.getElementById("asisaConsorcioAnual")?.textContent || "0,00 €");

  set("printBeneficioFiscal", document.getElementById("asisaBeneficioFiscal")?.textContent || "0,00 €");

 

  // Mostrar bloque para que el print lo coja

  const bloque = document.getElementById("asisaPresupuestoImprimible");

  if(bloque) bloque.style.display = "block";

}

 // Enganchar botones cotizador ASISA
document.addEventListener("DOMContentLoaded", () => {

    const btnCalc = document.getElementById("btnCalcularAsisa");
    const btnPrint = document.getElementById("btnImprimirAsisa");

    if (btnCalc) {
        btnCalc.addEventListener("click", () => {
            calcularCotizacionAsisa();

            const bloque = document.getElementById("asisaPresupuestoImprimible");
            if (bloque) bloque.style.display = "block";
        });
    }

    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
            calcularCotizacionAsisa();

            const bloque = document.getElementById("asisaPresupuestoImprimible");
            if (bloque) bloque.style.display = "block";

            prepararImpresionAsisa();
            imprimirCotizacionAsisa();
        });
    }

});
// Botón calcular cotización
document.addEventListener("DOMContentLoaded", () => {

    const btnCalc = document.getElementById("btnCalcularAsisa");

    if(btnCalc){
        btnCalc.addEventListener("click", () => {

            calcularCotizacionAsisa();

            const bloque = document.getElementById("asisaPresupuestoImprimible");

            if(bloque){
                bloque.style.display = "block";
            }

        });
    }

});


// ==============================

// FIX SUBTABS IMPAGO (FORZADO)

// ==============================

document.addEventListener("DOMContentLoaded", () => {

  const impagoSection = document.getElementById("impago");

  if (!impagoSection) return;

 

  const tabsWrap = impagoSection.querySelector(".subtabs");

  if (!tabsWrap) return;

 

  tabsWrap.addEventListener("click", (e) => {

    const btn = e.target.closest("button[data-subtab]");

    if (!btn) return;

 

    // Quitar active a botones

    tabsWrap.querySelectorAll("button[data-subtab]").forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

 

    // Ocultar todos los paneles

    impagoSection.querySelectorAll(".subtab-panel").forEach(p => p.classList.remove("active"));

 

    // Mostrar el panel correcto (por ID global)

    const targetId = btn.getAttribute("data-subtab");

    const panel = document.getElementById(targetId);

    if (panel) panel.classList.add("active");

  });

 

  // Asegurar que al entrar en Impago se vea el índice

  const first = tabsWrap.querySelector('button[data-subtab="impago-indice"]') || tabsWrap.querySelector("button[data-subtab]");

  if (first) first.click();

});

// ==============================

// MINI COTIZADOR IMPAGO

// ==============================

 

function calcularMiniImpago() {

  const renta = parseFloat(document.getElementById("impRenta").value) || 0;

  const meses = parseInt(document.getElementById("impMeses").value) || 0;

  const franquicia = document.getElementById("impFranquicia").value;

 

  const resultado = document.getElementById("impRes");

 

  if (renta < 200 || renta > 3000) {

    resultado.innerHTML = "La renta debe estar entre 200€ y 3.000€.";

    return;

  }

 

  if (![12,18,24].includes(meses)) {

    resultado.innerHTML = "Selecciona 12, 18 o 24 meses.";

    return;

  }

 

  // Cobertura máxima

  const coberturaMax = renta * meses;

 

  // Si hay franquicia de 1 mes

  const coberturaEfectiva = franquicia === "con"

    ? renta * (meses - 1)

    : coberturaMax;

 

  const eur = (n) =>

    (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + " €";

 

  resultado.innerHTML = `

    Cobertura máxima: <b>${eur(coberturaMax)}</b><br>

    Cobertura efectiva ${franquicia === "con" ? "(con 1 mes franquicia)" : "(sin franquicia)"}:

    <b>${eur(coberturaEfectiva)}</b>

  `;

}

 

function resetMiniImpago() {

  document.getElementById("impRenta").value = "";

  document.getElementById("impMeses").value = "12";

  document.getElementById("impFranquicia").value = "sin";

  document.getElementById("impRes").innerHTML =

    "Introduce datos y pulsa Calcular.";

}

// ==============================

 

// SUBTABS UNIVERSALES (SALUD, CARTAS, ETC.)

 

// Compatible con:

 

// - botones: .sub-tab / .subtab

 

// - atributo: data-subtab / data-subtarget

 

// - paneles: .sub-section / .subtab-panel / article
 

// - visible: .is-visible / .active

 

// ==============================

 

(function () {

 

  function showPanel(btn, targetId) {

 

    const mainSection = btn.closest("section") || document;

 

    // 1) desactivar botones del mismo grupo

 

    const tabWrap = btn.parentElement;

 

    if (tabWrap) {

 

      tabWrap.querySelectorAll("button").forEach(b => {

 

        b.classList.remove("is-active", "active", "is-active-sub");

 

      });

 

    }

 

    btn.classList.add("is-active");

 

    // 2) ocultar paneles dentro de la misma sección

 

    mainSection.querySelectorAll(".sub-section, .subtab-panel").forEach(p => {

 

      p.classList.remove("is-visible", "active");

 

      p.style.display = "none";

 

    });

 

    // 3) mostrar el panel destino por id

 

    const panel = document.getElementById(targetId);

 

    if (!panel) {

 

      console.warn("No encuentro panel con id:", targetId);

 

      return;

 

    }

 

    panel.style.display = "block";

 

    panel.classList.add("is-visible");

 

  }

 

  // Click delegado para que funcione en cualquier sección

 

  document.addEventListener("click", (e) => {

 

    const btn = e.target.closest("button[data-subtab], button[data-subtarget]");

 

    if (!btn) return;

 

    const id = btn.getAttribute("data-subtab") || btn.getAttribute("data-subtarget");

 

    if (!id) return;

 

    showPanel(btn, id);

 

  });

 

  // Al cargar: activar el primer subtab de cada barra

 

  document.addEventListener("DOMContentLoaded", () => {

 

    document.querySelectorAll(".subnav, .subtabs").forEach(wrap => {

 

      const first = wrap.querySelector("button[data-subtab], button[data-subtarget]");

 

      if (first) {

 

        const id = first.getAttribute("data-subtab") || first.getAttribute("data-subtarget");

 

        // solo forzar si el panel existe

 

        if (id && document.getElementById(id)) showPanel(first, id);

 

      }

 

    });

 

  });

 

})();

function buscarContenido() {

let input = document.getElementById("buscador").value.toLowerCase();

let bloques = document.querySelectorAll(".card, .subtab-panel, p, li");

bloques.forEach(function(bloque){

let texto = bloque.textContent.toLowerCase();

if(texto.includes(input)){
bloque.style.display="";
}
else{
bloque.style.display="none";
}

});

}
// SUBTABS GENERICO PARA TODOS LOS MODULOS
document.addEventListener("click", function(e){

  const btn = e.target.closest(".subtab");
  if(!btn) return;

  const section = btn.closest(".main-section");
  if(!section) return;

  // activar boton
  section.querySelectorAll(".subtab").forEach(b=>{
    b.classList.remove("active");
  });

  btn.classList.add("active");

  // mostrar panel
  section.querySelectorAll(".subtab-panel").forEach(p=>{
    p.classList.remove("active");
  });

  const panel = section.querySelector("#"+btn.dataset.subtab);
  if(panel){
    panel.classList.add("active");
  }

});
// ===== SUBTABS (por módulo / section) =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".subtab");
  if (!btn) return;

  const section = btn.closest(".main-section");
  if (!section) return;

  const targetId = btn.getAttribute("data-subtab");
  if (!targetId) return;

  // Desactivar botones dentro de ESTE módulo
  section.querySelectorAll(".subtabs .subtab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  // Desactivar paneles dentro de ESTE módulo
  section.querySelectorAll(".subtab-panel").forEach(p => p.classList.remove("active"));

  // Activar panel objetivo
  const panel = section.querySelector(`#${CSS.escape(targetId)}`);
  if (panel) panel.classList.add("active");
});

// Activación inicial: por cada módulo, si hay un subtab "active", activa su panel
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".main-section").forEach(section => {
    const activeBtn = section.querySelector(".subtabs .subtab.active");
    if (!activeBtn) return;
    const targetId = activeBtn.getAttribute("data-subtab");
    if (!targetId) return;

    section.querySelectorAll(".subtab-panel").forEach(p => p.classList.remove("active"));
    const panel = section.querySelector(`#${CSS.escape(targetId)}`);
    if (panel) panel.classList.add("active");
  });
});
 
// =======================================================
// SUBTABS POR SECCIÓN (SIN IDs duplicados, con data-scope)
// =======================================================
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".subtab");
  if (!btn) return;

  const tabs = btn.closest(".subtabs");
  if (!tabs) return;

  const scope = tabs.getAttribute("data-scope");
  const target = btn.getAttribute("data-subtab");
  if (!scope || !target) return;

  // Activar botón
  tabs.querySelectorAll(".subtab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  // Buscar el contenedor de paneles del mismo scope
  const panelsWrap = document.querySelector(`.subtab-panels[data-scope="${scope}"]`);
  if (!panelsWrap) return;

  // Ocultar / mostrar paneles del mismo scope
  panelsWrap.querySelectorAll(".subtab-panel").forEach(p => p.classList.remove("active"));
  const panel = panelsWrap.querySelector(`.subtab-panel[data-panel="${target}"]`);
  if (panel) panel.classList.add("active");
});
function showSection(id) {
  const target = document.getElementById(id);

  // ✅ Si NO existe el id, no ocultes todo (así no te quedas en blanco)
  if (!target) {
    console.warn("No existe sección con id:", id);
    return;
  }

  // Ocultar todas
  sections.forEach(sec => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  // Quitar activo a todos
  buttons.forEach(btn => btn.classList.remove("active"));

  // Mostrar la correcta
  target.style.display = "block";
  target.classList.add("active");

  // Activar botón
  const activeBtn = document.querySelector(`.main-tab[data-target="${id}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  // Si entras en tarifas, repinta tablas
  if (id === "tarifas") {
    setTimeout(renderTablasTarifas, 50);
  }
}
// ==============================
// SUBTABS AISLADAS POR MÓDULO (data-scope)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".subtabs[data-scope]").forEach((wrap) => {
    const scope = wrap.getAttribute("data-scope");
    if (!scope) return;

    const panels = document.querySelectorAll(`.subtab-panel[data-scope="${scope}"]`);

    function showPanel(panelId){
      wrap.querySelectorAll("button[data-subtab]").forEach(b => b.classList.remove("active"));
      const btn = wrap.querySelector(`button[data-subtab="${panelId}"]`);
      if (btn) btn.classList.add("active");

      panels.forEach(p => p.classList.remove("active"));
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add("active");
    }

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-subtab]");
      if (!btn) return;
      showPanel(btn.getAttribute("data-subtab"));
    });

    const firstBtn = wrap.querySelector("button[data-subtab]");
    if (firstBtn) showPanel(firstBtn.getAttribute("data-subtab"));
  });
});

// ==============================
// BUSCADOR SOLO PARA HOGAR
// (resalta coincidencias en el panel activo)
// ==============================
function buscarContenidoHogar(){
  const input = document.getElementById("hogar-buscador");
  const info = document.getElementById("hogar-buscador-info");
  if (!input) return;

  const q = (input.value || "").trim();
  const hogar = document.getElementById("hogar");
  if (!hogar) return;

  // panel activo de hogar
  const panel = hogar.querySelector('.subtab-panel[data-scope="hogar"].active');
  if (!panel) return;

  // quitar resaltados anteriores
  panel.querySelectorAll("mark.__hl").forEach(m => {
    const text = document.createTextNode(m.textContent);
    m.replaceWith(text);
  });

  if (!q) {
    if (info) info.textContent = "";
    return;
  }

  // resaltar texto
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  let matches = 0;

  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue.match(regex)) return NodeFilter.FILTER_REJECT;
      // evita inputs/botones
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest("script, style, input, textarea, button, select")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(textNode => {
    const frag = document.createDocumentFragment();
    const str = textNode.nodeValue;
    let last = 0;
    str.replace(regex, (m, offset) => {
      frag.appendChild(document.createTextNode(str.slice(last, offset)));
      const mark = document.createElement("mark");
      mark.className = "__hl";
      mark.textContent = m;
      frag.appendChild(mark);
      matches++;
      last = offset + m.length;
    });
    frag.appendChild(document.createTextNode(str.slice(last)));
    textNode.replaceWith(frag);
  });

  if (info) info.textContent = matches ? `✅ Encontradas ${matches} coincidencias en esta pestaña.` : "⚠️ No hay coincidencias en esta pestaña.";
}

function buscarContenido() {
  const input = document.getElementById("buscador");
  const q = (input?.value || "").trim();
  if (!q) {
    limpiarResaltadoGlobal();
    return;
  }

  // Limpia resaltados anteriores
  limpiarResaltadoGlobal();

  // Normalizamos a minúsculas para comparar (el resaltado se hace sobre el texto real)
  const query = q.toLowerCase();

  // Buscamos en TODAS las secciones (aunque estén ocultas)
  const sections = Array.from(document.querySelectorAll(".main-section"));
  let found = null; // { sectionEl, subpanelEl }

  for (const section of sections) {
    // Buscar dentro de subpanels si existen
    const subpanels = Array.from(section.querySelectorAll(".subtab-panel"));
    if (subpanels.length) {
      for (const panel of subpanels) {
        if (contienePalabraExacta(panel, query)) {
          found = { sectionEl: section, subpanelEl: panel };
          break;
        }
      }
      if (found) break;
    } else {
      if (contienePalabraExacta(section, query)) {
        found = { sectionEl: section, subpanelEl: null };
        break;
      }
    }
  }

  // Si no encuentra nada, no hacemos nada (puedes poner un mensaje si quieres)
  if (!found) return;

  // 1) Activar la pestaña principal donde está el resultado
  activarMainSection(found.sectionEl.id);

  // 2) Si está dentro de un subpanel, lo activamos
  if (found.subpanelEl) {
    activarSubtab(found.sectionEl, found.subpanelEl.id);
  }

  // 3) Resaltar SOLO en lo que queda visible (sección activa + subpanel activo si existe)
  const visibleScope =
    found.subpanelEl ||
    found.sectionEl;

  const matches = resaltarPalabraExacta(visibleScope, query);

  // 4) Si hay coincidencias, hacemos scroll a la primera
  if (matches && matches.length) {
    matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* =========================
   Helpers
========================= */

function limpiarResaltadoGlobal() {
  document.querySelectorAll("mark.__hl").forEach((m) => {
    m.replaceWith(document.createTextNode(m.textContent));
  });
}

// Comprueba si existe la palabra exacta (sin resaltar todavía)
function contienePalabraExacta(root, queryLower) {
  const text = (root.innerText || "").toLowerCase();
  return matchExactWord(text, queryLower);
}

// Resalta la palabra exacta dentro de un root. Devuelve array de <mark>
function resaltarPalabraExacta(root, queryLower) {
  const marks = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = node.parentNode && node.parentNode.nodeName;
      if (p === "SCRIPT" || p === "STYLE") return NodeFilter.FILTER_REJECT;
      // Evitar resaltar dentro de inputs/botones
      if (p === "INPUT" || p === "TEXTAREA" || p === "BUTTON") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((textNode) => {
    const original = textNode.nodeValue;
    const lower = original.toLowerCase();

    // Buscamos índices de palabra exacta dentro de ESTE nodo
    const hit = findExactWordIndex(lower, queryLower);
    if (hit === -1) return;

    // Partimos: antes + match + después (solo el primer match por nodo para no liarla)
    const before = original.slice(0, hit);
    const match = original.slice(hit, hit + queryLower.length);
    const after  = original.slice(hit + queryLower.length);

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));

    const mark = document.createElement("mark");
    mark.className = "__hl";
    mark.textContent = match;
    frag.appendChild(mark);
    marks.push(mark);

    if (after) frag.appendChild(document.createTextNode(after));

    textNode.replaceWith(frag);
  });

  return marks;
}

/**
 * Matching por palabra exacta:
 * - Ignora mayúsculas/minúsculas (ya trabajamos con lower)
 * - NO permite que el término sea parte de otra palabra
 *   Ej: "salud" no coincide con "saludable"
 */
function matchExactWord(textLower, queryLower) {
  return findExactWordIndex(textLower, queryLower) !== -1;
}

// Devuelve el índice donde empieza la palabra exacta, o -1
function findExactWordIndex(textLower, queryLower) {
  // Buscamos todas las apariciones y verificamos límites de palabra manualmente
  let idx = 0;
  while (true) {
    const found = textLower.indexOf(queryLower, idx);
    if (found === -1) return -1;

    const before = found - 1;
    const after = found + queryLower.length;

    const beforeChar = before >= 0 ? textLower[before] : "";
    const afterChar  = after < textLower.length ? textLower[after] : "";

    // “caracter de palabra” = letras/números/guion bajo y también letras con acento
    const isWordChar = (ch) => !!ch && /[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]/.test(ch);

    const okBefore = !isWordChar(beforeChar);
    const okAfter  = !isWordChar(afterChar);

    if (okBefore && okAfter) return found;

    idx = found + queryLower.length;
  }
}

// Activa pestaña principal (según tu sistema de data-target)
function activarMainSection(sectionId) {
  const btn = document.querySelector(`.main-tab[data-target="${sectionId}"]`);
  if (btn) btn.click();
}

// Activa subtab dentro de una sección (data-subtab = id del panel)
function activarSubtab(sectionEl, panelId) {
  const btn = sectionEl.querySelector(`.subtab[data-subtab="${panelId}"]`);
  if (btn) btn.click();
}
// ============================
// DOSSIER CON CHECKBOX
// Imprime las secciones seleccionadas
// Requiere: .main-section con id + h1 dentro (ideal)
// ============================

(function initDossierCheckbox(){
  document.addEventListener("DOMContentLoaded", () => {
    const btnOpen = document.getElementById("btnDossier");
    const modal = document.getElementById("dossierModal");
    const btnClose = document.getElementById("dossierClose");
    const btnCancel = document.getElementById("dossierCancel");
    const btnAll = document.getElementById("dossierAll");
    const btnNone = document.getElementById("dossierNone");
    const btnPrint = document.getElementById("dossierPrint");
    const list = document.getElementById("dossierList");

    if(!btnOpen || !modal || !list) return;

    // Detecta secciones "producto" (todas las main-section)
    const sections = Array.from(document.querySelectorAll(".main-section"))
      .filter(sec => sec.id && sec.id.trim().length > 0);

    // Genera lista checkbox
    function buildList(){
      list.innerHTML = "";
      sections.forEach(sec => {
        const title = (sec.querySelector("h1")?.innerText || sec.id).trim();
        const hint = (sec.querySelector("p")?.innerText || "").trim().slice(0, 90);

        const row = document.createElement("div");
        row.className = "dossier-item";
        row.innerHTML = `
          <input type="checkbox" class="dossier-check" data-sec="${sec.id}" checked>
          <div>
            <strong>${escapeHTML(title)}</strong>
            ${hint ? `<small>${escapeHTML(hint)}${hint.length>=90 ? "…" : ""}</small>` : `<small>ID: ${escapeHTML(sec.id)}</small>`}
          </div>
        `;
        list.appendChild(row);
      });
    }

    function openModal(){
      buildList();
      modal.classList.add("open");
      modal.setAttribute("aria-hidden","false");
    }
    function closeModal(){
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden","true");
    }

    btnOpen.addEventListener("click", openModal);
    btnClose?.addEventListener("click", closeModal);
    btnCancel?.addEventListener("click", closeModal);

    // Cerrar si clicas fuera de la tarjeta
    modal.addEventListener("click", (e) => {
      if(e.target === modal) closeModal();
    });

    btnAll?.addEventListener("click", () => {
      list.querySelectorAll(".dossier-check").forEach(c => c.checked = true);
    });
    btnNone?.addEventListener("click", () => {
      list.querySelectorAll(".dossier-check").forEach(c => c.checked = false);
    });

    btnPrint?.addEventListener("click", () => {
      const selectedIds = Array.from(list.querySelectorAll(".dossier-check"))
        .filter(c => c.checked)
        .map(c => c.getAttribute("data-sec"))
        .filter(Boolean);

      if(selectedIds.length === 0){
        alert("Selecciona al menos 1 producto para imprimir.");
        return;
      }

      imprimirDossierSeleccionado(selectedIds);
      closeModal();
    });

    // util escapar
    function escapeHTML(str){
      return String(str)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }
  });
})();

function imprimirDossierSeleccionado(sectionIds){
  const blocks = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .map(sec => {
      const title = (sec.querySelector("h1")?.innerText || sec.id).trim();
      return `
        <section class="print-section">
          <h1>${escapeHTMLPrint(title)}</h1>
          <div class="print-body">
            ${sec.innerHTML}
          </div>
        </section>
        <div class="pagebreak"></div>
      `;
    }).join("");

  const w = window.open("", "_blank", "width=1000,height=800");

  const printCSS = `
    <style>
      body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#111;}
      h1{margin:0 0 10px;color:#0a5aa1;}
      h2,h3{color:#0a5aa1;margin:12px 0 8px;}
      p,li{font-size:14px;line-height:1.45;}
      ul{margin:8px 0 14px 18px;}
      .tip-comercial{border-left:6px solid #f7b84b;background:#fff7e6;padding:10px 12px;border-radius:10px;margin:12px 0;}
      .subtabs{display:none !important;} /* no imprimimos los botones */
      .subtab-panel{display:block !important;} /* imprimimos todo el contenido */
      .pagebreak{page-break-after:always;}
      @media print{
        *{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  `;

  w.document.write(`
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Dossier</title>
        ${printCSS}
      </head>
      <body>
        ${blocks}
        <script>window.onload=()=>{window.print();}</script>
      </body>
    </html>
  `);

  w.document.close();

  function escapeHTMLPrint(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
}

 function generarDossier() {
  const checks = document.querySelectorAll('input[type="checkbox"]:checked');
  let contenido = "";

  checks.forEach(c => {
    const seccion = document.getElementById(c.value);

    if (seccion) {
      const copia = seccion.cloneNode(true);

      copia.querySelectorAll('[style*="display:none"], .contenido-oculto, .formacion-oculta').forEach(el => {
        el.style.display = 'block';
      });

      copia.querySelectorAll('.subtabs, .main-nav, button').forEach(el => {
        el.remove();
      });

      copia.querySelectorAll('.subtab-panel').forEach(panel => {
        panel.style.display = 'block';
      });

      contenido += "<hr>" + copia.innerHTML;
    }
  });

  const ventana = window.open("", "_blank");

  ventana.document.write(`
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dossier Comercial</title>
      <style>
        body{
          font-family: Arial, sans-serif;
          padding: 24px;
          max-width: 900px;
          margin: auto;
        }

        h1,h2,h3{
          color:#004481;
        }

        .tip-comercial{
          background:#eef6ff;
          padding:10px;
          border-left:4px solid #004481;
          margin:15px 0;
          border-radius:8px;
        }

        .notice, .highlight{
          background:#fff8ec;
          padding:10px;
          border-left:4px solid #f0ad4e;
          margin:15px 0;
          border-radius:8px;
        }

        .aviso-dossier{
          background:#fff3cd;
          border:2px solid #d6a700;
          color:#5f4b00;
          padding:16px 18px;
          border-radius:10px;
          margin-bottom:24px;
          line-height:1.5;
          font-size:14px;
        }

        hr{
          margin:30px 0;
        }

        table{
          width:100%;
          border-collapse:collapse;
          margin:15px 0;
        }

        th, td{
          border:1px solid #ccc;
          padding:8px;
          text-align:left;
        }

        .barra-dossier{
          position: sticky;
          top: 0;
          z-index: 999;
          background: #ffffff;
          padding: 12px 0 18px 0;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        }

        .btn-dossier{
          background:#004481;
          color:#fff;
          border:none;
          padding:12px 18px;
          border-radius:10px;
          font-weight:600;
          cursor:pointer;
        }

        .btn-dossier.secundario{
          background:#2e7d32;
        }

        @media print{
          .barra-dossier{
            display:none !important;
          }

          body{
            padding:20px;
          }
        }
      </style>
    </head>
    <body>

      <div class="barra-dossier">
        <button class="btn-dossier secundario" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
        <button class="btn-dossier" onclick="window.close()">✖ Cerrar</button>
      </div>

      <h1>Dossier Comercial</h1>

      <div class="aviso-dossier">
        <strong>DOCUMENTO INTERNO – USO ORIENTATIVO</strong><br>
        Este dossier tiene carácter informativo y de apoyo comercial.
        No constituye oferta vinculante ni documentación contractual.
        Las condiciones, primas, promociones y vigencias deben verificarse siempre en los sistemas y documentación oficial vigente.
      </div>

      ${contenido}
    </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus();
}

function generarTodo() {
  const checks = document.querySelectorAll('input[type="checkbox"]');
  checks.forEach(c => {
    c.checked = true;
  });

  actualizarContador();
  generarDossier();
}

function actualizarContador() {
  const total = document.querySelectorAll('input[type="checkbox"]:checked').length;
  const contador = document.getElementById("contadorProductos");

  if (contador) {
    contador.innerText = "Productos seleccionados: " + total;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(c => {
    c.addEventListener("change", actualizarContador);
  });

  actualizarContador();
});





 
document.addEventListener("DOMContentLoaded", function () {
  const promos = document.querySelectorAll("#promociones .promo-card");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  promos.forEach(card => {
    const inicioTxt = card.dataset.inicio;
    const finTxt = card.dataset.fin;

    if (!inicioTxt) return;

    const inicio = new Date(inicioTxt + "T00:00:00");
    const fin = finTxt ? new Date(finTxt + "T23:59:59") : null;

    let estado = "";
    let color = "";

    if (hoy < inicio) {
      estado = "PRÓXIMA";
      color = "#0d6efd";
    } else if (fin && hoy > fin) {
      estado = "INACTIVA";
      color = "#6c757d";
    } else if (fin) {
      const diffMs = fin - hoy;
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDias <= 7) {
        estado = "PRÓXIMA A VENCER";
        color = "#fd7e14";
      } else {
        estado = "ACTIVA";
        color = "#198754";
      }
    } else {
      estado = "ACTIVA";
      color = "#198754";
    }

    let badge = card.querySelector(".promo-estado");

    if (!badge) {
      badge = document.createElement("span");
      badge.className = "promo-estado";
      badge.style.position = "absolute";
      badge.style.top = "10px";
      badge.style.right = "10px";
      badge.style.color = "#fff";
      badge.style.padding = "5px 10px";
      badge.style.borderRadius = "8px";
      badge.style.fontSize = "12px";
      badge.style.fontWeight = "bold";
      badge.style.zIndex = "20";
      card.appendChild(badge);
    }

    badge.textContent = estado;
    badge.style.background = color;

    card.classList.remove("promo-activa", "promo-proxima", "promo-urgente", "promo-inactiva");

    if (estado === "ACTIVA") card.classList.add("promo-activa");
    if (estado === "PRÓXIMA") card.classList.add("promo-proxima");
    if (estado === "PRÓXIMA A VENCER") card.classList.add("promo-urgente");
    if (estado === "INACTIVA") card.classList.add("promo-inactiva");
  });
});

function openEmpresaTab(evt, tabId) {
  document.querySelectorAll(".empresa-panel").forEach(panel => {
    panel.style.display = "none";
  });

  document.querySelectorAll(".subtab-empresa").forEach(btn => {
    btn.classList.remove("active");
  });

  const target = document.getElementById(tabId);
  if (target) target.style.display = "block";

  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add("active");
  }
}

function irAPestana(target) {
  const boton = document.querySelector(`.main-tab[data-target="${target}"]`);
  if (boton) {
    boton.click();
  } else {
    console.warn("No encontré pestaña principal con data-target =", target);
  }
}
// =====================================
// NAVEGACIÓN DIRECTA A PESTAÑAS (FIX DEFINITIVO)
// =====================================
function irAPestana(id) {

  // Ocultar todas las secciones
  document.querySelectorAll(".main-section").forEach(sec => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  // Quitar activo a todos los botones
  document.querySelectorAll(".main-tab").forEach(btn => {
    btn.classList.remove("active");
  });

  // Mostrar la sección correcta
  const target = document.getElementById(id);
  if (!target) {
    console.error("❌ NO EXISTE ESTE ID:", id);
    return;
  }

  target.style.display = "block";
  target.classList.add("active");

  // Activar botón del menú
  const btn = document.querySelector(`.main-tab[data-target="${id}"]`);
  if (btn) btn.classList.add("active");

  // Scroll arriba
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function copiarTexto(btn) {
  const texto = btn.parentElement.innerText.replace("Copiar", "").trim();

  navigator.clipboard.writeText(texto).then(() => {
    btn.innerText = "Copiado ✔";
    setTimeout(() => {
      btn.innerText = "Copiar";
    }, 1500);
  });
}

function generarWhatsApp(texto) {
  const url = "https://wa.me/?text=" + encodeURIComponent(texto);

  navigator.clipboard.writeText(texto);

  window.open(url, "_blank");
}

// ==========================
// WHATSAPP - MENSAJES POR PRODUCTO
// ==========================

function enviarWhatsAppTransporte() {
  const nombre = document.getElementById("nombreCliente")?.value || "😊";

  const mensaje = `Hola ${nombre}
Te comento rápido porque esto es importante.

Cuando una mercancía se transporta, el transportista tiene responsabilidad limitada.
Si pasa algo, normalmente no cubre el valor real.

Este seguro protege el valor completo de la mercancía.

Si quieres lo vemos en 2 minutos y te digo cuánto sería`;

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}


function enviarWhatsAppImpago() {
  const nombre = document.getElementById("nombreCliente")?.value || "😊";

  const mensaje = `Hola ${nombre}
Te comento rápido porque esto es importante.

Si un inquilino deja de pagar, puedes estar meses sin cobrar.

Este seguro te cubre las rentas y además incluye defensa jurídica.

Si quieres lo vemos en 2 minutos y te explico cómo funciona`;

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}


function enviarWhatsAppCiber() {
  const nombre = document.getElementById("nombreCliente")?.value || "😊";

  const mensaje = `Hola ${nombre}
Te comento rápido porque esto es importante.

Hoy en día cualquier negocio puede sufrir un ciberataque o robo de datos.

Este seguro cubre los daños, recuperación de sistemas y responsabilidad frente a terceros.

Si quieres lo vemos en 2 minutos y te explico cómo protegerte`;

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}


function enviarWhatsAppAutos() {
  const nombre = document.getElementById("nombreCliente")?.value || "😊";

  const mensaje = `Hola ${nombre}
Te comento rápido porque esto es importante.

En el seguro de coche no solo es el precio, sino lo que realmente te cubre cuando pasa algo.

Nosotros tenemos opciones muy completas con asistencia, sustitución y buenas coberturas.

Si quieres lo vemos en 2 minutos y te paso precio`;

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}


function enviarWhatsAppHogar() {
  const nombre = document.getElementById("nombreCliente")?.value || "😊";

  const mensaje = `Hola ${nombre}
Te comento rápido porque esto es importante.

El seguro de hogar no solo cubre incendios, también daños por agua, robos y responsabilidad civil.

Es clave tenerlo bien ajustado para evitar sustos.

Si quieres lo vemos en 2 minutos y te digo cómo lo tienes ahora`;

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}


function enviarWhatsAppSalud() {
  const nombre = document.getElementById("nombreCliente")?.value || "😊";

  const mensaje = `Hola ${nombre}
Te comento rápido porque esto es importante.

Tener un seguro de salud te evita listas de espera y te da acceso rápido a especialistas.

Además hay opciones muy ajustadas para empresas y familias.

Si quieres lo vemos en 2 minutos y te explico opciones`;

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}


function enviarWhatsAppVida() {
  const nombre = document.getElementById("nombreCliente")?.value || "😊";

  const mensaje = `Hola ${nombre}
Te comento rápido porque esto es importante.

El seguro de vida protege a tu familia ante cualquier imprevisto económico.

Es fundamental si tienes hipoteca o personas a tu cargo.

Si quieres lo vemos en 2 minutos y te digo cómo lo tienes ahora`;

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}
function abrirImpagoSeguros(panelId, boton) {
  const contenedor = document.getElementById("seguros-impago");
  if (!contenedor) return;

  contenedor.querySelectorAll('[id^="seguros-impago-"].subtab-panel').forEach(panel => {
    panel.style.display = "none";
    panel.classList.remove("active");
  });

  contenedor.querySelectorAll(".subtab-impago-seguros").forEach(btn => {
    btn.classList.remove("active");
  });

  const panel = document.getElementById(panelId);
  if (panel) {
    panel.style.display = "block";
    panel.classList.add("active");
  }

  if (boton) {
    boton.classList.add("active");
  }
}

function openAutosTab(event, panelId) {
  const root = document.getElementById("seguros-autos");
  if (!root) return;

  const paneles = root.querySelectorAll(".autos-panel");
  const botones = root.querySelectorAll(".autos-subtab");

  paneles.forEach(panel => {
    panel.style.display = "none";
    panel.classList.remove("active");
  });

  botones.forEach(btn => {
    btn.classList.remove("active");
  });

  const destino = root.querySelector("#" + panelId);
  if (destino) {
    destino.style.display = "block";
    destino.classList.add("active");
  }

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }
}
function abrirSaludAsisa(panelId, boton) {
  const contenedor = document.getElementById("seguros-salud");
  if (!contenedor) return;

  contenedor.querySelectorAll(".sub-section").forEach(panel => {
    panel.style.display = "none";
    panel.classList.remove("is-visible", "active");
  });

  contenedor.querySelectorAll(".sub-tab").forEach(btn => {
    btn.classList.remove("is-active", "active");
  });

  const panel = document.getElementById(panelId);
  if (panel) {
    panel.style.display = "block";
    panel.classList.add("is-visible", "active");
  }

  if (boton) {
    boton.classList.add("is-active", "active");
  }
}

function abrirEmpresas(panelId, boton) {
  const contenedor = document.getElementById("seguros-empresas");
  if (!contenedor) return;

  const subtabsGenerales = document.getElementById("subtabs-seguros-principales");
  if (subtabsGenerales) {
    subtabsGenerales.style.display = "none";
  }

  contenedor.querySelectorAll(".empresa2-panel").forEach(panel => {
    panel.style.display = "none";
    panel.classList.remove("active");
  });

  contenedor.querySelectorAll(".subtab-empresa2").forEach(btn => {
    btn.classList.remove("active");
  });

  const panel = document.getElementById(panelId);
  if (panel) {
    panel.style.display = "block";
    panel.classList.add("active");
  }

  if (boton) {
    boton.classList.add("active");
  }
}


function abrirSeguroYSubtab(subtabId) {
  if (subtabId === "seguros-ciber") {
    irAPestana("ciberseguro");
    return;
  }

  const botonSeguros = document.querySelector('.main-tab[data-target="seguros"]');
  if (botonSeguros) {
    botonSeguros.click();
  }

  setTimeout(() => {
    const subtab = document.querySelector('#seguros .subtab[data-subtab="' + subtabId + '"]');
    if (subtab) {
      subtab.click();
    }
  }, 150);
}




function detectarOportunidades() {
  const clienteBanco = document.getElementById("detClienteBanco")?.value || "";
  const edad = parseInt(document.getElementById("detEdad")?.value || "0", 10) || 0;
  const sexo = document.getElementById("detSexo")?.value || "";
  const perfil = document.getElementById("detPerfil")?.value || "";
  const profesion = (document.getElementById("detProfesion")?.value || "").toLowerCase();
  const prioridad = document.getElementById("detPrioridad")?.value || "";

  const hijos = document.getElementById("detHijos")?.checked || false;
  const hipoteca = document.getElementById("detHipoteca")?.checked || false;
  const prestamo = document.getElementById("detPrestamo")?.checked || false;
  const vivienda = document.getElementById("detVivienda")?.checked || false;
  const segurosAntiguos = document.getElementById("detSegurosAntiguos")?.checked || false;
  const salud = document.getElementById("detSalud")?.checked || false;
  const dependencia = document.getElementById("detDependencia")?.checked || false;
  const decesos = document.getElementById("detDecesos")?.checked || false;

  const dinero = document.getElementById("detDinero")?.checked || false;
  const venta = document.getElementById("detVenta")?.checked || false;
  const ingresos = document.getElementById("detIngresos")?.checked || false;
  const ahorro = document.getElementById("detAhorro")?.checked || false;

  const dependeTrabajo = document.getElementById("detDependeTrabajo")?.checked || false;
  const negocio = document.getElementById("detNegocio")?.checked || false;
  const empleados = document.getElementById("detEmpleados")?.checked || false;
  const socioClave = document.getElementById("detSocioClave")?.checked || false;
  const datos = document.getElementById("detDatos")?.checked || false;
  const mercancia = document.getElementById("detMercancia")?.checked || false;
  const credito = document.getElementById("detCredito")?.checked || false;
  const exporta = document.getElementById("detExporta")?.checked || false;

  const coche = document.getElementById("detCoche")?.checked || false;
  const moto = document.getElementById("detMoto")?.checked || false;
  const flota = document.getElementById("detFlota")?.checked || false;
  const camiones = document.getElementById("detCamiones")?.checked || false;

  const resultado = document.getElementById("detectorResultado");
  const resumen = document.getElementById("detectorResumen");
  const alta = document.getElementById("detectorAlta");
  const media = document.getElementById("detectorMedia");
  const comp = document.getElementById("detectorComplementaria");
  const frase = document.getElementById("detectorFrase");

  if (!resultado || !resumen || !alta || !media || !comp || !frase) return;

  if (clienteBanco !== "si" || edad < 18) {
    resultado.style.display = "block";
    resumen.innerHTML = `<p><strong>Revisión no aplicable.</strong></p>
      <p>La herramienta está pensada para clientes del banco y mayores de 18 años.</p>`;
    alta.innerHTML = "";
    media.innerHTML = "";
    comp.innerHTML = "";
    frase.textContent = "Frase sugerida: Primero confirmamos si cumple condiciones básicas y, a partir de ahí, revisamos qué puede encajarle.";
    return;
  }

  const recomendaciones = [];

  function agregar(nombre, nivel, motivo) {
    const existe = recomendaciones.find(r => r.nombre === nombre);
    if (!existe) recomendaciones.push({ nombre, nivel, motivo });
  }

  function subirPorPrioridad(nombreObjetivo) {
    const item = recomendaciones.find(r => r.nombre === nombreObjetivo);
    if (item && item.nivel === "media") item.nivel = "alta";
  }

  // PERSONALES Y FAMILIA
  if (hipoteca) agregar("Vida vinculado a hipoteca", "alta", "Tiene hipoteca y conviene revisar protección vinculada.");
  if (prestamo) agregar("Vida vinculado a préstamo consumo", "media", "Tiene préstamo o financiación y puede encajar protección vinculada.");
  if (hijos || hipoteca) agregar("Vida Familiar Plus", "alta", "Tiene familia, personas a cargo o hipoteca.");
  if (!hijos && !hipoteca && edad >= 18 && edad < 65) agregar("Vida Esencial", "media", "Puede encajar protección básica solo fallecimiento.");
  if (sexo === "mujer") agregar("Vida en Femenino", salud || hijos ? "alta" : "media", "Puede encajar por perfil y protección específica.");
  if (edad >= 18 && edad < 70) agregar("Accidentes Protección Integral", dependeTrabajo ? "alta" : "media", "Puede reforzar protección personal por accidente.");
  if (edad >= 60) agregar("Protección Senior", "media", "Por edad puede tener sentido revisar protección senior.");
  if ((edad >= 64) || dependencia) agregar("Dependencia", "media", "Puede tener sentido revisar protección futura y dependencia.");
  if ((edad >= 64) || decesos) agregar("Decesos", "media", "Puede ser momento de dejar resuelta la parte de decesos.");

  // SALUD
  if (salud && (perfil === "empresa" || empleados)) {
    agregar("Salud Asisa Empresa", "alta", "Hay encaje de salud para empresa o empleados.");
  } else if (salud && (perfil === "autonomo-fisica" || perfil === "autonomo-juridica")) {
    agregar("Salud Aegon Autónomos", "alta", "Hay interés en salud y encaja perfil autónomo.");
  } else if (salud) {
    agregar("Salud Aegon Particular", "alta", "Hay interés en salud o evitar listas de espera.");
  }

  // INGRESOS Y ACTIVIDAD
  if (perfil === "autonomo-fisica" || dependeTrabajo || profesion.includes("autónom") || profesion.includes("autonom")) {
    agregar("Incapacidad Temporal Autónomos", "alta", "Depende de trabajar a diario para generar ingresos.");
  }

  if ((perfil === "autonomo-juridica" || perfil === "empresa") && socioClave) {
    agregar("ITA digital", "alta", "La actividad depende de una persona clave.");
  }

  if (dependeTrabajo && (perfil === "empleado" || perfil === "particular")) {
    agregar("Protección de Ingresos", "media", "Puede encajar para proteger ingresos ante imprevistos.");
  }

  // AMA DE CASA
  if (perfil === "amacasa") {
    agregar("Vida Familiar Plus", hijos || hipoteca ? "alta" : "media", "Puede encajar por protección familiar.");
    if (salud) agregar("Salud Aegon Particular", "alta", "Interés claro en salud.");
    if (sexo === "mujer") agregar("Vida en Femenino", "media", "Encaje por perfil femenino.");
    if (vivienda) agregar("Mi Hogar", "media", "Tiene vivienda y conviene revisar hogar.");
  }

  // AHORRO / INVERSIÓN
  if (edad >= 65 && (dinero || venta || ingresos || perfil === "jubilado")) {
    agregar("Renta Vitalicia", "alta", "Perfil claro para revisar rentas, liquidez o reinversión.");
  }

  if (edad >= 55 && (dinero || venta || ahorro)) {
    agregar("Europa 8", "media", "Puede encajar como solución de ahorro inversión.");
  }

  // HOGAR
  if (vivienda) agregar("Mi Hogar", "alta", "Tiene vivienda y conviene revisar protección del inmueble y responsabilidad civil.");

  // EMPRESA
  if (negocio) agregar("Multirriesgo Empresa", "alta", "Tiene negocio o local y conviene proteger actividad y contenido.");
  if (negocio || perfil === "empresa" || perfil === "autonomo-fisica" || perfil === "autonomo-juridica") {
    agregar("Responsabilidad Civil", "alta", "Conviene revisar daños a terceros derivados de la actividad.");
  }
  if (empleados) agregar("Accidentes Convenio Colectivo", "alta", "Tiene empleados y conviene revisar convenio colectivo.");
  if ((perfil === "empresa" || perfil === "autonomo-juridica") && socioClave) {
    agregar("Protección Empresas", "media", "Puede encajar protección de vida para empresas.");
    agregar("D&O", "media", "Puede existir exposición como administrador o figura clave.");
  }
  if (datos) agregar("Ciberseguro", "alta", "Gestiona datos o sistemas y existe riesgo digital.");
  if (mercancia) agregar("Transporte de mercancías", "alta", "Envía o recibe mercancía y puede necesitar cobertura específica.");
  if (credito || exporta) agregar("Seguro de Crédito Póliza PY", "alta", "Vende a crédito o trabaja con riesgo de impago.");
  if (credito) subirPorPrioridad("Seguro de Crédito Póliza PY");

  // VEHÍCULOS
  if (coche) agregar("Seguro de Auto", "alta", "Tiene coche y conviene revisar precio y coberturas.");
  if (moto) agregar("Seguro de Moto", "media", "Tiene moto y puede interesar revisar modalidad y asistencia.");
  if (flota) agregar("Flotas", "alta", "Tiene varios vehículos y conviene revisar aseguramiento conjunto.");
  if (camiones) agregar("Flotas / Camiones", "alta", "Tiene camiones o vehículos pesados y requiere revisión específica.");

  // AJUSTES POR PRIORIDAD PRINCIPAL
  if (prioridad === "salud") {
    subirPorPrioridad("Salud Aegon Particular");
    subirPorPrioridad("Salud Aegon Autónomos");
    subirPorPrioridad("Salud Asisa Empresa");
  }
  if (prioridad === "ahorro") {
    subirPorPrioridad("Renta Vitalicia");
    subirPorPrioridad("Europa 8");
  }
  if (prioridad === "empresa") {
    subirPorPrioridad("Multirriesgo Empresa");
    subirPorPrioridad("Responsabilidad Civil");
    subirPorPrioridad("Ciberseguro");
    subirPorPrioridad("Seguro de Crédito Póliza PY");
  }
  if (prioridad === "vehiculos") {
    subirPorPrioridad("Seguro de Auto");
    subirPorPrioridad("Seguro de Moto");
    subirPorPrioridad("Flotas");
    subirPorPrioridad("Flotas / Camiones");
  }

  if (segurosAntiguos) {
    agregar("Revisión integral de seguros", "media", "Tiene seguros antiguos o sin revisar.");
  }

  const altas = recomendaciones.filter(r => r.nivel === "alta");
  const medias = recomendaciones.filter(r => r.nivel === "media");
  const complementarias = recomendaciones.filter(r => r.nivel !== "alta" && r.nivel !== "media");

  resumen.innerHTML = `
    <p><strong>Perfil analizado:</strong> ${perfil || "No indicado"} · ${edad} años ${sexo ? "· " + sexo : ""}</p>
    <p><strong>Resultado:</strong> ${recomendaciones.length} oportunidades detectadas.</p>
  `;

  function pintarBloque(titulo, items) {
    if (!items.length) return `<div class="card" style="margin-top:12px;"><h3>${titulo}</h3><p class="muted">Sin resultados en este bloque.</p></div>`;
    return `
      <div class="card" style="margin-top:12px;">
        <h3>${titulo}</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="background:#f1f1f1;">
              <th style="padding:8px; border:1px solid #ddd; text-align:left;">Producto</th>
              <th style="padding:8px; border:1px solid #ddd; text-align:left;">Motivo</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td style="padding:8px; border:1px solid #ddd;">${i.nombre}</td>
                <td style="padding:8px; border:1px solid #ddd;">${i.motivo}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  alta.innerHTML = pintarBloque("Prioridad alta", altas);
  media.innerHTML = pintarBloque("Interesante revisar", medias);
  comp.innerHTML = complementarias.length ? pintarBloque("Complementarios", complementarias) : "";

  let fraseSugerida = "Frase sugerida: Por lo que veo en tu perfil, puede tener sentido revisar contigo qué protecciones encajan de verdad y cuáles pueden aportarte más valor ahora mismo.";

  const top = altas[0]?.nombre || medias[0]?.nombre || "";
  if (top === "Renta Vitalicia") fraseSugerida = "Frase sugerida: Por tu perfil, puede tener mucho sentido revisar si parte de ese ahorro te puede generar ingresos o una mejor planificación.";
  if (top === "Incapacidad Temporal Autónomos" || top === "ITA digital") fraseSugerida = "Frase sugerida: Aquí lo importante es ver qué pasaría con tus ingresos o con la actividad si mañana no pudieras trabajar durante una temporada.";
  if (top === "Salud Aegon Particular" || top === "Salud Aegon Autónomos" || top === "Salud Asisa Empresa") fraseSugerida = "Frase sugerida: Si te parece, revisamos la parte de salud y vemos qué opción te encaja mejor por perfil y uso real.";
  if (top === "Seguro de Crédito Póliza PY") fraseSugerida = "Frase sugerida: Aquí no solo se trata del impago, sino de proteger la tesorería y vender con más seguridad.";
  if (top === "Multirriesgo Empresa") fraseSugerida = "Frase sugerida: Aquí no se trata solo del local, sino de proteger la actividad y el dinero que puede perder el negocio si pasa algo.";
  if (top === "Vida Familiar Plus" || top === "Vida Esencial" || top === "Vida vinculado a hipoteca") fraseSugerida = "Frase sugerida: Lo importante es ver si esa parte de protección familiar o vinculada la tienes bien resuelta y si encaja contigo hoy.";

  frase.textContent = fraseSugerida;
  resultado.style.display = "block";
}

function limpiarDetectorOportunidades() {
  const idsTexto = ["detEdad", "detProfesion"];
  const idsSelect = ["detClienteBanco", "detSexo", "detPerfil", "detPrioridad"];
  const idsChecks = [
    "detHijos", "detHipoteca", "detPrestamo", "detVivienda", "detSegurosAntiguos",
    "detSalud", "detDependencia", "detDecesos", "detDinero", "detVenta",
    "detIngresos", "detAhorro", "detDependeTrabajo", "detNegocio", "detEmpleados",
    "detSocioClave", "detDatos", "detMercancia", "detCredito", "detExporta",
    "detCoche", "detMoto", "detFlota", "detCamiones"
  ];

  idsTexto.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  idsSelect.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  idsChecks.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });

  const resultado = document.getElementById("detectorResultado");
  const resumen = document.getElementById("detectorResumen");
  const alta = document.getElementById("detectorAlta");
  const media = document.getElementById("detectorMedia");
  const comp = document.getElementById("detectorComplementaria");
  const frase = document.getElementById("detectorFrase");
  const alquiler = document.getElementById("detAlquiler")?.checked || false;
  const arrendador = document.getElementById("detArrendador")?.checked || false;
  const rentasAlquiler = document.getElementById("detRentasAlquiler")?.checked || false;

  if (resultado) resultado.style.display = "none";
  if (resumen) resumen.innerHTML = "";
  if (alta) alta.innerHTML = "";
  if (media) media.innerHTML = "";
  if (comp) comp.innerHTML = "";
  if (frase) frase.textContent = "";

"detAlquiler", "detArrendador", "detRentasAlquiler"

}
function generarDossier() {
  const checks = document.querySelectorAll('input[type="checkbox"]:checked');
  let contenido = "";

  checks.forEach(c => {
    const seccion = document.getElementById(c.value);

    if (seccion) {
      const copia = seccion.cloneNode(true);

      copia.querySelectorAll('.subtabs, .subnav, button, script').forEach(el => {
        el.remove();
      });

      copia.querySelectorAll('.subtab-panel, .sub-section, .hogar-panel, .vida-panel, .autos-panel, .empresa-panel, .empresa2-panel').forEach(panel => {
        panel.style.display = 'block';
        panel.classList.add('active', 'is-visible');
      });

      contenido += "<hr>" + copia.innerHTML;
    }
  });

  const ventana = window.open("", "_blank");

  ventana.document.write(`
    <html>
    <head>
      <title>Dossier Comercial</title>
      <style>
        body{
          font-family: Arial, sans-serif;
          padding: 40px;
          max-width: 1000px;
          margin: auto;
        }
        h1,h2,h3{
          color:#004481;
        }
        .tip-comercial, .notice, .highlight{
          background:#eef6ff;
          padding:10px;
          border-left:4px solid #004481;
          margin:15px 0;
          border-radius:8px;
        }
        hr{
          margin:30px 0;
        }
        table{
          width:100%;
          border-collapse:collapse;
          margin:15px 0;
        }
        th, td{
          border:1px solid #ccc;
          padding:8px;
          text-align:left;
        }
        .subtab-panel, .sub-section, .hogar-panel, .vida-panel, .autos-panel, .empresa-panel, .empresa2-panel{
          display:block !important;
        }
      </style>
    </head>
    <body>
      <h1>Dossier Comercial</h1>
      ${contenido}
    </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus();
  ventana.print();
}
function actualizarVistaSegurosEmpresas() {
  const fila = document.getElementById("subtabs-seguros-principales");
  const panelEmpresas = document.getElementById("seguros-empresas");
  if (!fila || !panelEmpresas) return;

  const empresasActiva =
    panelEmpresas.classList.contains("active") ||
    panelEmpresas.style.display === "block";

  fila.style.display = empresasActiva ? "none" : "flex";
}

document.addEventListener("click", function (e) {
  const btnSubtab = e.target.closest(".subtab[data-subtab]");
  if (btnSubtab) {
    setTimeout(actualizarVistaSegurosEmpresas, 0);
  }

  const btnMainSeguros = e.target.closest('.main-tab[data-target="seguros"]');
  if (btnMainSeguros) {
    setTimeout(() => {
      const fila = document.getElementById("subtabs-seguros-principales");
      if (fila) fila.style.display = "flex";
    }, 0);
  }
});

document.addEventListener("DOMContentLoaded", actualizarVistaSegurosEmpresas);
