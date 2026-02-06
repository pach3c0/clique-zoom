/**
 * Tab: Portfólio
 */

import { appState, saveAppData } from '../state.js';
import { generateId } from '../utils/helpers.js';

export async function renderPortfolio(container) {
  const portfolio = appState.appData.portfolio || [];

  let html = `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Portfólio</h2>
        <button id="addPortfolioBtn" style="background:#16a34a; color:white; padding:0.5rem 1rem; border-radius:0.375rem; border:none; cursor:pointer; font-weight:500;">
          + Adicionar
        </button>
      </div>

      <div id="portfolioList" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
  `;

  portfolio.forEach((item, index) => {
    html += `
      <div style="border:1px solid #374151; border-radius:0.375rem; padding:1rem; background:#1f2937;">
        <input type="text" style="width:100%; font-weight:bold; border:1px solid #374151; border-radius:0.25rem; padding:0.25rem 0.5rem; margin-bottom:0.5rem; background:#111827; color:#f3f4f6;"
          value="${item.title || ''}" data-portfolio-title="${index}">
        <input type="text" style="width:100%; border:1px solid #374151; border-radius:0.25rem; padding:0.25rem 0.5rem; background:#111827; color:#f3f4f6;"
          value="${item.category || ''}" data-portfolio-category="${index}" placeholder="Categoria">
        <button onclick="deletePortfolio(${index})" style="color:#ef4444; margin-top:0.5rem; background:none; border:none; cursor:pointer;">Deletar</button>
      </div>
    `;
  });

  html += `
      </div>
      <button id="savePortfolioBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar Portfólio
      </button>
    </div>
  `;

  container.innerHTML = html;

  window.deletePortfolio = (index) => {
    portfolio.splice(index, 1);
    renderPortfolio(container);
  };

  container.querySelector('#addPortfolioBtn').onclick = () => {
    portfolio.push({ id: generateId(), title: 'Novo', category: '' });
    renderPortfolio(container);
  };

  container.querySelector('#savePortfolioBtn').onclick = async () => {
    const updated = [];
    container.querySelectorAll('[data-portfolio-title]').forEach((input, index) => {
      updated.push({
        id: portfolio[index]?.id || generateId(),
        title: input.value,
        category: container.querySelector(`[data-portfolio-category="${index}"]`)?.value || ''
      });
    });
    await saveAppData('portfolio', updated);
  };
}
