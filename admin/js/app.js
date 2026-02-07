/**
 * Aplicação Admin CLIQUE·ZOOM
 */

import { appState, loadAppData, saveAppData } from './state.js';
import { resolveImagePath, copyToClipboard } from './utils/helpers.js';
import { uploadImage, showUploadProgress } from './utils/upload.js';

const tabModules = {};

function setupNavigation() {
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.onclick = () => switchTab(tab.dataset.tab);
  });
}

async function initApp() {
  setupNavigation();

  if (!appState.authToken) {
    showLoginForm();
    return;
  }

  await loadAppData();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'flex';
  startNotificationPolling();
  await switchTab('hero');
}

function showLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.style.display = 'flex';

  const loginBtn = loginForm.querySelector('button');
  const passwordInput = loginForm.querySelector('input[type="password"]');

  const doLogin = async () => {
    const password = passwordInput?.value;
    if (!password) { alert('Digite a senha'); return; }

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
      document.getElementById('adminPanel').style.display = 'flex';

      await loadAppData();
      startNotificationPolling();
      await switchTab('hero');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loginBtn) loginBtn.onclick = doLogin;
  if (passwordInput) {
    passwordInput.onkeydown = (e) => { if (e.key === 'Enter') doLogin(); };
  }
}

async function switchTab(tabName) {
  appState.currentTab = tabName;
  const container = document.getElementById('tabContent');
  if (!container) return;

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  container.innerHTML = '<p style="color:#9ca3af;">Carregando...</p>';

  if (!tabModules[tabName]) {
    try {
      tabModules[tabName] = await import(`./tabs/${tabName}.js`);
    } catch (error) {
      console.error(`Erro ao carregar tab ${tabName}:`, error);
      container.innerHTML = `<p style="color:#f87171;">Erro ao carregar aba: ${error.message}</p>`;
      return;
    }
  }

  if (appState.currentTab !== tabName) return;

  const mod = tabModules[tabName];
  const funcName = 'render' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
  const renderFunc = mod[funcName];

  if (!renderFunc) {
    container.innerHTML = `<p style="color:#f87171;">Funcao ${funcName} nao encontrada</p>`;
    return;
  }

  try {
    await renderFunc(container);
  } catch (error) {
    console.error(`Erro ao renderizar ${tabName}:`, error);
    container.innerHTML = `<p style="color:#f87171;">Erro: ${error.message}</p>`;
  }
}

// ==================== NOTIFICACOES ====================

const NOTIF_ICONS = {
  session_accessed: '👁️',
  selection_started: '🎯',
  selection_submitted: '✅',
  reopen_requested: '🔄'
};

let notifPollingInterval = null;
let notifDropdownOpen = false;

function startNotificationPolling() {
  loadNotifications();
  if (notifPollingInterval) clearInterval(notifPollingInterval);
  notifPollingInterval = setInterval(loadNotifications, 30000);
}

async function loadNotifications() {
  if (!appState.authToken) return;
  try {
    const res = await fetch('/api/notifications/unread-count', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    updateBadge(data.count || 0);
  } catch (e) { /* ignore */ }
}

function updateBadge(count) {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

async function toggleNotifications() {
  const dropdown = document.getElementById('notifDropdown');
  if (!dropdown) return;

  notifDropdownOpen = !notifDropdownOpen;
  dropdown.style.display = notifDropdownOpen ? 'block' : 'none';

  if (notifDropdownOpen) {
    await renderNotifications();
  }
}

async function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;

  try {
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    const notifications = data.notifications || [];

    if (notifications.length === 0) {
      list.innerHTML = '<p style="color:#6b7280; font-size:0.75rem; text-align:center; padding:1.5rem;">Nenhuma notificacao</p>';
      return;
    }

    list.innerHTML = notifications.map(n => {
      const icon = NOTIF_ICONS[n.type] || '🔔';
      const time = timeAgo(new Date(n.createdAt));
      const unread = !n.read;
      return `
        <div style="padding:0.5rem 1rem; border-bottom:1px solid #1f2937; cursor:pointer; ${unread ? 'background:#1e293b;' : ''}"
          onclick="onNotifClick('${n.sessionId || ''}')">
          <div style="display:flex; align-items:flex-start; gap:0.5rem;">
            <span style="font-size:1rem; flex-shrink:0;">${icon}</span>
            <div style="flex:1; min-width:0;">
              <p style="font-size:0.75rem; color:${unread ? '#f3f4f6' : '#9ca3af'}; ${unread ? 'font-weight:600;' : ''} line-height:1.4;">${n.message}</p>
              <p style="font-size:0.625rem; color:#6b7280; margin-top:0.125rem;">${time}</p>
            </div>
            ${unread ? '<span style="width:6px; height:6px; background:#3b82f6; border-radius:50%; flex-shrink:0; margin-top:0.375rem;"></span>' : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    list.innerHTML = '<p style="color:#f87171; font-size:0.75rem; text-align:center; padding:1rem;">Erro ao carregar</p>';
  }
}

async function markAllNotificationsRead() {
  try {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });
    updateBadge(0);
    await renderNotifications();
  } catch (e) { /* ignore */ }
}

function onNotifClick(sessionId) {
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) dropdown.style.display = 'none';
  notifDropdownOpen = false;

  if (sessionId) {
    switchTab('sessoes');
  }
}

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('pt-BR');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  if (!notifDropdownOpen) return;
  const bell = document.getElementById('notificationBell');
  const dropdown = document.getElementById('notifDropdown');
  if (bell && !bell.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
    notifDropdownOpen = false;
  }
});

function logout() {
  if (notifPollingInterval) clearInterval(notifPollingInterval);
  appState.authToken = '';
  appState.appData = {};
  localStorage.removeItem('authToken');
  document.getElementById('adminPanel').style.display = 'none';
  showLoginForm();
}

window.appState = appState;
window.switchTab = switchTab;
window.logout = logout;
window.saveAppData = saveAppData;
window.loadAppData = loadAppData;
window.resolveImagePath = resolveImagePath;
window.copyToClipboard = copyToClipboard;
window.uploadImage = uploadImage;
window.showUploadProgress = showUploadProgress;
window.toggleNotifications = toggleNotifications;
window.markAllNotificationsRead = markAllNotificationsRead;
window.onNotifClick = onNotifClick;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initApp());
} else {
  initApp();
}
