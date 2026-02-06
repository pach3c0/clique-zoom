/**
 * Tab: Newsletter
 */

import { appState } from '../app.js';

export async function renderNewsletter(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold">Newsletter</h2>
      <p class="text-gray-600">Inscritos na newsletter</p>
      
      <div id="newsletterList" class="space-y-2 border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <p class="text-gray-500 text-center">Carregando...</p>
      </div>
      
      <button id="exportBtn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        📥 Exportar CSV
      </button>
    </div>
  `;
  
  // Carrega lista de inscritos
  try {
    const response = await fetch('/api/newsletter', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });
    
    if (!response.ok) throw new Error('Erro ao carregar');
    
    const data = await response.json();
    const list = container.querySelector('#newsletterList');
    
    if (data.subscribers && data.subscribers.length > 0) {
      list.innerHTML = data.subscribers.map((sub, idx) => `
        <div class="flex justify-between items-center bg-white p-2 rounded">
          <span>${sub.email}</span>
          <button onclick="deleteNewsletter('${sub._id}')" class="text-red-600 text-sm">🗑️</button>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p class="text-gray-500 text-center">Nenhum inscritor</p>';
    }
  } catch (error) {
    container.querySelector('#newsletterList').innerHTML = `<p class="text-red-600">❌ ${error.message}</p>`;
  }
  
  // Exportar CSV
  container.querySelector('#exportBtn').onclick = async () => {
    try {
      const response = await fetch('/api/newsletter', {
        headers: { 'Authorization': `Bearer ${appState.authToken}` }
      });
      const data = await response.json();
      
      const csv = 'Email\n' + (data.subscribers?.map(s => s.email) || []).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter.csv';
      a.click();
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };
  
  window.deleteNewsletter = async (id) => {
    if (!confirm('Tem certeza?')) return;
    
    try {
      const response = await fetch(`/api/newsletter/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${appState.authToken}` }
      });
      if (response.ok) {
        await renderNewsletter(container);
      }
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };
}
