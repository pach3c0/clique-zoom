/**
 * Tab: Estúdio
 */

import { appState, saveAppData } from '../app.js';

export async function renderEstudio(container) {
  const studio = appState.appData.studio || {};
  
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">Estúdio</h2>
      
      <div>
        <label class="block text-sm font-medium mb-2">Título</label>
        <input type="text" id="studioTitle" class="w-full border rounded px-3 py-2" 
          value="${studio.title || ''}">
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Descrição</label>
        <textarea id="studioDesc" class="w-full border rounded px-3 py-2" rows="4"
          >${studio.description || ''}</textarea>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Endereço</label>
        <input type="text" id="studioAddress" class="w-full border rounded px-3 py-2" 
          value="${studio.address || ''}">
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Horário de Atendimento</label>
        <input type="text" id="studioHours" class="w-full border rounded px-3 py-2" 
          value="${studio.hours || 'Segunda a Sexta: 9h - 18h'}">
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">WhatsApp (Número com DDD)</label>
        <input type="text" id="studioWhatsapp" class="w-full border rounded px-3 py-2" 
          value="${studio.whatsapp || ''}" placeholder="(11) 99999-9999">
      </div>
      
      <button id="saveStudioBtn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
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
