/**
 * Tab: Rodapé
 */

import { appState, saveAppData } from '../app.js';

export async function renderFooter(container) {
  const footer = appState.appData.footer || {
    company: '',
    socialLinks: { instagram: '', facebook: '', whatsapp: '' },
    address: '',
    phone: '',
    email: ''
  };
  
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">Rodapé</h2>
      
      <div>
        <label class="block text-sm font-medium mb-2">Empresa / Copyright</label>
        <input type="text" id="footerCompany" class="w-full border rounded px-3 py-2" 
          value="${footer.company || 'CLIQUE·ZOOM © 2025'}">
      </div>
      
      <fieldset class="border rounded p-4">
        <legend class="font-bold">Redes Sociais</legend>
        <div class="space-y-2">
          <input type="text" id="instagram" class="w-full border rounded px-3 py-2" 
            value="${footer.socialLinks?.instagram || ''}" placeholder="Instagram URL">
          <input type="text" id="facebook" class="w-full border rounded px-3 py-2" 
            value="${footer.socialLinks?.facebook || ''}" placeholder="Facebook URL">
          <input type="text" id="whatsapp" class="w-full border rounded px-3 py-2" 
            value="${footer.socialLinks?.whatsapp || ''}" placeholder="WhatsApp">
        </div>
      </fieldset>
      
      <div>
        <label class="block text-sm font-medium mb-2">Endereço</label>
        <input type="text" id="footerAddress" class="w-full border rounded px-3 py-2" 
          value="${footer.address || ''}">
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Telefone</label>
          <input type="text" id="footerPhone" class="w-full border rounded px-3 py-2" 
            value="${footer.phone || ''}">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Email</label>
          <input type="email" id="footerEmail" class="w-full border rounded px-3 py-2" 
            value="${footer.email || ''}">
        </div>
      </div>
      
      <button id="saveFooterBtn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Salvar
      </button>
    </div>
  `;
  
  const saveBtn = container.querySelector('#saveFooterBtn');
  saveBtn.onclick = async () => {
    const newFooter = {
      company: container.querySelector('#footerCompany').value,
      socialLinks: {
        instagram: container.querySelector('#instagram').value,
        facebook: container.querySelector('#facebook').value,
        whatsapp: container.querySelector('#whatsapp').value
      },
      address: container.querySelector('#footerAddress').value,
      phone: container.querySelector('#footerPhone').value,
      email: container.querySelector('#footerEmail').value
    };
    await saveAppData('footer', newFooter);
  };
}
