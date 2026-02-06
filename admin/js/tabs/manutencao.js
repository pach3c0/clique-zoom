/**
 * Tab: Manutenção
 */

import { appState, saveAppData } from '../app.js';

export async function renderManutencao(container) {
  const maintenance = appState.appData.maintenance || { enabled: false, title: '', message: '' };
  
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">Manutenção</h2>
      
      <div class="flex items-center gap-4">
        <input type="checkbox" id="maintenanceToggle" ${maintenance.enabled ? 'checked' : ''} 
          class="w-6 h-6">
        <label for="maintenanceToggle" class="text-lg">Ativar modo de manutenção</label>
      </div>
      
      <div id="maintenanceForm" style="display: ${maintenance.enabled ? 'block' : 'none'};">
        <div>
          <label class="block text-sm font-medium mb-2">Título</label>
          <input type="text" id="mainTitle" class="w-full border rounded px-3 py-2" 
            value="${maintenance.title || 'Site em Manutenção'}">
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Mensagem</label>
          <textarea id="mainMessage" class="w-full border rounded px-3 py-2 h-24"
            >${maintenance.message || 'Estamos realizando manutenção. Volte em breve!'}</textarea>
        </div>
        
        <button id="saveMaintenanceBtn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4">
          Salvar
        </button>
      </div>
    </div>
  `;
  
  const toggle = container.querySelector('#maintenanceToggle');
  const form = container.querySelector('#maintenanceForm');
  const saveBtn = container.querySelector('#saveMaintenanceBtn');
  
  toggle.onchange = () => {
    form.style.display = toggle.checked ? 'block' : 'none';
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
