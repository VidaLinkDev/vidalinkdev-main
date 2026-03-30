document.addEventListener("DOMContentLoaded", () => {

  let data = JSON.parse(localStorage.getItem('emergenciaActiva'));

  // SI NO EXISTE LA EMERGENCIA, LA CREAMOS
  if (!data) {
    if (!navigator.geolocation) {
      console.error("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nuevaEmergencia = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          timestamp: Date.now()
        };

        localStorage.setItem(
          'emergenciaActiva',
          JSON.stringify(nuevaEmergencia)
        );

        iniciarVista(nuevaEmergencia);
      },
      () => {
        console.error("No se pudo obtener la ubicación");
      }
    );

  } else {
    // YA EXISTE, SOLO MOSTRAMOS
    iniciarVista(data);
  }
});

/* =========================
   MOSTRAR DATOS EN PANTALLA
   ========================= */
function iniciarVista(data) {
  const coordsEl = document.getElementById('coords');
  const tiempoEl = document.getElementById('tiempoActivo');

  coordsEl.innerText = `Lat: ${data.lat.toFixed(5)}, Lng: ${data.lon.toFixed(5)}`;

  setInterval(() => {
    const mins = Math.floor((Date.now() - data.timestamp) / 60000);
    tiempoEl.innerText = `Activado hace ${mins} minuto(s)`;
  }, 1000);
}

/* ======================
   GUÍA
   ====================== */
const guias = {
  paro: [
    "Verifica si la persona responde",
    "Llama a emergencias",
    "Coloca a la persona boca arriba",
    "Inicia compresiones torácicas",
    "Continúa hasta que llegue ayuda"
  ],
  asfixia: [
    "Pregunta si puede hablar",
    "Da 5 golpes en la espalda",
    "Realiza maniobra de Heimlich",
    "Repite hasta liberar la vía aérea"
  ],
  hemorragia: [
    "Aplica presión directa",
    "Eleva la zona afectada",
    "No retires objetos incrustados",
    "Mantén presión hasta ayuda médica"
  ],
  otra: [
    "Evalúa la escena",
    "Mantén la calma",
    "Llama a emergencias",
    "Sigue instrucciones médicas"
  ]
};

let tipoActual = "";
let pasoActual = 0;

/* ABRIR MODAL */
function abrirGuia() {
  document.getElementById("tituloModal").innerText = "Guías de Primeros Auxilios";

  document.getElementById("contenidoModal").innerHTML = `
    <div class="row g-3 text-center">
      <div class="col-md-6">
        <button class="btn btn-outline-danger w-100 p-4" onclick="iniciarPasos('paro')">
          🫀 Paro Cardíaco
        </button>
      </div>
      <div class="col-md-6">
        <button class="btn btn-outline-primary w-100 p-4" onclick="iniciarPasos('asfixia')">
          😮‍💨 Asfixia
        </button>
      </div>
      <div class="col-md-6">
        <button class="btn btn-outline-warning w-100 p-4" onclick="iniciarPasos('hemorragia')">
          🩸 Herida Grave
        </button>
      </div>
      <div class="col-md-6">
        <button class="btn btn-outline-secondary w-100 p-4" onclick="iniciarPasos('otra')">
          ⚠️ Otra Emergencia
        </button>
      </div>
    </div>
  `;

  new bootstrap.Modal(document.getElementById('modalGuia')).show();
}

/* INICIAR PASOS */
function iniciarPasos(tipo) {
  tipoActual = tipo;
  pasoActual = 0;
  renderPaso();
}

/* MOSTRAR PASO */
function renderPaso() {
  const pasos = guias[tipoActual];

  document.getElementById("tituloModal").innerText =
    tipoActual.toUpperCase() + " - Paso " + (pasoActual + 1) + " de " + pasos.length;

  document.getElementById("contenidoModal").innerHTML = `
    <div class="border rounded p-4 mb-3">
      <h5>${pasos[pasoActual]}</h5>
    </div>

    <div class="d-flex justify-content-between">
      <button class="btn btn-outline-secondary" onclick="abrirGuia()">Cambiar tipo</button>

      <div>
        <button class="btn btn-secondary me-2" onclick="anteriorPaso()" ${pasoActual === 0 ? "disabled" : ""}>
          Anterior
        </button>
        <button class="btn btn-danger" onclick="siguientePaso()" ${pasoActual === pasos.length - 1 ? "disabled" : ""}>
          Siguiente
        </button>
      </div>
    </div>
  `;
}

/* CONTROLES */
function siguientePaso() {
  pasoActual++;
  renderPaso();
}

function anteriorPaso() {
  pasoActual--;
  renderPaso();
}

import { db } from './firebase-init.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { manejarErrorGPS } from './utils.js';

let watchID = null;

document.addEventListener("DOMContentLoaded", () => {
    let data = JSON.parse(localStorage.getItem('emergenciaActiva'));
    if (data) {
        iniciarRastreoEnTiempoReal(data.alertaId);
        iniciarVista(data);
    }
});

function iniciarRastreoEnTiempoReal(alertaId) {
    if (!navigator.geolocation) return;

    // watchPosition actualizará la base de datos cada vez que el usuario se mueva
    watchID = navigator.geolocation.watchPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            // 1. Actualizar UI local
            const coordsEl = document.getElementById('coords');
            if(coordsEl) coordsEl.innerText = `Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)}`;

            // 2. Actualizar Firebase para que los voluntarios vean el movimiento
            try {
                const alertaRef = doc(db, "alertas", alertaId);
                await updateDoc(alertaRef, { lat, lon });
                console.log("Ubicación actualizada en tiempo real");
            } catch (error) {
                console.error("Error actualizando ubicación:", error);
            }
        },
        (err) => manejarErrorGPS(err),
        { enableHighAccuracy: true }
    );
}

// Asegúrate de limpiar el rastreo cuando la emergencia termine
window.addEventListener('beforeunload', () => {
    if (watchID) navigator.geolocation.clearWatch(watchID);
});