/**
 * Tab: Portfólio
 */

import { appState, saveAppData } from '../state.js';
import { resolveImagePath, generateId } from '../utils/helpers.js';
import { uploadImage, showUploadProgress } from '../utils/upload.js';

let draggedIndex = null;
let editingPhotoIndex = null;

export async function renderPortfolio(container) {
  const portfolio = appState.appData.portfolio || [];

  let gridHtml = '';
  portfolio.forEach((p, idx) => {
    const posX = p.posX ?? 50;
    const posY = p.posY ?? 50;
    const scale = p.scale ?? 1;
    const imgSrc = resolveImagePath(p.image);

    gridHtml += `
      <div class="portfolio-item" draggable="true" data-index="${idx}"
        style="position:relative; aspect-ratio:3/4; background:#374151; border-radius:0.5rem; overflow:hidden; border:2px solid transparent; cursor:move;">
        <img src="${imgSrc}" alt="Portfolio ${idx + 1}"
          style="width:100%; height:100%; object-fit:cover; pointer-events:none; object-position:${posX}% ${posY}%; transform:scale(${scale});">
        <div class="photo-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
          <button onclick="event.stopPropagation(); openPhotoEditor(${idx})" style="background:#3b82f6; color:white; padding:0.5rem; border-radius:9999px; border:none; cursor:pointer;" title="Ajustar posição">
            ✏️
          </button>
          <button onclick="event.stopPropagation(); deletePortfolioImage(${idx})" style="background:#ef4444; color:white; padding:0.5rem; border-radius:9999px; border:none; cursor:pointer;" title="Remover">
            🗑️
          </button>
        </div>
        <div style="position:absolute; bottom:0.5rem; left:0.5rem; background:rgba(0,0,0,0.7); color:white; font-size:0.75rem; padding:0.125rem 0.5rem; border-radius:0.25rem; font-weight:500;">
          ${idx + 1}
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Portfólio</h2>
          <p style="font-size:0.875rem; color:#9ca3af;">Arraste para reordenar, passe o mouse para editar</p>
        </div>
        <label style="background:#2563eb; color:white; padding:0.5rem 1rem; border-radius:0.375rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
          Upload de Fotos
          <input type="file" accept=".jpg,.jpeg,.png" multiple id="portfolioUploadInput" style="display:none;">
        </label>
      </div>

      <div id="portfolioUploadProgress"></div>

      <div id="portfolioGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.75rem;">
        ${gridHtml}
      </div>

      ${portfolio.length === 0 ? '<p style="color:#9ca3af; text-align:center; padding:3rem 0;">Nenhuma foto no portfólio. Use o botão acima para adicionar.</p>' : ''}
    </div>

    <!-- Modal Editor de Foto -->
    <div id="photoEditorModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:50; flex-direction:column;">
      <div style="background:#1f2937; border-bottom:1px solid #374151; padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:1.125rem; font-weight:bold; color:#f3f4f6;">Editor de Enquadramento</h3>
        <div style="display:flex; gap:0.75rem;">
          <button id="editorCancelBtn" style="padding:0.5rem 1rem; color:#9ca3af; background:none; border:1px solid #374151; border-radius:0.375rem; cursor:pointer;">Cancelar</button>
          <button id="editorSaveBtn" style="padding:0.5rem 1rem; background:#2563eb; color:white; border:none; border-radius:0.375rem; cursor:pointer; font-weight:600;">Aplicar</button>
        </div>
      </div>
      <div style="flex:1; display:flex; overflow:hidden;">
        <!-- Controles -->
        <div style="width:16rem; background:#1f2937; border-right:1px solid #374151; padding:1.5rem; overflow-y:auto;">
          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; margin-bottom:0.5rem;">Zoom</label>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="range" id="editorZoom" min="1" max="2" step="0.05" value="1" style="flex:1;">
              <span id="editorZoomVal" style="font-size:0.875rem; font-family:monospace; color:#f3f4f6; min-width:3rem; text-align:right;">1.00x</span>
            </div>
          </div>
          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; margin-bottom:0.5rem;">Posição X</label>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="range" id="editorPosX" min="0" max="100" step="1" value="50" style="flex:1;">
              <span id="editorPosXVal" style="font-size:0.875rem; font-family:monospace; color:#f3f4f6; min-width:3rem; text-align:right;">50%</span>
            </div>
          </div>
          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; margin-bottom:0.5rem;">Posição Y</label>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="range" id="editorPosY" min="0" max="100" step="1" value="50" style="flex:1;">
              <span id="editorPosYVal" style="font-size:0.875rem; font-family:monospace; color:#f3f4f6; min-width:3rem; text-align:right;">50%</span>
            </div>
          </div>
        </div>
        <!-- Preview -->
        <div style="flex:1; display:flex; align-items:center; justify-content:center; background:#111827; padding:2rem;">
          <div id="editorPreview" style="width:100%; max-width:500px; aspect-ratio:3/4; background:#374151; border-radius:0.5rem; overflow:hidden; position:relative;">
            <img id="editorImg" src="" alt="Preview" style="width:100%; height:100%; object-fit:cover;">
          </div>
        </div>
      </div>
    </div>
  `;

  // Hover effect nos itens
  container.querySelectorAll('.portfolio-item').forEach(item => {
    const overlay = item.querySelector('.photo-overlay');
    item.onmouseenter = () => { overlay.style.opacity = '1'; };
    item.onmouseleave = () => { overlay.style.opacity = '0'; };
  });

  // Upload de fotos
  const uploadInput = container.querySelector('#portfolioUploadInput');
  uploadInput.onchange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let addedCount = 0;
    let errors = [];

    for (const file of files) {
      try {
        showUploadProgress('portfolioUploadProgress', Math.round((addedCount / files.length) * 100));
        const result = await uploadImage(file, appState.authToken);
        portfolio.push({ image: result.url, posX: 50, posY: 50, scale: 1 });
        addedCount++;
      } catch (error) {
        errors.push(error.message);
      }
    }

    showUploadProgress('portfolioUploadProgress', 100);
    uploadInput.value = '';

    if (addedCount > 0) {
      appState.appData.portfolio = portfolio;
      await saveAppData('portfolio', portfolio);
      renderPortfolio(container);
    }

    if (errors.length > 0) {
      alert('Erros no upload:\n' + errors.join('\n'));
    }
  };

  // Drag & Drop para reordenar
  const grid = container.querySelector('#portfolioGrid');
  grid.addEventListener('dragstart', (e) => {
    const item = e.target.closest('[data-index]');
    if (!item) return;
    draggedIndex = parseInt(item.dataset.index);
    item.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  });

  grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  grid.addEventListener('drop', async (e) => {
    e.preventDefault();
    const target = e.target.closest('[data-index]');
    if (!target || draggedIndex === null) return;

    const targetIdx = parseInt(target.dataset.index);
    if (draggedIndex === targetIdx) return;

    const item = portfolio.splice(draggedIndex, 1)[0];
    portfolio.splice(targetIdx, 0, item);

    appState.appData.portfolio = portfolio;
    await saveAppData('portfolio', portfolio);
    renderPortfolio(container);
  });

  grid.addEventListener('dragend', (e) => {
    e.target.style.opacity = '1';
    draggedIndex = null;
  });

  // Delete foto
  window.deletePortfolioImage = async (idx) => {
    if (!confirm('Remover esta foto da galeria?')) return;
    portfolio.splice(idx, 1);
    appState.appData.portfolio = portfolio;
    await saveAppData('portfolio', portfolio);
    renderPortfolio(container);
  };

  // Abrir editor de foto
  window.openPhotoEditor = (idx) => {
    editingPhotoIndex = idx;
    const photo = portfolio[idx];
    const modal = container.querySelector('#photoEditorModal');
    const img = container.querySelector('#editorImg');
    const zoomSlider = container.querySelector('#editorZoom');
    const posXSlider = container.querySelector('#editorPosX');
    const posYSlider = container.querySelector('#editorPosY');

    img.src = resolveImagePath(photo.image);
    zoomSlider.value = photo.scale ?? 1;
    posXSlider.value = photo.posX ?? 50;
    posYSlider.value = photo.posY ?? 50;

    updateEditorPreview();

    modal.style.display = 'flex';
  };

  // Controles do editor
  const zoomSlider = container.querySelector('#editorZoom');
  const posXSlider = container.querySelector('#editorPosX');
  const posYSlider = container.querySelector('#editorPosY');

  function updateEditorPreview() {
    const img = container.querySelector('#editorImg');
    const zoomVal = container.querySelector('#editorZoomVal');
    const posXVal = container.querySelector('#editorPosXVal');
    const posYVal = container.querySelector('#editorPosYVal');

    const zoom = parseFloat(zoomSlider.value);
    const px = parseInt(posXSlider.value);
    const py = parseInt(posYSlider.value);

    img.style.objectPosition = `${px}% ${py}%`;
    img.style.transform = `scale(${zoom})`;
    zoomVal.textContent = zoom.toFixed(2) + 'x';
    posXVal.textContent = px + '%';
    posYVal.textContent = py + '%';
  }

  zoomSlider.oninput = updateEditorPreview;
  posXSlider.oninput = updateEditorPreview;
  posYSlider.oninput = updateEditorPreview;

  // Salvar posição
  container.querySelector('#editorSaveBtn').onclick = async () => {
    if (editingPhotoIndex === null) return;

    portfolio[editingPhotoIndex].posX = parseInt(posXSlider.value);
    portfolio[editingPhotoIndex].posY = parseInt(posYSlider.value);
    portfolio[editingPhotoIndex].scale = parseFloat(parseFloat(zoomSlider.value).toFixed(2));

    appState.appData.portfolio = portfolio;
    await saveAppData('portfolio', portfolio);

    container.querySelector('#photoEditorModal').style.display = 'none';
    editingPhotoIndex = null;
    renderPortfolio(container);
  };

  // Cancelar editor
  container.querySelector('#editorCancelBtn').onclick = () => {
    container.querySelector('#photoEditorModal').style.display = 'none';
    editingPhotoIndex = null;
  };
}
