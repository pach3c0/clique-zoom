/**
 * Tab: Estudio
 */

import { appState, saveAppData } from '../state.js';
import { resolveImagePath, generateId } from '../utils/helpers.js';
import { uploadImage, showUploadProgress } from '../utils/upload.js';

let editingStudioPhoto = null;

export async function renderEstudio(container) {
  const studio = appState.appData.studio || {};
  if (!studio.photos) studio.photos = [];
  if (!studio.whatsappMessages) studio.whatsappMessages = [{ text: 'Olá! Como posso ajudar você hoje?', delay: 5 }];

  // Grid de fotos do estúdio
  let photosHtml = '';
  studio.photos.forEach((p, idx) => {
    const posX = p.posX ?? 50;
    const posY = p.posY ?? 50;
    const scale = p.scale ?? 1;
    photosHtml += `
      <div class="studio-photo-item" draggable="true" data-index="${idx}"
        style="position:relative; aspect-ratio:16/9; background:#374151; border-radius:0.5rem; overflow:hidden; cursor:move;">
        <img src="${resolveImagePath(p.image)}" alt="Estudio ${idx + 1}"
          style="width:100%; height:100%; object-fit:cover; pointer-events:none; object-position:${posX}% ${posY}%; transform:scale(${scale});">
        <div class="studio-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
          <button onclick="event.stopPropagation(); openStudioEditor(${idx})" style="background:#3b82f6; color:white; padding:0.5rem; border-radius:9999px; border:none; cursor:pointer;" title="Ajustar">
            ✏️
          </button>
          <button onclick="event.stopPropagation(); deleteStudioPhoto(${idx})" style="background:#ef4444; color:white; padding:0.5rem; border-radius:9999px; border:none; cursor:pointer;" title="Remover">
            🗑️
          </button>
        </div>
        <div style="position:absolute; bottom:0.5rem; left:0.5rem; background:rgba(0,0,0,0.7); color:white; font-size:0.75rem; padding:0.125rem 0.5rem; border-radius:0.25rem;">${idx + 1}</div>
      </div>
    `;
  });

  // Mensagens WhatsApp
  let whatsappHtml = '';
  studio.whatsappMessages.forEach((msg, idx) => {
    whatsappHtml += `
      <div style="display:flex; gap:0.75rem; align-items:flex-start; padding:1rem; background:#111827; border-radius:0.5rem; border:1px solid #374151;">
        <div style="width:2rem; height:2rem; background:#22c55e; color:white; border-radius:9999px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.875rem; flex-shrink:0;">
          ${idx + 1}
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:0.5rem;">
          <textarea style="width:100%; padding:0.5rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6; font-size:0.875rem; resize:none;" rows="2"
            data-whatsapp-text="${idx}" placeholder="Digite a mensagem...">${msg.text}</textarea>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <label style="font-size:0.75rem; color:#9ca3af;">Delay (seg):</label>
            <input type="number" data-whatsapp-delay="${idx}" value="${msg.delay}" min="1" max="60"
              style="width:4rem; padding:0.25rem 0.5rem; border:1px solid #374151; border-radius:0.25rem; background:#1f2937; color:#f3f4f6; font-size:0.875rem;">
          </div>
        </div>
        <button onclick="removeWhatsappMessage(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer; font-size:1rem; padding:0.25rem;" title="Remover">🗑️</button>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Estudio</h2>

      <!-- Apresentacao -->
      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:1rem; font-weight:600; color:#d1d5db;">Apresentacao</h3>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Titulo</label>
          <input type="text" id="studioTitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;"
            value="${studio.title || ''}">
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Descricao</label>
          <textarea id="studioDesc" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6; resize:vertical;" rows="3"
            >${studio.description || ''}</textarea>
        </div>
      </div>

      <!-- Informacoes -->
      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:1rem; font-weight:600; color:#d1d5db;">Informacoes</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Endereco</label>
            <input type="text" id="studioAddress" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;"
              value="${studio.address || ''}">
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">WhatsApp (com DDD)</label>
            <input type="text" id="studioWhatsapp" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;"
              value="${studio.whatsapp || ''}" placeholder="5511999999999">
          </div>
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Horario de Atendimento</label>
          <textarea id="studioHours" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6; resize:vertical;" rows="2"
            >${studio.hours || ''}</textarea>
        </div>
      </div>

      <!-- Mensagens WhatsApp -->
      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size:1rem; font-weight:600; color:#d1d5db;">Mensagens do WhatsApp</h3>
            <p style="font-size:0.75rem; color:#9ca3af;">Mensagens que aparecem na bolha flutuante em sequencia</p>
          </div>
          <button id="addWhatsappMsgBtn" style="background:#22c55e; color:white; padding:0.375rem 0.75rem; border-radius:0.375rem; border:none; cursor:pointer; font-size:0.875rem; font-weight:500;">
            + Nova Mensagem
          </button>
        </div>
        <div id="whatsappList" style="display:flex; flex-direction:column; gap:0.5rem;">
          ${whatsappHtml}
        </div>
      </div>

      <!-- Fotos do Estudio -->
      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size:1rem; font-weight:600; color:#d1d5db;">Fotos do Estudio</h3>
            <p style="font-size:0.75rem; color:#9ca3af;">Passe o mouse para editar ou remover</p>
          </div>
          <label style="background:#2563eb; color:white; padding:0.375rem 0.75rem; border-radius:0.375rem; font-size:0.875rem; font-weight:600; cursor:pointer;">
            Upload de Fotos
            <input type="file" accept=".jpg,.jpeg,.png" multiple id="studioUploadInput" style="display:none;">
          </label>
        </div>
        <div id="studioUploadProgress"></div>
        <div id="studioPhotosGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:0.75rem;">
          ${photosHtml}
        </div>
        ${studio.photos.length === 0 ? '<p style="color:#9ca3af; text-align:center; padding:2rem;">Nenhuma foto. Use o botao acima para adicionar.</p>' : ''}
      </div>

      <button id="saveStudioBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar Tudo
      </button>
    </div>

    <!-- Modal Editor de Foto -->
    <div id="studioEditorModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:50; flex-direction:column;">
      <div style="background:#1f2937; border-bottom:1px solid #374151; padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:1.125rem; font-weight:bold; color:#f3f4f6;">Editor de Enquadramento</h3>
        <div style="display:flex; gap:0.75rem;">
          <button id="studioEditorCancel" style="padding:0.5rem 1rem; color:#9ca3af; background:none; border:1px solid #374151; border-radius:0.375rem; cursor:pointer;">Cancelar</button>
          <button id="studioEditorSave" style="padding:0.5rem 1rem; background:#2563eb; color:white; border:none; border-radius:0.375rem; cursor:pointer; font-weight:600;">Aplicar</button>
        </div>
      </div>
      <div style="flex:1; display:flex; overflow:hidden;">
        <div style="width:16rem; background:#1f2937; border-right:1px solid #374151; padding:1.5rem; overflow-y:auto;">
          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; margin-bottom:0.5rem;">Zoom</label>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="range" id="studioEditorZoom" min="1" max="2" step="0.05" value="1" style="flex:1;">
              <span id="studioEditorZoomVal" style="font-size:0.875rem; font-family:monospace; color:#f3f4f6; min-width:3rem; text-align:right;">1.00x</span>
            </div>
          </div>
          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; margin-bottom:0.5rem;">Posicao X</label>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="range" id="studioEditorPosX" min="0" max="100" step="1" value="50" style="flex:1;">
              <span id="studioEditorPosXVal" style="font-size:0.875rem; font-family:monospace; color:#f3f4f6; min-width:3rem; text-align:right;">50%</span>
            </div>
          </div>
          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; margin-bottom:0.5rem;">Posicao Y</label>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="range" id="studioEditorPosY" min="0" max="100" step="1" value="50" style="flex:1;">
              <span id="studioEditorPosYVal" style="font-size:0.875rem; font-family:monospace; color:#f3f4f6; min-width:3rem; text-align:right;">50%</span>
            </div>
          </div>
        </div>
        <div style="flex:1; display:flex; align-items:center; justify-content:center; background:#111827; padding:2rem;">
          <div style="width:100%; max-width:600px; aspect-ratio:16/9; background:#374151; border-radius:0.5rem; overflow:hidden; position:relative;">
            <img id="studioEditorImg" src="" alt="Preview" style="width:100%; height:100%; object-fit:cover;">
          </div>
        </div>
      </div>
    </div>
  `;

  // Hover nas fotos
  container.querySelectorAll('.studio-photo-item').forEach(item => {
    const overlay = item.querySelector('.studio-overlay');
    item.onmouseenter = () => { overlay.style.opacity = '1'; };
    item.onmouseleave = () => { overlay.style.opacity = '0'; };
  });

  // Upload de fotos
  container.querySelector('#studioUploadInput').onchange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      try {
        showUploadProgress('studioUploadProgress', Math.round((studio.photos.length / (studio.photos.length + files.length)) * 100));
        const result = await uploadImage(file, appState.authToken);
        studio.photos.push({ image: result.url, posX: 50, posY: 50, scale: 1 });
      } catch (error) {
        alert('Erro no upload: ' + error.message);
      }
    }

    showUploadProgress('studioUploadProgress', 100);
    e.target.value = '';
    appState.appData.studio = studio;
    await saveAppData('studio', studio);
    renderEstudio(container);
  };

  // Deletar foto
  window.deleteStudioPhoto = async (idx) => {
    if (!confirm('Remover esta foto?')) return;
    studio.photos.splice(idx, 1);
    appState.appData.studio = studio;
    await saveAppData('studio', studio);
    renderEstudio(container);
  };

  // Abrir editor
  window.openStudioEditor = (idx) => {
    editingStudioPhoto = idx;
    const photo = studio.photos[idx];
    const modal = container.querySelector('#studioEditorModal');
    const img = container.querySelector('#studioEditorImg');
    const zoomSlider = container.querySelector('#studioEditorZoom');
    const posXSlider = container.querySelector('#studioEditorPosX');
    const posYSlider = container.querySelector('#studioEditorPosY');

    img.src = resolveImagePath(photo.image);
    zoomSlider.value = photo.scale ?? 1;
    posXSlider.value = photo.posX ?? 50;
    posYSlider.value = photo.posY ?? 50;
    updateStudioPreview();
    modal.style.display = 'flex';
  };

  // Preview do editor
  const zoomSlider = container.querySelector('#studioEditorZoom');
  const posXSlider = container.querySelector('#studioEditorPosX');
  const posYSlider = container.querySelector('#studioEditorPosY');

  function updateStudioPreview() {
    const img = container.querySelector('#studioEditorImg');
    const zoom = parseFloat(zoomSlider.value);
    const px = parseInt(posXSlider.value);
    const py = parseInt(posYSlider.value);

    img.style.objectPosition = `${px}% ${py}%`;
    img.style.transform = `scale(${zoom})`;
    container.querySelector('#studioEditorZoomVal').textContent = zoom.toFixed(2) + 'x';
    container.querySelector('#studioEditorPosXVal').textContent = px + '%';
    container.querySelector('#studioEditorPosYVal').textContent = py + '%';
  }

  zoomSlider.oninput = updateStudioPreview;
  posXSlider.oninput = updateStudioPreview;
  posYSlider.oninput = updateStudioPreview;

  // Salvar editor
  container.querySelector('#studioEditorSave').onclick = async () => {
    if (editingStudioPhoto === null) return;
    studio.photos[editingStudioPhoto].posX = parseInt(posXSlider.value);
    studio.photos[editingStudioPhoto].posY = parseInt(posYSlider.value);
    studio.photos[editingStudioPhoto].scale = parseFloat(parseFloat(zoomSlider.value).toFixed(2));

    appState.appData.studio = studio;
    await saveAppData('studio', studio);
    container.querySelector('#studioEditorModal').style.display = 'none';
    editingStudioPhoto = null;
    renderEstudio(container);
  };

  // Cancelar editor
  container.querySelector('#studioEditorCancel').onclick = () => {
    container.querySelector('#studioEditorModal').style.display = 'none';
    editingStudioPhoto = null;
  };

  // Adicionar mensagem WhatsApp
  container.querySelector('#addWhatsappMsgBtn').onclick = () => {
    studio.whatsappMessages.push({ text: '', delay: 5 });
    renderEstudio(container);
  };

  // Remover mensagem WhatsApp
  window.removeWhatsappMessage = (idx) => {
    studio.whatsappMessages.splice(idx, 1);
    renderEstudio(container);
  };

  // Salvar tudo
  container.querySelector('#saveStudioBtn').onclick = async () => {
    const msgs = [];
    container.querySelectorAll('[data-whatsapp-text]').forEach((textarea, idx) => {
      msgs.push({
        text: textarea.value,
        delay: parseInt(container.querySelector(`[data-whatsapp-delay="${idx}"]`)?.value || 5)
      });
    });

    const newStudio = {
      title: container.querySelector('#studioTitle').value,
      description: container.querySelector('#studioDesc').value,
      address: container.querySelector('#studioAddress').value,
      hours: container.querySelector('#studioHours').value,
      whatsapp: container.querySelector('#studioWhatsapp').value,
      whatsappMessages: msgs,
      photos: studio.photos
    };

    appState.appData.studio = newStudio;
    await saveAppData('studio', newStudio);
  };
}
