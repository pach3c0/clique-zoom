/**
 * Tab: Álbuns
 */

import { appState, saveAppData } from '../state.js';
import { generateId } from '../utils/helpers.js';

export async function renderAlbuns(container) {
  const albums = appState.appData.albums || [];

  let html = `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Álbuns</h2>
        <button id="addAlbumBtn" style="background:#16a34a; color:white; padding:0.5rem 1rem; border-radius:0.375rem; border:none; cursor:pointer; font-weight:500;">
          + Adicionar
        </button>
      </div>

      <div id="albumList" style="display:flex; flex-direction:column; gap:0.5rem;">
  `;

  albums.forEach((album, index) => {
    html += `
      <div style="border:1px solid #374151; border-radius:0.375rem; padding:1rem; background:#1f2937; display:flex; justify-content:space-between; align-items:center;">
        <div style="flex:1;">
          <input type="text" style="width:100%; font-weight:bold; border:1px solid #374151; border-radius:0.25rem; padding:0.25rem 0.5rem; background:#111827; color:#f3f4f6;"
            value="${album.name || ''}" data-album-name="${index}">
          <input type="number" style="width:100%; border:1px solid #374151; border-radius:0.25rem; padding:0.25rem 0.5rem; margin-top:0.5rem; background:#111827; color:#f3f4f6;"
            value="${album.photoCount || 0}" data-album-count="${index}" placeholder="Qtd de fotos">
        </div>
        <button onclick="deleteAlbum(${index})" style="color:#ef4444; margin-left:1rem; background:none; border:none; cursor:pointer; font-size:1.25rem;">🗑️</button>
      </div>
    `;
  });

  html += `
      </div>
      <button id="saveAlbumsBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar Álbuns
      </button>
    </div>
  `;

  container.innerHTML = html;

  window.deleteAlbum = (index) => {
    albums.splice(index, 1);
    renderAlbuns(container);
  };

  container.querySelector('#addAlbumBtn').onclick = () => {
    albums.push({ id: generateId(), name: 'Novo Álbum', photoCount: 0 });
    renderAlbuns(container);
  };

  container.querySelector('#saveAlbumsBtn').onclick = async () => {
    const updated = [];
    container.querySelectorAll('[data-album-name]').forEach((input, index) => {
      updated.push({
        id: albums[index]?.id || generateId(),
        name: input.value,
        photoCount: parseInt(container.querySelector(`[data-album-count="${index}"]`)?.value || 0)
      });
    });
    await saveAppData('albums', updated);
  };
}
