// SCRIPT/sos.js

import { observarEstadoAuth } from './auth.js';
import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { showCustomAlert } from './utils.js';

export function inicializarSOS() {
  const sosButton = document.querySelector('.sos-button');
  const locationParagraph = document.querySelector('.location-text p');

  if (!sosButton) {
    console.error("Botón SOS no encontrado");
    return;
  }

  console.log("Botón SOS inicializado");

  sosButton.addEventListener('click', () => {
    observarEstadoAuth(async (user) => {
      if (!user) {
        showCustomAlert('Sesión requerida', 'Debes iniciar sesión para activar una emergencia', [
          { text: 'Ir a login', action: () => { window.location.href = 'login.html'; } }
        ]);
        return;
      }

      // Prevenir múltiples clics
      if (sosButton.disabled) return;

    // Feedback visual
      sosButton.disabled = true;
      sosButton.style.opacity = "1";
      sosButton.innerHTML = `
        <div class="sos-content">
          <div class="spinner-border spinner-border-sm text-white" role="status" style="margin-bottom: 4px;">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <span class="sos-text" style="font-size: 0.85rem;">Localizando...</span>
        </div>
      `;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (locationParagraph) {
          locationParagraph.textContent = `Ubicación enviada: Lat ${lat.toFixed(6)}, Lng ${lon.toFixed(6)}`;
        }

        try {
          // Crear alerta en Firestore y obtener su ID
          const docRef = await addDoc(collection(db, "alertas"), {
            usuarioId: user.uid,
            email: user.email || "Anónimo",
            latitud: lat,
            longitud: lon,
            timestamp: serverTimestamp(),
            estado: "activa"
          });

          const alertaId = docRef.id;

          // Guardar datos locales incluyendo el ID de la alerta
          const emergenciaData = {
            lat: lat,
            lon: lon,
            timestamp: Date.now(),
            alertaId: alertaId  // ← CLAVE PARA EL CHAT
          };

          localStorage.setItem('emergenciaActiva', JSON.stringify(emergenciaData));

          showCustomAlert('Emergencia Reportada', 'Tu ubicación ha sido enviada a los voluntarios cercanos. Mantén la calma y sigue las instrucciones del equipo de emergencia.', [
            { text: 'Continuar', action: () => { window.location.href = 'emergencia.html'; } }
          ]);

        } catch (error) {
          console.error("Error al guardar alerta:", error);
          showCustomAlert('Error', 'Error al enviar la alerta. Por favor, inténtalo de nuevo.');
          resetButton();
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        showCustomAlert('Error de ubicación', 'No se pudo obtener tu ubicación. Activa el GPS y permite el acceso.');
        resetButton();
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
        }
      );

    });

    function resetButton() {
      sosButton.disabled = false;
      sosButton.style.opacity = "1";
      sosButton.innerHTML = `
        <div class="sos-content">
          <img src="RECURSOS/emergencia.png" alt="Emergencia">
          <span class="sos-text">SOS</span>
        </div>
      `;
    }
  });
}