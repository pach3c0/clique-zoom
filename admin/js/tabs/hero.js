/**
 * Tab: Hero / Capa
 */

import { appState, saveAppData } from '../app.js';
import { uploadImage, showUploadProgress } from '../utils/upload.js';

export async function renderHero(container) {
  const hero = appState.appData.hero || {};
  
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">Hero / Capa</h2>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Título Principal</label>
          <input type="text" id="heroTitle" class="w-full border rounded px-3 py-2" 
            value="${hero.title || ''}" placeholder="Ex: CLIQUE·ZOOM">
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Subtítulo</label>
          <input type="text" id="heroSubtitle" class="w-full border rounded px-3 py-2" 
            value="${hero.subtitle || ''}" placeholder="Ex: Fotografia Profissional">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Imagem de Fundo</label>
        <input type="file" id="heroImage" accept="image/*" class="w-full">
        <div id="heroUploadProgress"></div>
        ${hero.image ? `<div class="mt-2 text-sm text-green-600">✅ Imagem configurada</div>` : ''}
      </div>
      
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Escala (Zoom)</label>
          <input type="range" id="heroScale" class="w-full" min="0.5" max="2" step="0.1" 
            value="${hero.imageScale || 1}">
          <span id="scaleValue" class="text-xs">1x</span>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Posição X</label>
          <input type="range" id="heroPosX" class="w-full" min="0" max="100" step="5" 
            value="${hero.imagePosX || 50}">
          <span id="posXValue" class="text-xs">50%</span>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Posição Y</label>
          <input type="range" id="heroPosY" class="w-full" min="0" max="100" step="5" 
            value="${hero.imagePosY || 50}">
          <span id="posYValue" class="text-xs">50%</span>
        </div>
      </div>
      
      <button id="saveHeroBtn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Salvar
      </button>
      
      <div id="preview" class="border rounded h-64 bg-gray-100 overflow-hidden">
        <p class="text-center text-gray-500 py-32">Preview</p>
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
      preview.innerHTML = `<div class="h-full flex items-center justify-center text-white text-3xl font-bold text-center" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">${titleInput.value}</div>`;
    }
  }
  
  // Primeira atualização do preview
  updatePreview();
}
