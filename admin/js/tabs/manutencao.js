/**
 * Tab: Manutenção
 */

import { appState, saveAppData } from '../state.js';

export async function renderManutencao(container) {
  const maintenance = appState.appData.maintenance || { enabled: false, title: '', message: '' };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Manutenção</h2>

      <div style="display:flex; align-items:center; gap:1rem;">
        <input type="checkbox" id="maintenanceToggle" ${maintenance.enabled ? 'checked' : ''}
          style="width:1.5rem; height:1.5rem; cursor:pointer;">
        <label for="maintenanceToggle" style="font-size:1.125rem; color:#f3f4f6; cursor:pointer;">Ativar modo de manutenção</label>
      </div>

      <div id="maintenanceForm" style="display:${maintenance.enabled ? 'flex' : 'none'}; flex-direction:column; gap:1rem;">
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Título</label>
          <input type="text" id="mainTitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${maintenance.title || 'Site em Manutenção'}">
        </div>

        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Mensagem</label>
          <textarea id="mainMessage" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6; height:6rem; resize:vertical;"
            >${maintenance.message || 'Estamos realizando manutenção. Volte em breve!'}</textarea>
        </div>

        <button id="saveMaintenanceBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
          Salvar
        </button>
      </div>
    </div>
  `;

  const toggle = container.querySelector('#maintenanceToggle');
  const form = container.querySelector('#maintenanceForm');
  const saveBtn = container.querySelector('#saveMaintenanceBtn');

  toggle.onchange = () => {
    form.style.display = toggle.checked ? 'flex' : 'none';
  };

  saveBtn.onclick = async () => {
    const newMaintenance = {
      enabled: toggle.checked,
      title: container.querySelector('#mainTitle').value,
      message: container.querySelector('#mainMessage').value
    };
    await saveAppData('maintenance', newMaintenance);
  };
}
