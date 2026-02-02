# CLIQUE·ZOOM - Documentação para Agentes de IA

> **IMPORTANTE**: Este documento contém instruções críticas para agentes de IA que irão trabalhar neste projeto. Leia COMPLETAMENTE antes de fazer qualquer alteração.

---

## 1. VISÃO GERAL DO PROJETO

**CLIQUE·ZOOM** é uma plataforma de portfólio fotográfico com 3 camadas:

| Camada | URL | Descrição |
|--------|-----|-----------|
| **Site Público** | `/` ou `/public/` | Portfólio do estúdio para visitantes |
| **Painel Admin** | `/admin` | Gerenciamento de conteúdo (WordPress-like) |
| **Galeria Cliente** | `/galeria/:id` | Área privada para clientes (em desenvolvimento) |

### Stack Tecnológica
- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JavaScript
- **Ícones**: Lucide Icons
- **Fontes**: Inter (sans) + Playfair Display (serif)
- **Persistência**: localStorage (admin → site público)
- **Porta**: 3050

---

## 2. ESTRUTURA DE ARQUIVOS

```
Site/
├── src/
│   └── server.js           # Servidor Express principal
├── public/
│   └── index.html          # Site público (portfólio)
├── admin/
│   └── index.html          # Painel administrativo
├── cliente/
│   └── index.html          # Galeria privada do cliente
├── assets/
│   ├── css/style.css       # Estilos (não utilizado atualmente)
│   ├── js/                 # Scripts legados (não utilizado)
│   ├── data/               # JSONs de dados
│   └── [imagens]           # Fotos do portfólio
├── uploads/                # Uploads via admin
├── package.json            # Dependências npm
└── vercel.json             # Config de deploy Vercel
```

---

## 3. ARQUITETURA DE DADOS

### 3.1 Fluxo de Dados

```
┌─────────────────┐         localStorage         ┌─────────────────┐
│  ADMIN PANEL    │  ──── cliqueZoomAdmin ────▶  │  SITE PÚBLICO   │
│  /admin         │         (JSON)               │  /public        │
└─────────────────┘                              └─────────────────┘
```

O Admin salva dados no `localStorage` com a chave `cliqueZoomAdmin`. O Site Público lê essa mesma chave para renderizar o conteúdo.

### 3.2 Estrutura do localStorage (`cliqueZoomAdmin`)

```javascript
{
  hero: {
    title: "string",           // Título principal
    subtitle: "string",        // Subtítulo
    image: "string",           // Caminho da imagem
    transform: {
      scale: 1,                // Zoom da imagem (0.5-2)
      posX: 50,                // Posição X (0-100%)
      posY: 50                 // Posição Y (0-100%)
    },
    titleTransform: {
      posX: 50,                // Posição X do título
      posY: 40                 // Posição Y do título
    },
    subtitleTransform: {
      posX: 50,                // Posição X do subtítulo
      posY: 55                 // Posição Y do subtítulo
    },
    titleFontSize: 48,         // Tamanho fonte título (px)
    subtitleFontSize: 18,      // Tamanho fonte subtítulo (px)
    topBarHeight: 0,           // Faixa cinema topo (%)
    bottomBarHeight: 0,        // Faixa cinema base (%)
    overlayOpacity: 30         // Escurecimento (0-70%)
  },

  about: {
    title: "string",           // Título da seção
    text: "string",            // Texto (parágrafos com \n)
    image: "string"            // Imagem da seção
  },

  portfolio: [
    {
      image: "string",         // Caminho da imagem
      posX: 50,                // Posição X do crop
      posY: 50,                // Posição Y do crop
      scale: 1                 // Zoom da imagem
    }
  ],

  studio: {
    address: "string",         // Endereço completo
    hours: "string",           // Horários (\n para quebra)
    whatsapp: "string",        // Número WhatsApp (5511999999999)
    whatsappMessages: [        // Mensagens da bolha flutuante
      {
        text: "string",        // Texto da mensagem
        delay: 5               // Delay em segundos
      }
    ],
    photos: [                  // Fotos do estúdio
      {
        image: "string",
        posX: 50,
        posY: 50,
        scale: 1
      }
    ]
  }
}
```

---

## 4. COMPONENTES PRINCIPAIS

### 4.1 Site Público (`/public/index.html`)

| Seção | ID DOM | Descrição |
|-------|--------|-----------|
| Hero | `#hero` | Banner principal com imagem, título e efeitos cinema |
| Portfólio | `#portfolio` | Grid de fotos (mosaico) |
| Estúdio | `#estudio` | Fotos do estúdio + mapa + info |
| Sobre | `#sobre` | Texto institucional + imagem |
| WhatsApp Widget | `#whatsapp-widget` | Botão flutuante + bolha de mensagens |

#### Elementos DOM do Hero
- `#dom-hero-img` - Imagem de fundo
- `#dom-hero-overlay` - Overlay escuro
- `#dom-hero-top-bar` - Faixa cinema superior
- `#dom-hero-bottom-bar` - Faixa cinema inferior
- `#dom-hero-title` - Título principal
- `#dom-hero-subtitle` - Subtítulo

#### Sistema de Mensagens WhatsApp
O widget exibe mensagens em sequência com delays configuráveis:
1. Primeira mensagem aparece após seu delay
2. Cada mensagem seguinte aparece após seu próprio delay
3. Ciclo reinicia após 10 segundos da última mensagem
4. Fechar a bolha cancela todas as mensagens pendentes

### 4.2 Painel Admin (`/admin/index.html`)

| Aba | Função |
|-----|--------|
| Hero / Capa | Editar banner principal com preview em tempo real |
| Sobre | Editar texto e imagem institucional |
| Portfólio | Upload, reordenação (drag & drop) e ajuste de fotos |
| Estúdio | Info de contato, WhatsApp, mensagens e fotos |

#### Funcionalidades do Admin
- **Preview em tempo real** para o Hero
- **Drag & drop** para reordenar fotos
- **Editor de posição** interativo (arrastar + scroll para zoom)
- **Sistema de mensagens WhatsApp** com delays individuais
- **Upload de imagens** via `/api/admin/upload`

---

## 5. APIs DO SERVIDOR

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Serve site público |
| GET | `/admin` | Serve painel admin |
| GET | `/galeria/:id` | Serve galeria do cliente |
| GET | `/api/portfolio` | Retorna dados do portfólio (JSON) |
| GET | `/api/style-guide` | Retorna guia de estilo (JSON) |
| POST | `/api/admin/portfolio` | Salva dados do portfólio |
| POST | `/api/admin/upload` | Upload de imagem |
| GET | `/api/galeria/:id` | Dados da galeria privada |
| POST | `/api/galeria/:id/download` | Download de fotos |

---

## 6. FUNÇÕES JAVASCRIPT CRÍTICAS

### Site Público

| Função | Arquivo | Descrição |
|--------|---------|-----------|
| `render()` | public/index.html | Renderiza todo o site com dados do store |
| `applyAdminData()` | public/index.html | Mescla dados do localStorage com defaults |
| `resolveImagePath()` | ambos | Resolve caminhos de imagem |
| `openWhatsapp()` | public/index.html | Abre WhatsApp com mensagem |
| `showWhatsappMessage()` | public/index.html | Exibe mensagem na bolha |
| `startWhatsappMessages()` | public/index.html | Inicia ciclo de mensagens |
| `closeWhatsappBubble()` | public/index.html | Fecha bolha e cancela ciclo |

### Painel Admin

| Função | Descrição |
|--------|-----------|
| `renderHero()` | Renderiza aba Hero com controles |
| `renderSobre()` | Renderiza aba Sobre |
| `renderPortfolio()` | Renderiza aba Portfólio |
| `renderEstudio()` | Renderiza aba Estúdio |
| `updatePreview()` | Atualiza preview do Hero em tempo real |
| `saveDados()` | Salva todos os dados no localStorage |
| `loadDados()` | Carrega dados do localStorage |
| `openPhotoEditor()` | Abre modal de edição de foto |
| `collectWhatsappMessages()` | Coleta mensagens do WhatsApp do DOM |
| `addWhatsappMessage()` | Adiciona nova mensagem |
| `removeWhatsappMessage()` | Remove mensagem |

---

## 7. REGRAS CRÍTICAS - O QUE NÃO FAZER

### 7.1 localStorage

- **NUNCA** alterar a chave `cliqueZoomAdmin` para outro nome
- **NUNCA** modificar a estrutura do objeto sem atualizar AMBOS os arquivos (admin + public)
- **NUNCA** remover campos existentes sem migração

### 7.2 Estrutura de Dados

- **NUNCA** mudar `whatsappMessages` de volta para `whatsappGreeting` (string simples)
- **NUNCA** alterar a estrutura de `photos` no studio ou portfolio
- **NUNCA** remover os campos `posX`, `posY`, `scale` das fotos

### 7.3 Sincronização Admin ↔ Site

Ao modificar estrutura de dados:
1. Atualizar `defaultData` no **admin/index.html**
2. Atualizar `defaultStore` no **public/index.html**
3. Atualizar `saveDados()` no admin
4. Atualizar `loadDados()` no admin
5. Atualizar `applyAdminData()` no public
6. Adicionar **migração** para dados antigos se necessário

### 7.4 CSS/Estilos

- **NUNCA** remover as animações do WhatsApp widget (`fadeInUp`, `pulse`)
- **NUNCA** alterar `transition` da `#whatsapp-bubble` (quebra animação de mensagens)
- **NUNCA** modificar classes Tailwind core sem testar responsividade

### 7.5 Funções JavaScript

- **NUNCA** renomear funções públicas sem atualizar todos os `onclick` no HTML
- **NUNCA** remover `lucide.createIcons()` após renderizações
- **NUNCA** modificar `resolveImagePath()` sem testar uploads e assets

### 7.6 Servidor

- **NUNCA** alterar a porta 3050 sem atualizar toda documentação
- **NUNCA** modificar rotas existentes sem manter retrocompatibilidade
- **NUNCA** remover o middleware de CORS

### 7.7 Uploads

- **NUNCA** alterar o diretório `/uploads` sem atualizar `server.js`
- **NUNCA** modificar o formato de resposta do upload (`{ url, filename }`)

---

## 8. PADRÕES DE CÓDIGO

### 8.1 Nomenclatura

- IDs DOM no site público: `dom-[seção]-[elemento]` (ex: `dom-hero-title`)
- IDs no admin: `[seção]-[campo]` (ex: `hero-title`, `studio-whatsapp`)
- Funções de render: `render[Seção]()` (ex: `renderHero()`)
- Handlers: `handle[Ação]()` (ex: `handleUpload()`)

### 8.2 Estilos

- Usar **Tailwind CSS** para estilos inline
- CSS custom apenas para animações e fontes
- Cores principais: `neutral-900` (preto), `gray-*` (cinzas)
- Fonte serif para títulos: `font-serif`
- Fonte sans para texto: padrão (Inter)

### 8.3 Responsividade

- Mobile-first com breakpoints: `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Grid responsivo: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 9. CHECKLIST PARA ALTERAÇÕES

Antes de qualquer modificação, verifique:

- [ ] Li e entendi a estrutura de dados atual
- [ ] Identifiquei todos os arquivos que serão afetados
- [ ] Verifiquei se há migração necessária para dados antigos
- [ ] Testei no admin E no site público
- [ ] Verifiquei responsividade (mobile/desktop)
- [ ] Mantive retrocompatibilidade
- [ ] Atualizei documentação se necessário

---

## 10. COMANDOS ÚTEIS

```bash
# Iniciar servidor
npm start

# Desenvolvimento com hot reload
npm run dev

# Servidor roda em
http://localhost:3050

# Site público
http://localhost:3050/

# Painel admin
http://localhost:3050/admin

# Galeria cliente (exemplo)
http://localhost:3050/galeria/abc123
```

---

## 11. TROUBLESHOOTING

### Dados não aparecem no site público
1. Verificar se salvou no admin (botão "Salvar Alterações")
2. Abrir DevTools → Application → localStorage
3. Verificar se `cliqueZoomAdmin` existe e tem os dados

### Imagens não carregam
1. Verificar se o caminho começa com `/assets/` ou `/uploads/`
2. Verificar se o arquivo existe no servidor
3. Testar `resolveImagePath()` no console

### WhatsApp não abre
1. Verificar formato do número (5511999999999)
2. Verificar se `whatsapp` está salvo no localStorage
3. Testar URL manualmente: `https://wa.me/5511999999999`

### Mensagens não aparecem na bolha
1. Verificar se `whatsappMessages` é um array válido
2. Verificar se `delay` é um número positivo
3. Verificar se a bolha não foi fechada (`bubbleClosed`)

---

## 12. CONTATO E SUPORTE

- **Repositório**: Local (não publicado)
- **Autor Original**: Configurado via Git
- **Última Atualização**: Fevereiro 2026

---

> **LEMBRETE FINAL**: Este projeto usa localStorage para persistência. Não há banco de dados. Todas as configurações são armazenadas no navegador do administrador e lidas pelo site público no mesmo navegador/dispositivo.
