/**
 * Tab: FAQ
 */

import { appState, saveAppData } from '../app.js';
import { generateId } from '../utils/helpers.js';

export async function renderFaq(container) {
  const faqData = appState.appData.faq || { faqs: [] };
  
  let html = `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">FAQ</h2>
        <button id="addFaqBtn" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Adicionar
        </button>
      </div>
      
      <div id="faqList" class="space-y-2">
  `;
  
  faqData.faqs.forEach((faq, index) => {
    html += `
      <div class="border rounded p-4 bg-gray-50">
        <div class="flex justify-between items-start mb-2">
          <input type="text" class="flex-1 font-bold border rounded px-2 py-1" 
            value="${faq.question}" data-faq-question="${index}">
          <button class="text-red-600 ml-2" onclick="deleteFaq(${index})">🗑️</button>
        </div>
        <textarea class="w-full border rounded px-2 py-1 text-sm" rows="3" 
          data-faq-answer="${index}">${faq.answer}</textarea>
      </div>
    `;
  });
  
  html += `
      </div>
      <button id="saveFaqBtn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Salvar FAQ
      </button>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Expõe função de delete globalmente
  window.deleteFaq = (index) => {
    faqData.faqs.splice(index, 1);
    renderFaq(container);
  };
  
  // Adicionar novo FAQ
  container.querySelector('#addFaqBtn').onclick = () => {
    faqData.faqs.push({ id: generateId(), question: 'Nova pergunta', answer: '' });
    renderFaq(container);
  };
  
  // Salvar
  container.querySelector('#saveFaqBtn').onclick = async () => {
    const updated = { faqs: [] };
    
    container.querySelectorAll('[data-faq-question]').forEach((input, index) => {
      const question = input.value;
      const answer = container.querySelector(`[data-faq-answer="${index}"]`)?.value || '';
      updated.faqs.push({
        id: faqData.faqs[index]?.id || generateId(),
        question,
        answer
      });
    });
    
    await saveAppData('faq', updated);
  };
}
