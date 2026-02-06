/**
 * Tab: Sobre
 */

import { appState, saveAppData } from '../state.js';
import { resolveImagePath } from '../utils/helpers.js';
import { uploadImage, showUploadProgress } from '../utils/upload.js';

export async function renderSobre(container) {
  const about = appState.appData.about || {};
  const imgSrc = resolveImagePath(about.image);

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Sobre</h2>

      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:1rem; font-weight:600; color:#d1d5db;">Conteúdo</h3>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Título da Seção</label>
          <input type="text" id="aboutTitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;"
            value="${about.title || ''}">
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:500; color:#9ca3af; margin-bottom:0.25rem;">Texto (separe parágrafos com linha em branco)</label>
          <textarea id="aboutText" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6; height:12rem; resize:vertical;"
            rows="8">${about.text || ''}</textarea>
        </div>
      </div>

      <div style="border:1px solid #374151; border-radius:0.75rem; background:#1f2937; padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:1rem; font-weight:600; color:#d1d5db;">Imagem</h3>
        <div style="display:flex; gap:1rem; align-items:flex-start;">
          <div style="flex:1; display:flex; flex-direction:column; gap:0.5rem;">
            <input type="text" id="aboutImageUrl" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#111827; color:#f3f4f6;"
              value="${about.image || ''}" placeholder="URL da imagem">
            <label style="display:inline-block; background:#2563eb; color:white; padding:0.5rem 1rem; border-radius:0.375rem; font-size:0.875rem; font-weight:600; cursor:pointer;">
              Fazer Upload
              <input type="file" id="aboutImage" accept="image/*" style="display:none;">
            </label>
            <div id="aboutUploadProgress"></div>
          </div>
          <div style="width:8rem; height:8rem; background:#374151; border-radius:0.5rem; overflow:hidden; flex-shrink:0;">
            ${imgSrc ? `<img id="aboutPreview" src="${imgSrc}" alt="Preview" style="width:100%; height:100%; object-fit:cover;">` : `<div id="aboutPreview" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#9ca3af;">Sem imagem</div>`}
          </div>
        </div>
      </div>

      <button id="saveAboutBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar
      </button>
    </div>
  `;

  const titleInput = container.querySelector('#aboutTitle');
  const textInput = container.querySelector('#aboutText');
  const imageUrlInput = container.querySelector('#aboutImageUrl');
  const imageInput = container.querySelector('#aboutImage');
  const saveBtn = container.querySelector('#saveAboutBtn');

  // Atualizar preview ao digitar URL
  imageUrlInput.oninput = () => {
    const preview = container.querySelector('#aboutPreview');
    if (preview && preview.tagName === 'IMG') {
      preview.src = resolveImagePath(imageUrlInput.value);
    }
  };

  imageInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, appState.authToken, (percent) => {
        showUploadProgress('aboutUploadProgress', percent);
      });
      about.image = result.url;
      imageUrlInput.value = result.url;

      // Atualizar preview
      const previewContainer = container.querySelector('#aboutPreview');
      if (previewContainer) {
        if (previewContainer.tagName === 'IMG') {
          previewContainer.src = resolveImagePath(result.url);
        } else {
          previewContainer.outerHTML = `<img id="aboutPreview" src="${resolveImagePath(result.url)}" alt="Preview" style="width:100%; height:100%; object-fit:cover;">`;
        }
      }

      e.target.value = '';
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  saveBtn.onclick = async () => {
    const newAbout = {
      title: titleInput.value,
      text: textInput.value,
      image: imageUrlInput.value || about.image || ''
    };
    appState.appData.about = newAbout;
    await saveAppData('about', newAbout);
  };
}
