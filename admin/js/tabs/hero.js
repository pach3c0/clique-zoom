/**
 * Tab: Hero / Capa
 */

import { appState, saveAppData } from '../state.js';
import { uploadImage, showUploadProgress } from '../utils/upload.js';

export async function renderHero(container) {
  const hero = appState.appData.hero || {};
  
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Hero / Capa</h2>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Titulo Principal</label>
          <input type="text" id="heroTitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${hero.title || ''}" placeholder="Ex: CLIQUE·ZOOM">
        </div>
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Subtitulo</label>
          <input type="text" id="heroSubtitle" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${hero.subtitle || ''}" placeholder="Ex: Fotografia Profissional">
        </div>
      </div>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Imagem de Fundo</label>
        <input type="file" id="heroImage" accept="image/*" style="width:100%; color:#d1d5db;">
        <div id="heroUploadProgress"></div>
        ${hero.image ? '<div style="margin-top:0.5rem; font-size:0.875rem; color:#34d399;">Imagem configurada</div>' : ''}
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Escala (Zoom)</label>
          <input type="range" id="heroScale" style="width:100%;" min="0.5" max="2" step="0.1" value="${hero.imageScale || 1}">
          <span id="scaleValue" style="font-size:0.75rem; color:#9ca3af;">${hero.imageScale || 1}x</span>
        </div>
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Posicao X</label>
          <input type="range" id="heroPosX" style="width:100%;" min="0" max="100" step="5" value="${hero.imagePosX || 50}">
          <span id="posXValue" style="font-size:0.75rem; color:#9ca3af;">${hero.imagePosX || 50}%</span>
        </div>
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Posicao Y</label>
          <input type="range" id="heroPosY" style="width:100%;" min="0" max="100" step="5" value="${hero.imagePosY || 50}">
          <span id="posYValue" style="font-size:0.75rem; color:#9ca3af;">${hero.imagePosY || 50}%</span>
        </div>
      </div>

      <button id="saveHeroBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar
      </button>

      <div id="preview" style="border:1px solid #374151; border-radius:0.375rem; height:16rem; background:#1f2937; overflow:hidden;">
        <p style="text-align:center; color:#9ca3af; padding-top:8rem;">Preview</p>
      </div>
    </div>
  `;
  
  // Event listeners
  const titleInput = container.querySelector('#heroTitle');
  const subtitleInput = container.querySelector('#heroSubtitle');
  const imageInput = container.querySelector('#heroImage');
  const scaleInput = container.querySelector('#heroScale');
  const posXInput = container.querySelector('#heroPosX');
  const posYInput = container.querySelector('#heroPosY');
  const saveBtn = container.querySelector('#saveHeroBtn');
  
  const scaleValue = container.querySelector('#scaleValue');
  const posXValue = container.querySelector('#posXValue');
  const posYValue = container.querySelector('#posYValue');
  
  // Atualiza preview em tempo real
  scaleInput.oninput = () => {
    scaleValue.textContent = scaleInput.value + 'x';
    updatePreview();
  };
  posXInput.oninput = () => {
    posXValue.textContent = posXInput.value + '%';
    updatePreview();
  };
  posYInput.oninput = () => {
    posYValue.textContent = posYInput.value + '%';
    updatePreview();
  };
  
  // Upload de imagem
  imageInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await uploadImage(file, appState.authToken, (percent) => {
        showUploadProgress('heroUploadProgress', percent);
      });
      
      hero.image = result.url;
      updatePreview();
      e.target.value = '';
    } catch (error) {
      alert('❌ Erro no upload: ' + error.message);
    }
  };
  
  // Salvar
  saveBtn.onclick = async () => {
    const newHero = {
      title: titleInput.value,
      subtitle: subtitleInput.value,
      image: hero.image || '',
      imageScale: parseFloat(scaleInput.value),
      imagePosX: parseInt(posXInput.value),
      imagePosY: parseInt(posYInput.value)
    };
    
    await saveAppData('hero', newHero);
  };
  
  function updatePreview() {
    const preview = container.querySelector('#preview');
    const image = hero.image || '';
    
    if (image) {
      preview.style.backgroundImage = `url('${image}')`;
      preview.style.backgroundPosition = `${posXInput.value}% ${posYInput.value}%`;
      preview.style.backgroundSize = `${scaleInput.value * 100}%`;
      preview.style.backgroundRepeat = 'no-repeat';
      preview.innerHTML = `<div style="height:100%; display:flex; align-items:center; justify-content:center; color:white; font-size:1.875rem; font-weight:bold; text-align:center; text-shadow:2px 2px 4px rgba(0,0,0,0.7);">${titleInput.value}</div>`;
    }
  }
  
  // Primeira atualização do preview
  updatePreview();
}
