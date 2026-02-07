/**
 * Tab: Manutencao
 */

import { appState, saveAppData } from '../state.js';

export async function renderManutencao(container) {
  const maintenance = appState.appData.maintenance || { enabled: false, title: '', message: '' };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Manutencao</h2>

      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <label style="position:relative; display:inline-block; width:3rem; height:1.5rem; cursor:pointer;">
              <input type="checkbox" id="maintenanceToggle" ${maintenance.enabled ? 'checked' : ''}
                style="opacity:0; width:0; height:0; position:absolute;">
              <span id="toggleTrack" style="position:absolute; inset:0; background:${maintenance.enabled ? '#16a34a' : '#374151'}; border-radius:9999px; transition:background 0.3s;"></span>
              <span id="toggleThumb" style="position:absolute; top:2px; left:${maintenance.enabled ? '26px' : '2px'}; width:1.25rem; height:1.25rem; background:white; border-radius:9999px; transition:left 0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></span>
            </label>
            <span style="font-size:1rem; font-weight:600; color:${maintenance.enabled ? '#34d399' : '#9ca3af'};" id="statusText">
              ${maintenance.enabled ? 'Cortina ATIVADA' : 'Cortina desativada'}
            </span>
          </div>
          ${maintenance.enabled ? `<a href="/preview" target="_blank" style="background:#2563eb; color:white; padding:0.375rem 0.75rem; border-radius:0.375rem; text-decoration:none; font-size:0.875rem; font-weight:500;">Ver Preview</a>` : ''}
        </div>

        <p style="font-size:0.75rem; color:#9ca3af;">Quando ativada, o site publico mostra uma tela de manutencao. Use /preview para ver o site normalmente.</p>
      </div>

      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:1rem; font-weight:600; color:#d1d5db;">Mensagem de Manutencao</h3>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Titulo</label>
          <input type="text" id="mainTitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;"
            value="${maintenance.title || 'Site em Manutencao'}">
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Mensagem</label>
          <textarea id="mainMessage" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6; height:6rem; resize:vertical;"
            >${maintenance.message || 'Estamos realizando manutencao. Volte em breve!'}</textarea>
        </div>
      </div>

      <!-- Preview da cortina -->
      <div style="border:1px solid #374151; border-radius:0.75rem; overflow:hidden; height:12rem; position:relative; background:#000;">
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem;">
          <h1 id="previewTitle" style="font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:bold; color:white; margin-bottom:0.5rem;">${maintenance.title || 'Site em Manutencao'}</h1>
          <p id="previewMessage" style="color:#9ca3af; font-size:0.875rem;">${maintenance.message || 'Estamos realizando manutencao. Volte em breve!'}</p>
        </div>
      </div>

      <button id="saveMaintenanceBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar
      </button>
    </div>
  `;

  const toggle = container.querySelector('#maintenanceToggle');
  const toggleTrack = container.querySelector('#toggleTrack');
  const toggleThumb = container.querySelector('#toggleThumb');
  const statusText = container.querySelector('#statusText');
  const titleInput = container.querySelector('#mainTitle');
  const messageInput = container.querySelector('#mainMessage');

  toggle.onchange = () => {
    if (toggle.checked) {
      toggleTrack.style.background = '#16a34a';
      toggleThumb.style.left = '26px';
      statusText.textContent = 'Cortina ATIVADA';
      statusText.style.color = '#34d399';
    } else {
      toggleTrack.style.background = '#374151';
      toggleThumb.style.left = '2px';
      statusText.textContent = 'Cortina desativada';
      statusText.style.color = '#9ca3af';
    }
  };

  // Preview em tempo real
  titleInput.oninput = () => {
    container.querySelector('#previewTitle').textContent = titleInput.value;
  };
  messageInput.oninput = () => {
    container.querySelector('#previewMessage').textContent = messageInput.value;
  };

  container.querySelector('#saveMaintenanceBtn').onclick = async () => {
    const newMaintenance = {
      enabled: toggle.checked,
      title: titleInput.value,
      message: messageInput.value
    };
    await saveAppData('maintenance', newMaintenance);
  };
}
