# 📁 ESTRUTURA ORGANIZADA - CLIQUE·ZOOM

## ✅ Atualização (02/02/2026)
- Produção: API e persistência via MongoDB com fallback em memória.
- Upload de imagens: em produção (Vercel) o filesystem é read-only; upload depende de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sem isso, usar URL externa.
- Pendência: rotacionar a senha do MongoDB Atlas e atualizar o `MONGODB_URI` no Vercel.

## ✅ Reorganização Concluída

```
Site/
├─ src/
│  ├─ server.js                    (Express server para 3 camadas)
│  ├─ config/
│  │  └─ database.js               (Conexão MongoDB)
│  ├─ data/
│  │  └─ fallback-data.js          (Dados em memória)
│  ├─ helpers/
│  │  └─ data-helper.js            (Fallback MongoDB)
│  ├─ models/
│  │  └─ SiteData.js               (Schema MongoDB)
│  └─ routes/
│     └─ api.js                    (API REST)
│
├─ public/                         (CAMADA 1: Site Público)
│  └─ index.html                   (Portfolio do fotógrafo)
│
├─ admin/                          (CAMADA 2: Painel Admin)
│  └─ index.html                   (Painel de controle - WordPress style)
│
├─ cliente/                        (CAMADA 3: Galeria Privada)
│  └─ index.html                   (Galeria do cliente com downloads)
│
├─ assets/                         (Recursos Compartilhados)
│  ├─ css/
│  ├─ js/
│  │  └─ api-helper.js             (Cliente HTTP da API)
│  ├─ data/
│  │  ├─ portfolio-data.json
│  │  └─ style-cards.json
│  └─ [imagens, logos, etc]
│
├─ uploads/                        (Uploads de Clientes)
│  └─ [fotos, marcas d'água, etc]
│
├─ package.json                    (Atualizado com deps da nova arquitetura)
├─ .gitignore                      (Novo)
├─ REQUISITOS_PLATAFORMA.md        (Especificação completa)
└─ README.md                       (Documentação)
```

---

## 🗑️ Arquivos Deletados (Não Necessários)

- ❌ `back.html` → Movido para `admin/index.html`
- ❌ `index.html` → Movido para `public/index.html`
- ❌ `js/main.js` → CSS/JS redundante, será reorganizado
- ❌ `js/admin.js` → Será recriado no novo padrão
- ❌ `css/style.css` → Será consolidado em `assets/css`
- ❌ Estrutura de pastas desorganizada

---

## ⚙️ Mudanças no Backend

### server.js Novo
- ✅ Rotas organizadas por camadas
- ✅ Multer atualizado para uploadar em `/uploads`
- ✅ Estrutura pronta para JWT/autenticação
- ✅ APIs separadas: `/api/portfolio`, `/api/admin/*`, `/api/galeria/*`

### package.json
- ✅ Adicionadas dependências:
  - `mongoose` (MongoDB)
  - `multer` (upload local)
  - `cloudinary` (upload em produção)
- ✅ Main aponta para `src/server.js`

---

## 📝 Próximas Etapas

### Fase 1: Preparação (Hoje)
1. ✅ Estrutura de pastas organizada
2. ⏳ Instalar dependências: `npm install`
3. ⏳ Testar se servidor inicia sem erros

### Fase 2: Interfaces (Semana 1)
4. ⏳ Criar `public/index.html` limpo (site público)
5. ⏳ Criar `admin/index.html` (painel admin)
6. ⏳ Criar `cliente/index.html` (galeria cliente)

### Fase 3: Backend (Semana 2)
7. ⏳ Implementar autenticação (JWT)
8. ⏳ Banco de dados (SQLite/PostgreSQL)
9. ⏳ Endpoints de galerias do cliente

### Fase 4: Features (Semana 3+)
10. ⏳ Marca d'água (Sharp)
11. ⏳ Compressão de imagens
12. ⏳ Pagamento integrado

---

## 🚀 Como Rodar Agora

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Acessar
- Site: http://localhost:3050
- Admin: http://localhost:3050/admin
- Galeria: http://localhost:3050/galeria/[id]
```

---

## 🎯 O Que Mantemos Funcionando

✅ Toda a lógica do `index.html` original foi preservada
✅ `server.js` agora é mais limpo e extensível
✅ Assets (CSS, JS, imagens) em lugar próprio
✅ Dados (portfolio-data.json, style-cards.json) intactos

---

**Status:** ✅ ESTRUTURA PRONTA PARA DESENVOLVIMENTO
**Data:** 01/02/2026
