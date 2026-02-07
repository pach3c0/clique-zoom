# CLIQUE·ZOOM - Instrucoes para o Assistente de IA

## O QUE E ESTE PROJETO

Plataforma de portfolio fotografico com 3 frontends e 1 backend:
- **Site publico** (`public/index.html`) - Portfolio, galeria, FAQ, contato
- **Painel admin** (`admin/`) - Gerencia todo o conteudo do site
- **Galeria do cliente** (`cliente/index.html`) - Fotos privadas com codigo de acesso
- **API backend** (`src/server.js` + `src/routes/`) - Express.js + MongoDB

Deploy: **VPS Contabo** (Ubuntu + Nginx + PM2 + MongoDB local). Dominio: `cliquezoom.com.br`

---

## REGRAS CRITICAS - NUNCA QUEBRE ESTAS

1. **Admin JS = ES Modules puros.** Nunca use `require()`, `module.exports`, ou `exports`. Sempre `import/export`. O Nginx serve esses arquivos como static com content-type `application/javascript`.

2. **Backend JS = CommonJS.** O `package.json` tem `"type": "commonjs"`. Use `require()` e `module.exports` em tudo dentro de `src/`.

3. **Admin tabs usam INLINE STYLES, nao classes Tailwind.** O admin tem tema escuro (fundo `#111827`). Classes Tailwind como `bg-white`, `text-gray-600` ficam invisiveis. Use sempre `style="background:#1f2937; color:#f3f4f6;"` etc.

4. **Upload de imagens salva no disco local** em `/uploads/`. Retorna URL relativa `/uploads/filename.jpg`. NAO usar servicos externos (Cloudinary, S3, etc).

5. **Sempre rode `npm run build:css` antes de deploy** se alterar qualquer HTML que use classes Tailwind. O Tailwind v4 compila de `assets/css/tailwind-input.css` para `assets/css/tailwind.css`.

---

## ARQUITETURA

```
Site/
  admin/
    index.html              # Shell do painel (login + sidebar + container)
    js/
      app.js                # Orquestrador: init, login, switchTab, logout
      state.js              # Estado global: appState, loadAppData, saveAppData
      tabs/                 # 1 arquivo por aba, carregado via dynamic import
        hero.js             # renderHero(container)
        sobre.js            # renderSobre(container)
        portfolio.js        # renderPortfolio(container)
        albuns.js           # renderAlbuns(container)
        estudio.js          # renderEstudio(container)
        faq.js              # renderFaq(container)
        newsletter.js       # renderNewsletter(container)
        sessoes.js          # renderSessoes(container)
        footer.js           # renderFooter(container)
        manutencao.js       # renderManutencao(container)
      utils/
        helpers.js          # resolveImagePath, formatDate, generateId, copyToClipboard, escapeHtml
        upload.js           # compressImage, uploadImage, showUploadProgress
  assets/
    css/
      tailwind-input.css   # Source do Tailwind (com @source paths)
      tailwind.css          # Compilado (nao editar manualmente)
      shared.css            # Fontes Inter/Playfair, animacoes
  public/
    index.html              # Site publico (single page)
    albums.html             # Pagina de albuns
  cliente/
    index.html              # Galeria privada do cliente
  uploads/                  # Imagens do admin (servidas pelo Nginx)
  uploads/sessions/         # Fotos de sessoes de clientes
  src/
    server.js               # Entry point Express
    middleware/
      auth.js               # authenticateToken (JWT)
    models/
      SiteData.js           # Documento unico com todo o conteudo do site
      Session.js            # Sessoes de clientes (fotos privadas)
      Newsletter.js         # Inscritos na newsletter
    routes/
      auth.js               # POST /login, POST /auth/verify
      hero.js               # GET/PUT /hero
      faq.js                # CRUD /faq
      site-data.js          # GET/PUT /site-data, GET /site-config
      newsletter.js         # POST /newsletter/subscribe, GET/DELETE /newsletter
      sessions.js           # CRUD /sessions, upload/delete fotos
      upload.js             # POST /admin/upload (salva em /uploads/)
  package.json              # Node 22, CommonJS
```

---

## COMO FUNCIONA O FLUXO DE DADOS

### Salvar dados do admin:
```
Tab chama saveAppData('secao', dados)
  → state.js monta payload completo: { ...appState.appData, [secao]: dados }
  → PUT /api/site-data com payload completo
  → Backend: SiteData.findOneAndUpdate({}, payload, { upsert: true })
  → MongoDB atualiza o documento unico
```

### Carregar dados no site publico:
```
public/index.html → loadRemoteData()
  → Promise.all([fetch('/api/site-data'), fetch('/api/hero')])
  → Combina: { ...siteData, hero: heroData }
  → Renderiza cada secao com os dados
```

### Upload de imagens:
```
Tab chama uploadImage(file, token, onProgress)
  → utils/upload.js comprime imagem (1200px, 85% quality)
  → XHR POST /api/admin/upload com FormData
  → Backend: multer salva no disco em /uploads/
  → Retorna { url: '/uploads/filename.jpg', filename: '...' }
  → Tab salva a URL no campo correspondente do appState.appData
  → Chama saveAppData() para persistir no MongoDB
```

---

## COMO CRIAR UMA NOVA ABA NO ADMIN

### 1. Criar o arquivo do tab

Criar `admin/js/tabs/novaaba.js`:

```javascript
/**
 * Tab: Nome da Aba
 */

import { appState, saveAppData } from '../state.js';
// Se precisar de upload:
import { uploadImage, showUploadProgress } from '../utils/upload.js';
// Se precisar de helpers:
import { resolveImagePath, generateId } from '../utils/helpers.js';

export async function renderNovaaba(container) {
  const dados = appState.appData.novaaba || {};

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      <h2 style="font-size:1.5rem; font-weight:bold; color:#f3f4f6;">Nome da Aba</h2>

      <!-- CAMPOS - sempre com inline styles dark mode -->
      <div>
        <label style="display:block; font-size:0.875rem; font-weight:500; margin-bottom:0.5rem; color:#d1d5db;">Campo</label>
        <input type="text" id="campoX" style="width:100%; padding:0.5rem 0.75rem; border:1px solid #374151; border-radius:0.375rem; background:#1f2937; color:#f3f4f6;"
          value="${dados.campo || ''}">
      </div>

      <!-- BOTAO SALVAR - sempre azul -->
      <button id="saveBtn" style="background:#2563eb; color:white; padding:0.5rem 1.5rem; border-radius:0.375rem; border:none; font-weight:600; cursor:pointer;">
        Salvar
      </button>
    </div>
  `;

  // Event listeners
  container.querySelector('#saveBtn').onclick = async () => {
    const novoDados = {
      campo: container.querySelector('#campoX').value
    };
    appState.appData.novaaba = novoDados;
    await saveAppData('novaaba', novoDados);
  };
}
```

### 2. Adicionar na sidebar do admin

Em `admin/index.html`, dentro da `<nav>`:
```html
<div data-tab="novaaba" class="nav-item">Nome da Aba</div>
```

### 3. Pronto

O `app.js` carrega automaticamente via `import(\`./tabs/${tabName}.js\`)` e chama `renderNovaaba(container)`. Nao precisa editar `app.js`.

---

## PALETA DE CORES DO ADMIN (inline styles)

| Elemento | Cor |
|----------|-----|
| Fundo da pagina | `#111827` |
| Fundo de cards/containers | `#1f2937` |
| Fundo de inputs | `#111827` |
| Borda | `#374151` |
| Texto principal | `#f3f4f6` |
| Texto secundario/labels | `#d1d5db` |
| Texto desabilitado | `#9ca3af` |
| Botao primario (salvar) | `background:#2563eb` |
| Botao adicionar | `background:#16a34a` |
| Botao deletar/texto | `color:#ef4444` |
| Botao editar/texto | `color:#60a5fa` |
| Texto de sucesso | `color:#34d399` |
| Texto de erro | `color:#f87171` |

---

## COMO CRIAR UMA NOVA ROTA NO BACKEND

### 1. Criar o arquivo de rota

Criar `src/routes/novarota.js`:

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// GET publico (sem auth)
router.get('/novarota', async (req, res) => {
  try {
    // buscar dados...
    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST protegido (com auth)
router.post('/novarota', authenticateToken, async (req, res) => {
  try {
    const { campo1, campo2 } = req.body;
    // salvar dados...
    res.json({ success: true });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### 2. Registrar no server.js

```javascript
const novarotaRoutes = require('./routes/novarota');
app.use('/api', novarotaRoutes);
```

---

## COMO CRIAR UM NOVO MODELO MONGOOSE

```javascript
const mongoose = require('mongoose');

const NovoModelSchema = new mongoose.Schema({
  campo: { type: String, required: true },
  numero: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true }
}, {
  timestamps: true  // sempre incluir
});

module.exports = mongoose.model('NovoModel', NovoModelSchema);
```

**Padrao do SiteData (documento unico com upsert):**
```javascript
// Buscar
const data = await SiteData.findOne({});

// Salvar (upsert)
const result = await SiteData.findOneAndUpdate(
  {},
  { $set: payload },
  { upsert: true, new: true, runValidators: true }
);
```

---

## PADRAO DE UPLOAD DE IMAGENS NO TAB

Se um tab precisa de upload de imagem, siga este padrao:

```javascript
import { uploadImage, showUploadProgress } from '../utils/upload.js';
import { resolveImagePath } from '../utils/helpers.js';

// No HTML template:
`
<label style="background:#2563eb; color:white; padding:0.5rem 1rem; border-radius:0.375rem; font-weight:600; cursor:pointer;">
  Upload
  <input type="file" accept=".jpg,.jpeg,.png" id="uploadInput" style="display:none;">
</label>
<div id="uploadProgress"></div>
`

// No event listener:
container.querySelector('#uploadInput').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const result = await uploadImage(file, appState.authToken, (percent) => {
      showUploadProgress('uploadProgress', percent);
    });
    // result.url = URL local (/uploads/filename.jpg)
    dados.image = result.url;
    e.target.value = '';
  } catch (error) {
    alert('Erro: ' + error.message);
  }
};

// Para exibir a imagem:
`<img src="${resolveImagePath(dados.image)}" style="...">`
```

**Para upload multiplo:**
```javascript
`<input type="file" accept=".jpg,.jpeg,.png" multiple id="uploadInput" style="display:none;">`

container.querySelector('#uploadInput').onchange = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  for (const file of files) {
    try {
      const result = await uploadImage(file, appState.authToken);
      lista.push(result.url);  // ou { image: result.url, posX: 50, posY: 50, scale: 1 }
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  }

  appState.appData.secao = dados;
  await saveAppData('secao', dados);
  renderMinhaAba(container);  // re-renderizar
};
```

---

## PADRAO DE LISTA COM CRUD NO TAB

Para tabs que gerenciam uma lista de itens (FAQ, portfolio, albuns):

```javascript
// Dados: array no appState.appData
const items = appState.appData.minhaLista || [];

// Renderizar cada item
items.forEach((item, index) => {
  html += `
    <div style="border:1px solid #374151; border-radius:0.375rem; padding:1rem; background:#1f2937;">
      <input type="text" value="${item.titulo}" data-item-titulo="${index}"
        style="width:100%; ... background:#111827; color:#f3f4f6;">
      <button onclick="deleteItem(${index})" style="color:#ef4444; background:none; border:none; cursor:pointer;">Delete</button>
    </div>
  `;
});

// Adicionar
container.querySelector('#addBtn').onclick = () => {
  items.push({ id: generateId(), titulo: 'Novo' });
  renderMinhaAba(container);  // re-renderiza tudo
};

// Deletar (expor no window para onclick inline)
window.deleteItem = async (index) => {
  if (!confirm('Remover?')) return;
  items.splice(index, 1);
  appState.appData.minhaLista = items;
  await saveAppData('minhaLista', items);
  renderMinhaAba(container);
};

// Salvar
container.querySelector('#saveBtn').onclick = async () => {
  const updated = [];
  container.querySelectorAll('[data-item-titulo]').forEach((input, idx) => {
    updated.push({
      id: items[idx]?.id || generateId(),
      titulo: input.value
    });
  });
  appState.appData.minhaLista = updated;
  await saveAppData('minhaLista', updated);
};
```

---

## PADRAO DE TAB QUE CHAMA API DIRETAMENTE

Newsletter e Sessoes nao usam `saveAppData()` porque tem seus proprios modelos MongoDB. Padrao:

```javascript
// Carregar do backend
const response = await fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${appState.authToken}` }
});
if (!response.ok) throw new Error('Erro ao carregar');
const result = await response.json();
const items = result.items || [];  // extrair do wrapper

// Criar
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${appState.authToken}`
  },
  body: JSON.stringify({ campo1, campo2 })
});
const result = await response.json();

// Deletar
const response = await fetch(`/api/endpoint/${id}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${appState.authToken}` }
});

// Apos criar/deletar: re-renderizar
if (response.ok) {
  await renderMinhaAba(container);
}
```

---

## PADRAO DE HOVER OVERLAY EM IMAGENS

Para botoes que aparecem ao passar o mouse sobre imagens:

```javascript
// No HTML:
`
<div class="meu-item" style="position:relative; ...">
  <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
  <div class="meu-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
    <button onclick="editar(${idx})" style="background:#3b82f6; color:white; padding:0.5rem; border-radius:9999px; border:none; cursor:pointer;">Editar</button>
    <button onclick="deletar(${idx})" style="background:#ef4444; color:white; padding:0.5rem; border-radius:9999px; border:none; cursor:pointer;">Deletar</button>
  </div>
</div>
`

// No JS apos innerHTML:
container.querySelectorAll('.meu-item').forEach(item => {
  const overlay = item.querySelector('.meu-overlay');
  item.onmouseenter = () => { overlay.style.opacity = '1'; };
  item.onmouseleave = () => { overlay.style.opacity = '0'; };
});
```

---

## VARIAVEIS DE AMBIENTE

```
MONGODB_URI=mongodb://localhost:27017/cliquezoom  # MongoDB local na VPS
ADMIN_PASSWORD=...                                # Senha admin (texto plano, legado)
ADMIN_PASSWORD_HASH=...                           # Hash bcrypt da senha (preferido)
JWT_SECRET=...                                    # Secret para assinar tokens
NODE_ENV=production                               # Ambiente
PORT=3000                                         # Porta do Express
```

---

## COMANDOS

```bash
npm run dev          # Servidor local com nodemon (desenvolvimento)
npm run build:css    # Compilar Tailwind CSS
npm start            # Iniciar servidor (producao)
```

---

## DEPLOY NA VPS

O app roda na VPS Contabo com Nginx como reverse proxy e PM2 como process manager.

### Deploy de atualizacoes:
```bash
# Do seu computador local:
git add . && git commit -m "descricao" && git push

# Na VPS (via SSH):
cd /var/www/clique-zoom && git pull && npm install && pm2 restart cliquezoom
```

### Estrutura do servidor:
```
Nginx (porta 80/443)
  ├── /uploads/     → /var/www/clique-zoom/uploads/ (static)
  ├── /assets/      → /var/www/clique-zoom/assets/ (static)
  ├── /admin/js/    → /var/www/clique-zoom/admin/js/ (static, ESM)
  └── /*            → localhost:3000 (proxy para Node.js)

PM2: gerencia processo Node.js (auto-restart)
MongoDB: localhost:27017 (sempre conectado)
```

---

## CHECKLIST ANTES DE DEPLOY

- [ ] Se alterou HTML do site publico/cliente: rodar `npm run build:css`
- [ ] Se criou novo tab no admin: adicionar `<div data-tab="nome">` no `admin/index.html`
- [ ] Se criou nova rota: registrar com `app.use('/api', require('./routes/arquivo'))` no `server.js`
- [ ] Se criou novo modelo: verificar se tem `timestamps: true`
- [ ] Testar localmente com `npm run dev`
- [ ] Commitar e push para GitHub
- [ ] Na VPS: `cd /var/www/clique-zoom && git pull && npm install && pm2 restart cliquezoom`

---

## CUIDADO COM CLASSES TAILWIND ARBITRARIAS NO SITE PUBLICO

**BUG JA CORRIGIDO - NAO REINTRODUZIR:**

Classes Tailwind com valores arbitrarios como `aspect-[3/4]`, `w-[200px]`, `bg-[#123456]` so sao incluidas no CSS compilado se o Tailwind encontra o texto exato durante o build scan. Classes geradas **dinamicamente em JavaScript** (dentro de strings template, concatenacao, etc.) NAO sao detectadas pelo scanner.

**Regra: No site publico (`public/index.html`), sempre use inline styles para valores dinamicos em vez de classes Tailwind arbitrarias.**

Exemplo ERRADO:
```javascript
const aspectMap = { '3/4': 'aspect-[3/4]', '1/1': 'aspect-square' };
const cls = aspectMap[ratio];
return `<div class="${cls}">`;  // aspect-[3/4] NAO vai existir no CSS!
```

Exemplo CORRETO:
```javascript
return `<div style="aspect-ratio:${ratio};">`;  // inline style sempre funciona
```

Classes Tailwind padrao (nao arbitrarias) como `aspect-video`, `aspect-square`, `w-full`, `h-full` podem ser usadas normalmente, pois existem no CSS compilado.

---

## ERROS COMUNS E SOLUCOES

| Erro | Causa | Solucao |
|------|-------|---------|
| Conteudo aparece e some no admin | CSS invisivel no tema escuro | Usar inline styles, nao classes Tailwind |
| `@apply` nao funciona | `@apply` so funciona durante build | Substituir por CSS puro ou inline styles |
| Portfolio nao aparece no site | Classe `aspect-[3/4]` nao existe no CSS compilado | Usar inline style `style="aspect-ratio:3/4;"` em vez de classe arbitraria |
| Upload falha com 413 | Payload muito grande | Imagem e comprimida no client (1200px). Se persistir, verificar `client_max_body_size` no Nginx |
| Portfolio mostra imagem quebrada | Item antigo sem campo `image` no MongoDB | `processRemoteData` ja filtra itens sem `image`; nao salvar itens sem URL |
| App nao inicia | MongoDB desligado | `sudo systemctl start mongod` |
| 502 Bad Gateway | Node.js caiu | `pm2 restart cliquezoom` e verificar logs: `pm2 logs cliquezoom` |

---

## MODELO DE DADOS COMPLETO (SiteData)

Documento unico no MongoDB que armazena todo o conteudo do site:

```javascript
{
  hero: {
    title: String,
    subtitle: String,
    image: String,              // URL da imagem (/uploads/xxx ou URL externa)
    imageScale: Number,         // 0.5 a 2
    imagePosX: Number,          // 0 a 100
    imagePosY: Number,          // 0 a 100
    titleFontSize: Number,
    subtitleFontSize: Number,
    topBarHeight: Number,
    bottomBarHeight: Number,
    overlayOpacity: Number
  },
  about: {
    title: String,
    text: String,
    image: String               // URL da imagem
  },
  portfolio: [                  // Array de fotos
    {
      image: String,            // URL da imagem
      posX: Number,             // 0 a 100 (default 50)
      posY: Number,             // 0 a 100 (default 50)
      scale: Number             // 1 a 2 (default 1)
    }
  ],
  albums: [                     // Array de albuns
    {
      id: String,
      title: String,
      subtitle: String,
      cover: String,            // URL da foto de capa
      photos: [String],         // Array de URLs
      createdAt: String
    }
  ],
  studio: {
    title: String,
    description: String,
    address: String,
    hours: String,
    whatsapp: String,
    photos: [                   // Fotos do estudio
      { image: String, posX: Number, posY: Number, scale: Number }
    ],
    whatsappMessages: [         // Mensagens da bolha flutuante
      { text: String, delay: Number }
    ]
  },
  faq: {
    faqs: [
      { id: String, question: String, answer: String }
    ]
  },
  footer: {
    company: String,
    address: String,
    phone: String,
    email: String,
    socialLinks: {
      instagram: String,
      facebook: String,
      whatsapp: String
    }
  },
  maintenance: {
    enabled: Boolean,
    title: String,
    message: String
  }
}
```

---

## FALE EM PORTUGUES

O usuario fala portugues brasileiro. Todas as mensagens, alerts, labels, placeholders e comentarios devem ser em portugues.
