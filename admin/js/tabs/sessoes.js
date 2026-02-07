/**
 * Tab: Sessoes de Clientes
 */

import { appState } from '../state.js';
import { formatDate, copyToClipboard, resolveImagePath } from '../utils/helpers.js';

export async function renderSessoes(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Sessoes de Clientes</h2>
        <button id="addSessionBtn" style="background:#16a34a; color:white; padding:0.5rem 1rem; border-radius:0.375rem; border:none; cursor:pointer; font-weight:500;">
          + Nova Sessao
        </button>
      </div>

      <div id="sessionsList" style="display:flex; flex-direction:column; gap:0.75rem;">
        <p style="color:#9ca3af; text-align:center;">Carregando...</p>
      </div>
    </div>

    <!-- Modal Nova Sessao -->
    <div id="newSessionModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:50; display:none; align-items:center; justify-content:center;">
      <div style="background:#1f2937; border:1px solid #374151; border-radius:0.75rem; padding:1.5rem; width:24rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:1.125rem; font-weight:bold; color:#f3f4f6;">Nova Sessao</h3>
        <div>
          <label style="display:block; font-size:0.75rem; color:#9ca3af; margin-bottom:0.25rem;">Nome do Cliente</label>
          <input type="text" id="sessionName" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;" placeholder="Ex: Maria Silva">
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; color:#9ca3af; margin-bottom:0.25rem;">Tipo</label>
          <select id="sessionType" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;">
            <option value="Familia">Familia</option>
            <option value="Casamento">Casamento</option>
            <option value="Evento">Evento</option>
            <option value="Ensaio">Ensaio</option>
            <option value="Corporativo">Corporativo</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; color:#9ca3af; margin-bottom:0.25rem;">Data</label>
          <input type="date" id="sessionDate" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;">
        </div>
        <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
          <button id="cancelNewSession" style="padding:0.5rem 1rem; color:#9ca3af; background:none; border:1px solid #374151; border-radius:0.375rem; cursor:pointer;">Cancelar</button>
          <button id="confirmNewSession" style="padding:0.5rem 1rem; background:#16a34a; color:white; border:none; border-radius:0.375rem; cursor:pointer; font-weight:600;">Criar</button>
        </div>
      </div>
    </div>

    <!-- Modal Ver Fotos -->
    <div id="sessionPhotosModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:50; flex-direction:column;">
      <div style="background:#1f2937; border-bottom:1px solid #374151; padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
        <h3 id="photosModalTitle" style="font-size:1.125rem; font-weight:bold; color:#f3f4f6;">Fotos da Sessao</h3>
        <div style="display:flex; gap:0.75rem;">
          <label id="uploadMoreBtn" style="padding:0.5rem 1rem; background:#2563eb; color:white; border-radius:0.375rem; cursor:pointer; font-weight:600; font-size:0.875rem;">
            + Upload
            <input type="file" id="sessionUploadInput" accept="image/*" multiple style="display:none;">
          </label>
          <button id="closePhotosModal" style="padding:0.5rem 1rem; color:#9ca3af; background:none; border:1px solid #374151; border-radius:0.375rem; cursor:pointer;">Fechar</button>
        </div>
      </div>
      <div style="flex:1; overflow-y:auto; padding:1.5rem;">
        <div id="sessionPhotosGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.75rem;">
        </div>
      </div>
    </div>
  `;

  // Carrega sessoes
  let sessionsData = [];
  try {
    const response = await fetch('/api/sessions', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });

    if (!response.ok) throw new Error('Erro ao carregar');

    const result = await response.json();
    sessionsData = result.sessions || [];
    const list = container.querySelector('#sessionsList');

    if (sessionsData.length > 0) {
      list.innerHTML = sessionsData.map(session => `
        <div style="border:1px solid #374151; border-radius:0.75rem; padding:1rem; background:#1f2937;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <strong style="color:#f3f4f6; font-size:1.125rem;">${session.name}</strong>
              <span style="color:#9ca3af; font-size:0.875rem; margin-left:0.5rem;">${session.type}</span>
              <div style="color:#9ca3af; font-size:0.75rem; margin-top:0.25rem;">${formatDate(session.date)} • ${session.photos?.length || 0} fotos</div>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button onclick="viewSessionPhotos('${session._id}')" style="background:#2563eb; color:white; padding:0.375rem 0.75rem; border-radius:0.375rem; border:none; cursor:pointer; font-size:0.75rem; font-weight:500;">
                Ver Fotos
              </button>
              <button onclick="copySessionCode('${session.accessCode}')" style="background:#374151; color:#d1d5db; padding:0.375rem 0.75rem; border-radius:0.375rem; border:none; cursor:pointer; font-size:0.75rem;" title="Copiar codigo">
                📋 Codigo
              </button>
              <button onclick="deleteSession('${session._id}')" style="background:#7f1d1d; color:#fca5a5; padding:0.375rem 0.5rem; border-radius:0.375rem; border:none; cursor:pointer; font-size:0.75rem;" title="Deletar">
                🗑️
              </button>
            </div>
          </div>
          <div style="font-size:0.75rem; background:#111827; border-radius:0.25rem; padding:0.375rem 0.75rem; font-family:monospace; color:#60a5fa; margin-top:0.5rem;">
            Codigo: ${session.accessCode}
          </div>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p style="color:#9ca3af; text-align:center; padding:2rem;">Nenhuma sessao criada</p>';
    }
  } catch (error) {
    const list = container.querySelector('#sessionsList');
    if (list) list.innerHTML = `<p style="color:#f87171;">${error.message}</p>`;
  }

  // Nova sessao - modal
  const newSessionModal = container.querySelector('#newSessionModal');
  container.querySelector('#addSessionBtn').onclick = () => {
    newSessionModal.style.display = 'flex';
  };

  container.querySelector('#cancelNewSession').onclick = () => {
    newSessionModal.style.display = 'none';
  };

  container.querySelector('#confirmNewSession').onclick = async () => {
    const name = container.querySelector('#sessionName').value.trim();
    const type = container.querySelector('#sessionType').value;
    const date = container.querySelector('#sessionDate').value;

    if (!name) { alert('Nome obrigatorio'); return; }
    if (!date) { alert('Data obrigatoria'); return; }

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
      newSessionModal.style.display = 'none';
      alert(`Sessao criada!\nCodigo de acesso: ${session.accessCode}`);
      await renderSessoes(container);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  // Copiar codigo
  window.copySessionCode = (code) => {
    copyToClipboard(code);
  };

  // Ver fotos da sessao
  let currentSessionId = null;
  window.viewSessionPhotos = async (sessionId) => {
    currentSessionId = sessionId;
    const session = sessionsData.find(s => s._id === sessionId);
    if (!session) return;

    const modal = container.querySelector('#sessionPhotosModal');
    const title = container.querySelector('#photosModalTitle');
    const grid = container.querySelector('#sessionPhotosGrid');

    title.textContent = `Fotos - ${session.name}`;
    const photos = session.photos || [];

    if (photos.length > 0) {
      grid.innerHTML = photos.map((photo, idx) => `
        <div style="position:relative; aspect-ratio:3/4; background:#374151; border-radius:0.5rem; overflow:hidden;">
          <img src="${resolveImagePath(photo.url)}" alt="Foto ${idx + 1}" style="width:100%; height:100%; object-fit:cover;">
          <div style="position:absolute; inset:0; background:rgba(0,0,0,0.4); opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;"
            onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0'">
            <button onclick="deleteSessionPhoto('${sessionId}', '${photo.id}')" style="background:#ef4444; color:white; padding:0.5rem; border-radius:9999px; border:none; cursor:pointer;" title="Remover">
              🗑️
            </button>
          </div>
          <div style="position:absolute; bottom:0.25rem; left:0.25rem; background:rgba(0,0,0,0.7); color:white; font-size:0.625rem; padding:0.125rem 0.375rem; border-radius:0.25rem;">${idx + 1}</div>
        </div>
      `).join('');
    } else {
      grid.innerHTML = '<p style="color:#9ca3af; text-align:center; grid-column:1/-1; padding:3rem;">Nenhuma foto. Use o botao Upload acima.</p>';
    }

    modal.style.display = 'flex';
  };

  // Fechar modal de fotos
  container.querySelector('#closePhotosModal').onclick = () => {
    container.querySelector('#sessionPhotosModal').style.display = 'none';
    currentSessionId = null;
  };

  // Upload de fotos na sessao
  container.querySelector('#sessionUploadInput').onchange = async (e) => {
    if (!currentSessionId) return;
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('photos', file);
      await fetch(`/api/sessions/${currentSessionId}/photos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${appState.authToken}` },
        body: formData
      });
    }

    e.target.value = '';
    // Recarregar sessoes e reabrir modal
    await renderSessoes(container);
    viewSessionPhotos(currentSessionId);
  };

  // Deletar foto individual
  window.deleteSessionPhoto = async (sessionId, photoId) => {
    if (!confirm('Remover esta foto?')) return;
    try {
      await fetch(`/api/sessions/${sessionId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${appState.authToken}` }
      });
      await renderSessoes(container);
      viewSessionPhotos(sessionId);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  // Deletar sessao
  window.deleteSession = async (sessionId) => {
    if (!confirm('Tem certeza que deseja deletar esta sessao e todas as fotos?')) return;
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
