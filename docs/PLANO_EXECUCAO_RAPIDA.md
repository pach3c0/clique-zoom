# 🚀 PLANO EXECUTIVO - COLOCA NO AR

## 🎯 Objetivo
Ter **Site Público + Painel Admin** funcionando e **deployado** no menor tempo possível.

---

## 📊 Timeline & Tarefas

### FASE 1: Site Público ✅ (JÁ PRONTO)
- [x] `public/index.html` - Existe e funciona
- [x] Assets - CSS, JS, Imagens migrados
- [x] Server.js - Serve o site em `/`
- **Status:** PRONTO PARA TESTAR

**Ação:** Testado? `npm start` → http://localhost:3050

---

### FASE 2: Painel Admin 🔴 (CRIAR AGORA)
- [ ] Criar `admin/index.html`
- [ ] Design WordPress-style (simples, funcional)
- [ ] 6 Abas principais:
  1. Dashboard (resumo)
  2. Galerias (CRUD)
  3. Hero & Capa (editar)
  4. Serviços (editar 4 tipos)
  5. Clientes (listar/gerenciar)
  6. Relatórios (gráficos básicos)
- [ ] Upload de imagens
- [ ] Persistência (localStorage para agora, banco depois)
- [ ] Login simples (password em .env)

**Scope:** Funcional + Limpo + Sem Bugs

**Tempo Estimado:** 4-6h

---

### FASE 3: Galeria Cliente 🟡 (SÓ ESTRUTURA)
- [ ] Criar `cliente/index.html`
- [ ] Estrutura básica (layout pronto)
- [ ] Placeholder de fotos
- [ ] **NÃO SE PREOCUPAR** com lógica ainda

**Scope:** HTML/CSS só (sem JS complexo)

**Tempo Estimado:** 1h

---

### FASE 4: Deploy 🚀 (PRONTO)
- [ ] Vercel / Render / DigitalOcean
- [ ] Variáveis de ambiente
- [ ] Domain (seu_site.com)
- [ ] HTTPS automático

**Tempo Estimado:** 1-2h

---

## 📋 Checklist de Prioridade

```
PUB + ADMIN = DEPLOY

┌─────────────────────────────────────┐
│ SEMANA 1:                           │
│ • admin/index.html PRONTO ✅        │
│ • Tudo funciona localmente ✅       │
│ • Deploy em Vercel/Render ✅        │
│ • Seu site no ar! 🎉               │
├─────────────────────────────────────┤
│ SEMANA 2+:                          │
│ • cliente/index.html (galeria)      │
│ • Autenticação JWT                  │
│ • Banco de dados                    │
│ • Marca d'água                      │
└─────────────────────────────────────┘
```

---

## 🎨 Admin Panel - Especificação Rápida

```
LOGIN SIMPLES:
  Senha: env.ADMIN_PASSWORD
  (Sem usuário/email por enquanto)

DASHBOARD:
  • Total de galerias
  • Total de clientes  
  • Total de downloads
  • Gráficos (Chart.js)
  • Últimas galerias

GALERIAS:
  • Listar (cards)
  • Criar (form completo)
  • Editar
  • Deletar
  • Duplicar

HERO:
  • Upload imagem
  • Editar título
  • Editar subtítulo
  • Preview

SERVIÇOS (4 tipos):
  • Editar cada um:
    - Imagem
    - Título
    - Descrição
    - Itens inclusos
    - Preço

CLIENTES:
  • Listar
  • Adicionar
  • Editar
  • Vincular galerias

RELATÓRIOS:
  • Gráficos simples
  • Estatísticas básicas
```

---

## 🔧 Tech Stack (Mantém Simples)

**Frontend:**
- HTML5 + Tailwind CSS
- Vanilla JS (sem frameworks pesados)
- Chart.js (gráficos)
- Lucide icons

**Backend:**
- Express (já temos)
- LocalStorage para dados (por enquanto)
- File upload (multer - já temos)

**Sem agora:**
- ❌ Autenticação JWT (depois)
- ❌ Banco de dados (depois)
- ❌ Email (depois)
- ❌ Pagamento (depois)

---

## 📝 Arquitetura Admin

```
admin/
└─ index.html
   ├─ HTML (estrutura)
   ├─ <style> (Tailwind)
   └─ <script>
      ├─ toggleAdmin()    (mostrar/esconder)
      ├─ adminRouter()    (navegar abas)
      ├─ loadData()       (carregar de localStorage)
      ├─ saveData()       (salvar em localStorage)
      ├─ renderDashboard()
      ├─ renderGalerias()
      ├─ renderHero()
      ├─ renderServicos()
      ├─ renderClientes()
      ├─ renderRelatorios()
      └─ upload()         (carregar imagens)
```

---

## 🚀 Próximas Ações (Agora!)

**1. Confirmar:**
- [ ] Site público funciona? `npm start` → http://localhost:3050 ✅
- [ ] Assets carregam? (logo, imagens, CSS/JS)

**2. Criar admin/index.html:**
- [ ] Começar com estrutura HTML
- [ ] Adicionar Tailwind CSS
- [ ] Criar sidebar + main content
- [ ] Implementar abas (router)

**3. Implementar cada aba:**
- [ ] Dashboard
- [ ] Galerias
- [ ] Hero
- [ ] Serviços
- [ ] Clientes
- [ ] Relatórios

**4. Testar tudo:**
- [ ] Criar galeria
- [ ] Editar galeria
- [ ] Upload de imagem
- [ ] Navegar abas

**5. Deploy:**
- [ ] Vercel (recomendado, grátis)
- [ ] ou Render / Railway

---

## ⏱️ Timeline Realista

| Fase | Tamanho | Tempo | Status |
|------|---------|-------|--------|
| Site Público | ✅ Pronto | 0h | DONE |
| Admin Panel | 🟠 Grande | 4-6h | START |
| Galeria Cliente | 🟢 Pequeno | 1h | LATER |
| Deploy | 🟢 Pequeno | 1-2h | AFTER |

**Total para colocar no ar:** ~6-9 horas

---

## 🎯 Quer Começar?

**Opção A:** Vou criar `admin/index.html` agora (completo e funcional)
- Resultado: Painel WordPress-style pronto para usar

**Opção B:** Vou criar estrutura base, você completa as abas
- Resultado: Framework pronto, você adiciona detalha

**Qual prefere?** 🚀

---

**Objetivo Final:** Ter seu site + painel no ar ESSA SEMANA! 💪

Data: 01/02/2026
