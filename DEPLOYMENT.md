# 🚀 CLIQUE·ZOOM - Guia de Deploy

**Data:** 02/02/2026  
**Status:** ✅ Pronto para Produção (Fase 1)  
**Versão:** 2.0.1

---

## 📋 Estrutura do Projeto

```
Site/
├── src/
│   └── server.js              ← Backend Express (porta 3050)
├── public/
│   └── index.html             ← Site público (portfolio)
├── admin/
│   └── index.html             ← Painel admin (edição de conteúdo)
├── cliente/
│   └── index.html             ← Galeria privada do cliente
├── assets/
│   ├── css/                   ← Estilos adicionais
│   ├── js/                    ← Scripts compartilhados
│   ├── data/                  ← Configurações (site-config.json)
│   └── *.jpg, *.png           ← Imagens do portfolio
├── uploads/                   ← Fotos carregadas pelos admins (não commitar)
├── package.json               ← Dependências Node.js
├── .env.example              ← Variáveis de ambiente
├── vercel.json               ← Configuração Vercel
├── README.md                 ← Documentação principal
└── docs/                     ← Documentação técnica e análises
```

---

## 🔧 Instalação Local

### Pré-requisitos
- **Node.js** >= 16.0
- **npm** ou **yarn**

### Setup

```bash
# 1. Clonar repositório
git clone <seu-repo-url>
cd Site

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env (copiar de .env.example)
cp .env.example .env

# 4. Iniciar servidor local
npm start
```

**Servidor rodará em:**
- 🌐 Site Público: http://localhost:3050
- 🔧 Painel Admin: http://localhost:3050/admin
- 👁️ Galeria Cliente: http://localhost:3050/galeria/[id]

---

## 🌍 Deploy em Produção

### Opção 1: Vercel (Recomendado) ⭐

#### 1.1 Preparar Repositório Git
```bash
git add .
git commit -m "Deploy: Phase 1 - Editor de fotos com aspect ratios"
git push origin main
```

#### 1.2 Conectar com Vercel
```bash
# Instalar CLI do Vercel
npm install -g vercel

# Fazer deploy
vercel

# Ou configurar no dashboard: https://vercel.com/new
```

#### 1.3 Variáveis de Ambiente
No dashboard Vercel, adicione:
```
ADMIN_PASSWORD=admin123
NODE_ENV=production
PORT=3050
```

**Deploy automático:** Ao fazer push para `main`, Vercel automaticamente rebuilda e faz deploy.

---

### Opção 2: Heroku

```bash
# 1. Criar app no Heroku
heroku create seu-app-name

# 2. Adicionar variáveis
heroku config:set ADMIN_PASSWORD=admin123
heroku config:set NODE_ENV=production

# 3. Deploy
git push heroku main
```

---

### Opção 3: Auto-Hospedagem (VPS/servidor dedicado)

```bash
# No servidor:

# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clonar repositório
git clone <seu-repo-url> /var/www/clique-zoom
cd /var/www/clique-zoom

# 3. Instalar dependências
npm ci --production

# 4. Criar .env
cp .env.example .env
nano .env  # Editar com valores de produção

# 5. Usar PM2 para manter servidor rodando
npm install -g pm2
pm2 start src/server.js --name "clique-zoom"
pm2 startup
pm2 save
```

---

## 🔐 Configurações de Segurança

### HTTPS (Obrigatório em Produção)

#### Com Vercel
✅ Automático (certificado SSL gratuito incluído)

#### Com Heroku
✅ Automático (use domínio .herokuapp.com ou custom domain com SSL)

---

## ✅ Pré-requisitos

- ✅ Conta GitHub (repositório já criado)
- ✅ Conta Vercel (gratuita em vercel.com)
- ✅ Código testado localmente
- ✅ .env configurado corretamente
2. Clicar em **"Add New..."** → **"Project"**
3. Selecionar repositório GitHub `ProjetoEstudio/Site`
4. Configurar:
   - **Framework Preset**: Other (Node.js)
   - **Root Directory**: ./
   - **Build Command**: `npm install`
   - **Output Directory**: (deixar vazio)
   - **Install Command**: `npm install`
5. Adicionar Environment Variables:
   ```
   ADMIN_PASSWORD = admin123
   NODE_ENV = production
   ```
6. Clicar **Deploy** e esperar ✅

### Opção B: CLI (Alternativa)
```bash
npm install -g vercel
vercel --prod
# Responder as perguntas do setup
```

## Passo 3: Configurar Domínio (Opcional)
No Vercel Dashboard:
- **Settings** → **Domains**
- Adicionar domínio customizado (ex: cliquezoom.com)
- Seguir instruções de DNS

## Passo 4: Validar Deployment
- 📸 Site Público: `https://seu-dominio.vercel.app`
- 🔧 Admin Panel: `https://seu-dominio.vercel.app/admin`
- 👁️  Client Gallery: `https://seu-dominio.vercel.app/galeria/[id]`

## URLs Pós-Deploy
- **Padrão Vercel**: `https://clique-zoom-platform.vercel.app`
- **Domínio Customizado**: `https://seudominio.com` (se configurado)

## Monitoramento
- Logs: `vercel logs` ou Vercel Dashboard
- Analytics: Disponível no Vercel Dashboard
- Métricas de Deployment: Status automático via GitHub

## Rollback (Desfazer Deploy)
Se houver problema:
```bash
git revert HEAD
git push
# Vercel redeploy automaticamente
```

## Próximos Passos
- ✅ Deploy completo
- ⏳ Conectar banco de dados (PostgreSQL/MongoDB)
- ⏳ Implementar uploads de imagens em produção
- ⏳ Configurar email de notificação
- ⏳ Implementar sistema de pagamento
