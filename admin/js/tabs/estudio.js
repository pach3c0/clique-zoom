/**
 * Tab: Estúdio
 */

import { appState, saveAppData } from '../state.js';

export async function renderEstudio(container) {
  const studio = appState.appData.studio || {};

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Estúdio</h2>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Título</label>
        <input type="text" id="studioTitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${studio.title || ''}">
      </div>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Descrição</label>
        <textarea id="studioDesc" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6; resize:vertical;" rows="4"
          >${studio.description || ''}</textarea>
      </div>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Endereço</label>
        <input type="text" id="studioAddress" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${studio.address || ''}">
      </div>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Horário de Atendimento</label>
        <input type="text" id="studioHours" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${studio.hours || 'Segunda a Sexta: 9h - 18h'}">
      </div>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">WhatsApp (Número com DDD)</label>
        <input type="text" id="studioWhatsapp" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${studio.whatsapp || ''}" placeholder="(11) 99999-9999">
      </div>

      <button id="saveStudioBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar
      </button>
    </div>
  `;

  const saveBtn = container.querySelector('#saveStudioBtn');
  saveBtn.onclick = async () => {
    const newStudio = {
      title: container.querySelector('#studioTitle').value,
      description: container.querySelector('#studioDesc').value,
      address: container.querySelector('#studioAddress').value,
      hours: container.querySelector('#studioHours').value,
      whatsapp: container.querySelector('#studioWhatsapp').value
    };
    await saveAppData('studio', newStudio);
  };
}
