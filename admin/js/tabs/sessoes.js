/**
 * Tab: Sessões de Clientes
 */

import { appState } from '../state.js';
import { formatDate, copyToClipboard } from '../utils/helpers.js';

export async function renderSessoes(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Sessões de Clientes</h2>
        <button id="addSessionBtn" style="background:#16a34a; color:white; padding:0.5rem 1rem; border-radius:0.375rem; border:none; cursor:pointer; font-weight:500;">
          + Nova Sessão
        </button>
      </div>

      <div id="sessionsList" style="display:flex; flex-direction:column; gap:0.5rem;">
        <p style="color:#9ca3af; text-align:center;">Carregando...</p>
      </div>
    </div>
  `;

  // Carrega sessões
  try {
    const response = await fetch('/api/sessions', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });

    if (!response.ok) throw new Error('Erro ao carregar');

    const result = await response.json();
    const sessions = result.sessions || [];
    const list = container.querySelector('#sessionsList');

    if (sessions.length > 0) {
      list.innerHTML = sessions.map(session => `
        <div style="border:1px solid #374151; border-radius:0.375rem; padding:1rem; background:#1f2937;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <div>
              <strong style="color:#f3f4f6;">${session.name}</strong> <span style="color:#9ca3af;">(${session.type})</span>
              <br><small style="color:#9ca3af;">${formatDate(session.date)} • ${session.photos?.length || 0} fotos</small>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button onclick="copyToClipboard('${session.accessCode}')" title="Copiar código" style="background:none; border:none; cursor:pointer; font-size:1rem;">📋</button>
              <button onclick="editSession('${session._id}')" style="color:#60a5fa; background:none; border:none; cursor:pointer;">Editar</button>
              <button onclick="deleteSession('${session._id}')" style="color:#ef4444; background:none; border:none; cursor:pointer;">Deletar</button>
            </div>
          </div>
          <div style="font-size:0.875rem; background:#111827; border-radius:0.25rem; padding:0.25rem 0.5rem; font-family:monospace; color:#d1d5db;">Código: ${session.accessCode}</div>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p style="color:#9ca3af; text-align:center;">Nenhuma sessão criada</p>';
    }
  } catch (error) {
    const list = container.querySelector('#sessionsList');
    if (list) list.innerHTML = `<p style="color:#f87171;">${error.message}</p>`;
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
      alert('Data inválida');
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
        alert('Fotos enviadas!');
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
      alert('Erro: ' + error.message);
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

    const result = await response.json();
    const session = result.session || result;
    alert(`Sessão criada!\nCódigo de acesso: ${session.accessCode}`);
    await renderSessoes(container);
  } catch (error) {
    alert('Erro: ' + error.message);
  }
}
