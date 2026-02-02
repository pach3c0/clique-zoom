# CLAUDE.md - Instruções para Agentes de IA

## ✅ Atualização (02/02/2026)
- Produção: API e persistência via MongoDB com fallback em memória.
- Upload de imagens: em produção (Vercel) o filesystem é read-only; upload depende de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sem isso, usar URL externa.
- Pendência: rotacionar a senha do MongoDB Atlas e atualizar o `MONGODB_URI` no Vercel.

> **LEIA PRIMEIRO**: Este arquivo contém instruções críticas para trabalhar neste projeto.

## Projeto: CLIQUE·ZOOM

Plataforma de portfólio fotográfico com 3 camadas: Site Público, Painel Admin e Galeria Cliente.

## Comandos Essenciais

```bash
npm start          # Inicia servidor na porta 3050
npm run dev        # Desenvolvimento com nodemon
```

## URLs do Projeto

- Site Público: `http://localhost:3050/`
- Painel Admin: `http://localhost:3050/admin`
- Galeria Cliente: `http://localhost:3050/galeria/:id`

## Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `src/server.js` | Servidor Express |
| `public/index.html` | Site público completo |
| `admin/index.html` | Painel administrativo completo |
| `cliente/index.html` | Galeria do cliente |

## REGRAS OBRIGATÓRIAS

### 1. Sincronização de Dados

O Admin e o Site Público compartilham dados via `localStorage` (chave: `cliqueZoomAdmin`).

**SEMPRE** que modificar estrutura de dados:
1. Atualizar `defaultData` em `admin/index.html`
2. Atualizar `defaultStore` em `public/index.html`
3. Atualizar funções `saveDados()` e `loadDados()` no admin
4. Atualizar função `applyAdminData()` no public
5. Adicionar migração para dados antigos

### 2. Estrutura de Dados Atual

```javascript
// Chave localStorage: cliqueZoomAdmin
{
  hero: { title, subtitle, image, transform, titleTransform, subtitleTransform, titleFontSize, subtitleFontSize, topBarHeight, bottomBarHeight, overlayOpacity },
  about: { title, text, image },
  portfolio: [{ image, posX, posY, scale }],
  studio: { address, hours, whatsapp, whatsappMessages: [{ text, delay }], photos: [{ image, posX, posY, scale }] }
}
```

### 3. O QUE NÃO FAZER

- **NÃO** renomear a chave `cliqueZoomAdmin`
- **NÃO** alterar `whatsappMessages` para formato string
- **NÃO** remover campos `posX`, `posY`, `scale` de fotos
- **NÃO** modificar `resolveImagePath()` sem testar
- **NÃO** remover `lucide.createIcons()` após renders
- **NÃO** alterar porta 3050 sem atualizar docs
- **NÃO** modificar animações do WhatsApp widget

### 4. Padrões de Nomenclatura

- IDs DOM (public): `dom-[seção]-[elemento]`
- IDs DOM (admin): `[seção]-[campo]`
- Funções render: `render[Seção]()`
- Handlers: `handle[Ação]()`

### 5. Sistema WhatsApp

O widget de WhatsApp exibe mensagens em sequência:
- Array `whatsappMessages` com objetos `{ text, delay }`
- Cada mensagem aparece após seu delay (segundos)
- Ciclo reinicia após 10s da última mensagem
- Fechar bolha cancela todos os timeouts

## Documentação Completa

Para detalhes completos, leia: **DOCS_AI_AGENT.md**

## Checklist Antes de Modificar

- [ ] Entendi a estrutura atual
- [ ] Identifiquei TODOS os arquivos afetados
- [ ] Há migração para dados antigos?
- [ ] Testei no admin E no site público
- [ ] Mantive retrocompatibilidade
