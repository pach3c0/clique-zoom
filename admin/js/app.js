/**
 * Aplicação Admin CLIQUE·ZOOM
 * State global e orquestração de abas
 */

import { resolveImagePath, copyToClipboard } from './utils/helpers.js';
import { uploadImage, showUploadProgress } from './utils/upload.js';

// Estado global da aplicação
export const appState = {
  authToken: localStorage.getItem('authToken') || '',
  appData: {},
  currentTab: 'hero'
};

// Referências aos módulos de tabs (importados dinamicamente)
const tabModules = {};

/**
 * Inicializa a aplicação
 */
export async function initApp() {
  console.log('🚀 Inicializando CLIQUE·ZOOM Admin...');
  
  // Verifica autenticação
  if (!appState.authToken) {
    showLoginForm();
    return;
  }
  
  // Carrega dados do servidor
  await loadAppData();
  
  // Mostra painel
  document.getElementById('loginForm')?.style.display = 'none';
  document.getElementById('adminPanel')?.style.display = 'block';
  
  // Carrega módulo da primeira aba
  await switchTab('hero');
}

/**
 * Mostra formulário de login
 */
function showLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  
  loginForm.style.display = 'flex';
  
  const loginBtn = loginForm.querySelector('button');
  if (loginBtn) {
    loginBtn.onclick = async () => {
      const password = loginForm.querySelector('input[type="password"]')?.value;
      if (!password) {
        alert('Digite a senha');
        return;
      }
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        
        if (!response.ok) throw new Error('Senha incorreta');
        
        const data = await response.json();
        appState.authToken = data.token;
        localStorage.setItem('authToken', data.token);
        
        loginForm.style.display = 'none';
        await initApp();
      } catch (error) {
        alert('❌ ' + error.message);
      }
    };
  }
}

/**
 * Carrega dados do aplicativo do servidor
 */
export async function loadAppData() {
  try {
    const response = await fetch('/api/site-data', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });
    
    if (!response.ok) throw new Error('Erro ao carregar dados');
    
    appState.appData = await response.json();
    console.log('✅ Dados carregados:', appState.appData);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    appState.appData = {};
  }
}

/**
 * Salva dados no servidor
 */
export async function saveAppData(section, data) {
  try {
    const payload = { ...appState.appData };
    payload[section] = data;
    
    const response = await fetch('/api/site-data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appState.authToken}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Erro ao salvar dados');
    
    appState.appData = payload;
    alert('✅ Salvo com sucesso!');
    return true;
  } catch (error) {
    alert('❌ Erro: ' + error.message);
    return false;
  }
}

/**
 * Troca de aba
 */
export async function switchTab(tabName) {
  appState.currentTab = tabName;
  
  // Carrega módulo da aba se ainda não foi carregado
  if (!tabModules[tabName]) {
    try {
      const module = await import(`./tabs/${tabName}.js`);
      tabModules[tabName] = module;
    } catch (error) {
      console.error(`❌ Erro ao carregar tab ${tabName}:`, error);
      return;
    }
  }
  
  // Chama função render do módulo
  const module = tabModules[tabName];
  const renderFunc = module[`render${capitalizeFirst(tabName)}`];
  
  if (renderFunc) {
    const container = document.getElementById('tabContent');
    if (container) {
      container.innerHTML = '';
      await renderFunc(container);
    }
  }
  
  // Atualiza classe ativa dos botões de navegação
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
}

/**
 * Capitaliza primeira letra (hero -> Hero)
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Faz logout
 */
export function logout() {
  appState.authToken = '';
  appState.appData = {};
  localStorage.removeItem('authToken');
  
  document.getElementById('adminPanel').style.display = 'none';
  showLoginForm();
}

// Expõe funções globais para onclick inline (compatibilidade)
window.appState = appState;
window.switchTab = switchTab;
window.logout = logout;
window.resolveImagePath = resolveImagePath;
window.copyToClipboard = copyToClipboard;
window.uploadImage = uploadImage;
window.showUploadProgress = showUploadProgress;

// Inicia ao carregar
document.addEventListener('DOMContentLoaded', initApp);
