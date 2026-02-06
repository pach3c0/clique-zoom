/**
 * Tab: Sessões de Clientes
 */

import { appState } from '../app.js';
import { formatDate, copyToClipboard } from '../utils/helpers.js';

export async function renderSessoes(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Sessões de Clientes</h2>
        <button id="addSessionBtn" class="bg-green-600 text-white px-4 py-2 rounded">
          + Nova Sessão
        </button>
      </div>
      
      <div id="sessionsList" class="space-y-2">
        <p class="text-gray-500 text-center">Carregando...</p>
      </div>
    </div>
  `;
  
  // Carrega sessões
  try {
    const response = await fetch('/api/sessions', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });
    
    if (!response.ok) throw new Error('Erro ao carregar');
    
    const sessions = await response.json();
    const list = container.querySelector('#sessionsList');
    
    if (Array.isArray(sessions) && sessions.length > 0) {
      list.innerHTML = sessions.map(session => `
        <div class="border rounded p-4 bg-gray-50">
          <div class="flex justify-between items-center mb-2">
            <div>
              <strong>${session.name}</strong> (${session.type})
              <br><small class="text-gray-600">${formatDate(session.date)} • ${session.photos?.length || 0} fotos</small>
            </div>
            <div class="flex gap-2">
              <button onclick="copyToClipboard('${session.accessCode}')" title="Copiar código">📋</button>
              <button onclick="editSession('${session._id}')" class="text-blue-600">✏️ Editar</button>
              <button onclick="deleteSession('${session._id}')" class="text-red-600">🗑️ Deletar</button>
            </div>
          </div>
          <div class="text-sm bg-white rounded px-2 py-1 font-mono">Código: ${session.accessCode}</div>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p class="text-gray-500 text-center">Nenhuma sessão criada</p>';
    }
  } catch (error) {
    container.querySelector('#sessionsList').innerHTML = `<p class="text-red-600">❌ ${error.message}</p>`;
  }
  
  // Adicionar nova sessão
  container.querySelector('#addSessionBtn').onclick = () => {
    const name = prompt('Nome do cliente:');
    if (!name) return;
    
    const type = prompt('Tipo (Família/Casamento/Evento):');
    if (!type) return;
    
    const dateStr = prompt('Data (DD-MM-AAAA):');
    if (!dateStr) return;
    
    const [day, month, year] = dateStr.split('-');
    if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
      alert('❌ Data inválida');
      return;
    }
    
    createNewSession(name, type, `${year}-${month}-${day}`, container);
  };
  
  window.editSession = async (sessionId) => {
    const action = prompt('O que deseja fazer?\n1 - Fazer upload de fotos\n2 - Cancelar');
    if (action === '1') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        for (let file of files) {
          const formData = new FormData();
          formData.append('photos', file);
          await fetch(`/api/sessions/${sessionId}/photos`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${appState.authToken}` },
            body: formData
          });
        }
        alert('✅ Fotos enviadas!');
        await renderSessoes(container);
      };
      input.click();
    }
  };
  
  window.deleteSession = async (sessionId) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${appState.authToken}` }
      });
      if (response.ok) {
        await renderSessoes(container);
      }
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };
}

async function createNewSession(name, type, date, container) {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appState.authToken}`
      },
      body: JSON.stringify({ name, type, date })
    });
    
    if (!response.ok) throw new Error('Erro ao criar');
    
    const session = await response.json();
    alert(`✅ Sessão criada!\nCódigo de acesso: ${session.accessCode}`);
    await renderSessoes(container);
  } catch (error) {
    alert('❌ Erro: ' + error.message);
  }
}
