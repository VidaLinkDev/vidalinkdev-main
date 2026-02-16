// SCRIPT/utils.js

export function showCustomAlert(title, message, buttons = null) {
  let modalEl = document.getElementById('customAlertModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'customAlertModal';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-danger" id="customAlertTitle">Error</h5>
          </div>
          <div class="modal-body pt-2 text-center">
            <p id="customAlertMessage" class="text-dark mb-0 fs-5">${message || 'Mensaje'}</p>
          </div>
          <div class="modal-footer border-0 justify-content-center" id="customAlertFooter">
            <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  document.getElementById('customAlertTitle').textContent = title;
  document.getElementById('customAlertMessage').textContent = message;

  const footer = document.getElementById('customAlertFooter');
  footer.innerHTML = ''; // Limpiar botones anteriores
  footer.className = 'modal-footer border-0 justify-content-center gap-2';

  const modalInstance = new bootstrap.Modal(modalEl);

  // Si hay botones personalizados
  if (buttons && Array.isArray(buttons) && buttons.length > 0) {
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = btn.className || 'btn btn-secondary px-4';
      button.textContent = btn.text;
      button.addEventListener('click', () => {
        modalInstance.hide();
        if (btn.action) btn.action();
      });
      footer.appendChild(button);
    });
  } else {
    // Botón por defecto si no hay botones personalizados
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary px-4';
    btn.setAttribute('data-bs-dismiss', 'modal');
    btn.textContent = 'Cerrar';
    footer.appendChild(btn);
  }

  // Limpiar backdrop cuando se cierre
  modalEl.addEventListener('hidden.bs.modal', () => {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, { once: true });

  modalInstance.show();
}

export function showCustomConfirm(title, message, callbackYes) {
  let modalEl = document.getElementById('customConfirmModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'customConfirmModal';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-danger" id="customConfirmTitle">Confirmar</h5>
          </div>
          <div class="modal-body pt-2 text-center">
            <p id="customConfirmMessage" class="text-dark mb-0 fs-5">¿Estás seguro?</p>
          </div>
          <div class="modal-footer border-0 justify-content-center gap-3">
            <button type="button" class="btn btn-secondary px-4" id="confirmNoBtn">No</button>
            <button type="button" class="btn btn-danger px-4" id="confirmYesBtn">Sí</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  document.getElementById('customConfirmTitle').textContent = title;
  document.getElementById('customConfirmMessage').textContent = message;

  const modalInstance = new bootstrap.Modal(modalEl);

  // Limpiar listeners anteriores para evitar duplicados
  const yesBtn = document.getElementById('confirmYesBtn');
  const noBtn = document.getElementById('confirmNoBtn');
  const oldYes = yesBtn.onclick;
  const oldNo = noBtn.onclick;

  yesBtn.onclick = noBtn.onclick = null; // Limpiar

  // Botón No: solo cierra
  noBtn.onclick = () => {
    modalInstance.hide();
  };

  // Botón Sí: ejecuta callback y cierra
  yesBtn.onclick = () => {
    modalInstance.hide();
    if (callbackYes) callbackYes();
  };

  // Asegurar que al cerrarse (clic fuera o ESC) se limpie todo
  modalEl.addEventListener('hidden.bs.modal', () => {
    // Remover backdrop manualmente si se queda atascado
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, { once: true });

  modalInstance.show();
}