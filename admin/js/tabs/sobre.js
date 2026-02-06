/**
 * Tab: Sobre
 */

import { appState, saveAppData } from '../app.js';
import { uploadImage, showUploadProgress } from '../utils/upload.js';

export async function renderSobre(container) {
  const about = appState.appData.about || {};
  
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">Sobre</h2>
      
      <div>
        <label class="block text-sm font-medium mb-2">Título</label>
        <input type="text" id="aboutTitle" class="w-full border rounded px-3 py-2" 
          value="${about.title || ''}">
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Descrição</label>
        <textarea id="aboutText" class="w-full border rounded px-3 py-2 h-32" 
          rows="5">${about.text || ''}</textarea>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Imagem</label>
        <input type="file" id="aboutImage" accept="image/*" class="w-full">
        <div id="aboutUploadProgress"></div>
      </div>
      
      <button id="saveAboutBtn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
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
      alert('❌ Erro: ' + error.message);
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
