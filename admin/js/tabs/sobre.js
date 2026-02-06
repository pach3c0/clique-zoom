/**
 * Tab: Sobre
 */

import { appState, saveAppData } from '../state.js';
import { uploadImage, showUploadProgress } from '../utils/upload.js';

export async function renderSobre(container) {
  const about = appState.appData.about || {};

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Sobre</h2>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Título</label>
        <input type="text" id="aboutTitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${about.title || ''}">
      </div>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Descrição</label>
        <textarea id="aboutText" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6; height:8rem; resize:vertical;"
          rows="5">${about.text || ''}</textarea>
      </div>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Imagem</label>
        <input type="file" id="aboutImage" accept="image/*" style="width:100%; color:#d1d5db;">
        <div id="aboutUploadProgress"></div>
        ${about.image ? '<div style="margin-top:0.5rem; font-size:0.875rem; color:#34d399;">Imagem configurada</div>' : ''}
      </div>

      <button id="saveAboutBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar
      </button>
    </div>
  `;

  const titleInput = container.querySelector('#aboutTitle');
  const textInput = container.querySelector('#aboutText');
  const imageInput = container.querySelector('#aboutImage');
  const saveBtn = container.querySelector('#saveAboutBtn');

  imageInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, appState.authToken, (percent) => {
        showUploadProgress('aboutUploadProgress', percent);
      });
      about.image = result.url;
      e.target.value = '';
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  saveBtn.onclick = async () => {
    const newAbout = {
      title: titleInput.value,
      text: textInput.value,
      image: about.image || ''
    };
    await saveAppData('about', newAbout);
  };
}
