# 📋 REQUISITOS DA PLATAFORMA - CLIQUE·ZOOM

## ✅ Atualização (02/02/2026)
- Produção: API e persistência via MongoDB com fallback em memória.
- Upload de imagens: em produção (Vercel) o filesystem é read-only; upload depende de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sem isso, usar URL externa.
- Pendência: rotacionar a senha do MongoDB Atlas e atualizar o `MONGODB_URI` no Vercel.

## 🎯 Visão Geral (PRD)

Plataforma 3 em 1: Portfolio Público → Admin do Fotógrafo → Galeria Privada do Cliente

---

## 🔴 CAMADA 1: SITE PÚBLICO (Portfolio do Fotógrafo)

**O que é:** Vitrine da CLIQUE·ZOOM para potenciais clientes
**Quem acessa:** Público em geral
**Objetivo:** Apresentar serviços e gerar leads

### Páginas/Seções:
- Hero section (editável pelo admin)
- 4 tipos de serviço (Família, Profissional, Criativo, Festivos) - editável pelo admin
- Guia de estilos (6 tipos de roupa)
- Calculadora de preço
- Depoimentos/Galeria de trabalhos anteriores
- CTA: "Agende sua sessão"

---

## 🟡 CAMADA 2: PAINEL DO FOTÓGRAFO (Admin - WordPress Style)

**O que é:** Dashboard administrativo para o fotógrafo gerenciar tudo
**Quem acessa:** Apenas o fotógrafo (autenticado)
**Objetivo:** Interface intuitiva, SEM código, tipo WordPress

### 📊 Abas/Funcionalidades Principais:

#### **Aba 1: Dashboard**
- [ ] Cards com resumos (total de galerias, total de clientes, total de downloads, etc)
- [ ] Gráficos (acessos por mês, downloads, etc)
- [ ] Últimas galerias criadas

#### **Aba 2: Galerias de Clientes**
- [ ] Listar todas as galerias (card view: thumbnail + info)
- [ ] Criar nova galeria
- [ ] Editar galeria existente
- [ ] Deletar galeria
- [ ] Duplicar galeria (usar como template)

**Ao Criar/Editar Galeria, o admin configura:**
```
├─ Nome do Cliente (obrigatório)
├─ Data da Sessão (obrigatório)
├─ Tipo de Cliente (dropdown)
│  ├─ Cliente Premium (vende pacote: X fotos por Y reais)
│  └─ Cliente Normal (vende por foto individual)
├─ Configuração de Venda:
│  ├─ Se Premium:
│  │  ├─ Quantidade de fotos incluídas (ex: 200)
│  │  └─ Preço total (ex: R$ 400)
│  └─ Se Normal:
│     └─ Preço por foto (ex: R$ 2 por foto)
├─ Limite de Downloads:
│  ├─ Quantidade máxima de fotos que cliente pode baixar (ex: 150 de 200)
│  └─ Ilimitado? (sim/não)
├─ Configurações de Acesso:
│  ├─ Pode compartilhar link? (sim/não) [default: não]
│  ├─ Requer senha? (sim/não)
│  └─ Senha customizada (se sim)
├─ Configurações de Imagem:
│  ├─ Aplicar marca d'água? (sim/não) [default: sim]
│  ├─ Tipo de marca d'água (customizável: logo, texto, opacidade)
│  └─ Preview da marca d'água
├─ Status de Pagamento/Download:
│  ├─ Aguardando Pagamento
│  ├─ Pago - Bloqueado para Download [admin desbloqueia manualmente]
│  └─ Pago - Liberado para Download
├─ Upload de Fotos:
│  ├─ Drag & drop ou selecionar arquivos
│  ├─ Visualizar miniaturas
│  ├─ Deletar fotos individuais
│  └─ Re-ordenar fotos (drag & drop)
└─ Link para Compartilhar:
   └─ Gerado automaticamente (copiável)
```

#### **Aba 3: Configurações do Site (Hero + Serviços)**
- [ ] Editar Hero section
  - [ ] Upload de imagem
  - [ ] Texto (título + descrição)
  - [ ] Preview em tempo real

- [ ] Editar 4 Tipos de Serviço (Família, Profissional, Criativo, Festivos)
  - Para cada tipo:
    - [ ] Imagem (upload)
    - [ ] Título
    - [ ] Descrição detalhada
    - [ ] Lista de itens (inclusos no pacote)
    - [ ] Preço base
    - [ ] Preview

#### **Aba 4: Clientes (CRM Simples)**
- [ ] Listar todos os clientes (tabela ou cards)
- [ ] Adicionar novo cliente
- [ ] Editar dados do cliente
- [ ] Vincular galerias ao cliente
- [ ] Visualizar histórico de galerias

**Dados do Cliente:**
- Nome
- Email
- Telefone
- Tipo de serviço (Família/Profissional/Criativo/Festivos)
- Data da sessão
- Status (Agendado, Concluído, Arquivado)
- Notas internas

#### **Aba 5: Relatórios**
- [ ] Por Galeria:
  - Quantas vezes foi acessada
  - Quantas fotos foram baixadas
  - Por qual cliente
  - Data de criação
  
- [ ] Por Cliente:
  - Total gasto
  - Galerias associadas
  - Último acesso

- [ ] Geral:
  - Total de clientes
  - Total de galerias
  - Total de downloads (este mês, este ano)
  - Faturamento estimado (se integrar com pagamento)

---

## 🟢 CAMADA 3: GALERIA PRIVADA DO CLIENTE

**O que é:** Página privada onde cliente vê e baixa suas fotos
**Link:** `cliquezoom.com/galeria/[código-único]`
**Quem acessa:** Cliente via link (com ou sem senha, conforme admin configurar)

### Funcionalidades:

#### **Layout:**
```
┌─────────────────────────────────────┐
│ CLIQUE·ZOOM                         │
│ Suas fotos da sessão de [data]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Cliente: [Nome] | [Tipo Serviço]   │
│  Fotos disponíveis: X / Y           │
│  Status: [Aguardando | Disponível]  │
└─────────────────────────────────────┘

[GRID DE FOTOS COM MINIATURAS]
  • Hover: Botão de download individual
  • Click: Preview grande
  • Checkbox: Multi-select

[BOTÕES]
├─ Baixar Selecionadas (se cliente pagou)
├─ Baixar Tudo (se cliente pagou)
└─ Copiar Link (se admin permitir compartilhar)

[INFORMAÇÕES]
├─ Preço: R$ XXXX
├─ Fotos incluídas: X
├─ Fotos que pode baixar: Y de X
├─ Instruções de pagamento/acesso
└─ Status: "Aguardando pagamento..." ou "Pronto para download!"
```

#### **Comportamentos:**

**Se Tipo = Premium (X fotos por Y reais):**
```
- Exibe: "Você comprou 200 fotos por R$ 400"
- Pode baixar: Até 200 fotos (ou limite configurado)
- Status: "Bloqueado" até admin liberar
- Após liberar: Botão "Baixar Tudo" ativo
```

**Se Tipo = Por Foto (R$ Z por foto):**
```
- Exibe: "Você pode comprar fotos individuais por R$ 2 cada"
- Cliente clica "Comprar" na foto
- Adiciona ao carrinho (mostrar total)
- Checkout simples
- Após pagamento: Download individual habilitado
```

**Marca d'Água:**
- Se ativada no admin: Todas as fotos baixadas têm marca d'água (não afeta preview)
- Se desativada: Download sem marca d'água

**Compartilhamento:**
- Se permitido no admin: Botão "Compartilhar link" (WhatsApp, Email, Copy)
- Se não permitido: Botão não aparece

**Limite de Downloads:**
- Exibe: "Você pode baixar até 150 de 200 fotos"
- Se cliente selecionou 160: Alerta "Você selecionou 160, mas limite é 150"

---

## 🔐 Autenticação & Segurança

### Camada 2 (Admin):
- Login com senha (autenticação simples ou social login)
- Session token (não expirar rápido)
- Apenas 1 fotógrafo pode acessar (ou múltiplos com permissões diferentes - future)

### Camada 3 (Cliente):
- Link único + senha (opcional, conforme admin configurar)
- Token de acesso na URL
- Sem necessidade de login
- Não podem acessar galerias de outros clientes

---

## 💾 Estrutura de Dados (Backend)

### Tabelas/Collections:

```
photographers
├─ id
├─ nome
├─ email
├─ senha (hashed)
├─ logo_url
├─ criado_em
└─ atualizado_em

clients
├─ id
├─ photographer_id
├─ nome
├─ email
├─ telefone
├─ tipo_servico (familia|profissional|criativo|festivos)
├─ data_sessao
├─ status (agendado|concluido|arquivado)
├─ notas
├─ criado_em
└─ atualizado_em

galleries
├─ id
├─ photographer_id
├─ client_id
├─ nome
├─ data_sessao
├─ tipo_cliente (premium|por_foto)
├─ configuracao_venda (JSON)
│  ├─ Se premium: {quantidade_fotos: 200, preco_total: 400}
│  └─ Se por_foto: {preco_por_foto: 2}
├─ limite_downloads (null = ilimitado, ou número)
├─ configuracao_acesso (JSON)
│  ├─ pode_compartilhar: false
│  ├─ requer_senha: false
│  └─ senha: "xxx"
├─ configuracao_imagem (JSON)
│  ├─ marca_dagua_ativa: true
│  ├─ tipo_marca: (logo|texto)
│  └─ opacidade: 0.5
├─ status_download (aguardando|liberado|bloqueado)
├─ link_unico
├─ senha_acesso (se requer_senha)
├─ criado_em
├─ atualizado_em
└─ deletado_em (soft delete)

gallery_photos
├─ id
├─ gallery_id
├─ foto_url
├─ foto_url_com_marca_dagua
├─ ordem
├─ criado_em
└─ deletado_em (soft delete)

gallery_downloads
├─ id
├─ gallery_id
├─ foto_id (se download individual)
├─ data_download
├─ ip_cliente
└─ user_agent

site_config
├─ photographer_id
├─ hero_image_url
├─ hero_titulo
├─ hero_descricao
├─ servicos (JSON com 4 tipos)
├─ atualizado_em
```

---

## 🛠️ Stack Recomendado

**Frontend:**
- HTML5 + CSS3 (ou Tailwind)
- Vanilla JS ou Vue.js (para interatividade)
- Dropzone.js (upload de fotos)
- Chart.js (relatórios)

**Backend:**
- Node.js + Express
- Multer (upload)
- Sharp (processamento de imagens + marca d'água)
- JWT (autenticação)
- SQLite/PostgreSQL (banco de dados)

**Storage:**
- Local filesystem ou AWS S3 (imagens)
- CDN para fotos (Cloudflare, AWS CloudFront)

---

## 📱 Responsive Design

- Mobile-first
- Tablets: Grids adaptáveis
- Desktop: Layout completo

---

## ✅ MVP (Mínimo Viável) - Fase 1

**Prioridades:**
1. ✅ Autenticação do fotógrafo
2. ✅ CRUD de galerias (criar, listar, editar, deletar)
3. ✅ Upload de fotos
4. ✅ Galeria cliente (visualizar + baixar)
5. ✅ Configurações básicas (marca d'água, limite downloads, preço)

**Fases futuras:**
- Pagamento integrado (Stripe, PagSeguro)
- Email automático para cliente
- Social login
- App mobile
- Analytics avançados

---

## 🎨 Design System

**Reuse do que existe:**
- Tipografia: Inter + Playfair Display
- Paleta: Preto, Branco, Cinza (minimalista)
- Componentes: Cards, Grids, Buttons (style guide)

---

**Status:** ✅ Requisitos Definidos - Pronto para Desenvolvimento
**Data:** 01/02/2026
