/**
 * Tab: Álbuns
 */

import { appState, saveAppData } from '../app.js';
import { generateId } from '../utils/helpers.js';

export async function renderAlbuns(container) {
  const albums = appState.appData.albums || [];
  
  let html = `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Álbuns</h2>
        <button id="addAlbumBtn" class="bg-green-600 text-white px-4 py-2 rounded">
          + Adicionar
        </button>
      </div>
      
      <div id="albumList" class="space-y-2">
  `;
  
  albums.forEach((album, index) => {
    html += `
      <div class="border rounded p-4 bg-gray-50 flex justify-between items-center">
        <div class="flex-1">
          <input type="text" class="w-full font-bold border rounded px-2 py-1" 
            value="${album.name || ''}" data-album-name="${index}">
          <input type="number" class="w-full border rounded px-2 py-1 mt-2" 
            value="${album.photoCount || 0}" data-album-count="${index}" placeholder="Qtd de fotos">
        </div>
        <button onclick="deleteAlbum(${index})" class="text-red-600 ml-4">🗑️</button>
      </div>
    `;
  });
  
  html += `
      </div>
      <button id="saveAlbumsBtn" class="bg-blue-600 text-white px-6 py-2 rounded">
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
