/**
 * Tab: Rodapé
 */

import { appState, saveAppData } from '../state.js';

export async function renderFooter(container) {
  const footer = appState.appData.footer || {
    company: '',
    socialLinks: { instagram: '', facebook: '', whatsapp: '' },
    address: '',
    phone: '',
    email: ''
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Rodapé</h2>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Empresa / Copyright</label>
        <input type="text" id="footerCompany" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${footer.company || 'CLIQUE·ZOOM © 2025'}">
      </div>

      <fieldset style="border:1px solid #374151; border-radius:0.375rem; padding:1rem;">
        <legend style="font-weight:bold; color:#f3f4f6; padding:0 0.5rem;">Redes Sociais</legend>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <input type="text" id="instagram" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${footer.socialLinks?.instagram || ''}" placeholder="Instagram URL">
          <input type="text" id="facebook" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${footer.socialLinks?.facebook || ''}" placeholder="Facebook URL">
          <input type="text" id="whatsapp" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${footer.socialLinks?.whatsapp || ''}" placeholder="WhatsApp">
        </div>
      </fieldset>

      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Endereço</label>
        <input type="text" id="footerAddress" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${footer.address || ''}">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Telefone</label>
          <input type="text" id="footerPhone" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${footer.phone || ''}">
        </div>
        <div>
          <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Email</label>
          <input type="email" id="footerEmail" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
            value="${footer.email || ''}">
        </div>
      </div>

      <button id="saveFooterBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
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
