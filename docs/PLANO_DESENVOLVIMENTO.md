# 🛠️ PLANO DE DESENVOLVIMENTO - CLIQUE·ZOOM

## ✅ Atualização (02/02/2026)
- Produção: API e persistência via MongoDB com fallback em memória.
- Upload de imagens: em produção (Vercel) o filesystem é read-only; upload depende de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sem isso, usar URL externa.
- Pendência: rotacionar a senha do MongoDB Atlas e atualizar o `MONGODB_URI` no Vercel.

## 📋 Visão Geral

Esta é uma **plataforma 3 em 1** para fotógrafos:
1. **Site público** (portfolio para atrair clientes)
2. **Painel admin** (fotógrafo gerencia tudo)
3. **Galeria privada** (cliente vê/baixa suas fotos)

---

## 🎯 SPRINT 1: Estrutura Base (Semana 1-2)

### ✅ Concluído
- [x] Reorganizar estrutura de pastas
- [x] Atualizar server.js com 3 camadas
- [x] Atualizar package.json
- [x] Criar .gitignore
- [x] Criar .env.example
- [x] Documentação de requisitos

### ✅ Validado
- [x] Testar se `npm install` funciona sem erros (175 pacotes instalados)
- [x] Testar se servidor inicia (✅ rodando em http://localhost:3050)
- [x] Verificar se HTML antigo ainda funciona em `public/` (✅ assets link atualizado)

---

## 🎨 SPRINT 2: Interface Admin (Semana 2-3)

### Painel Admin (WordPress-style)

**Aba 1: Dashboard**
- [ ] Cards com resumos (galerias, clientes, downloads)
- [ ] Gráficos (Chart.js)
- [ ] Últimas ações

**Aba 2: Galerias de Clientes**
- [ ] Listar galerias (card view)
- [ ] Criar galeria (form com todas as configs)
- [ ] Editar galeria
- [ ] Deletar galeria
- [ ] Duplicar galeria (como template)

**Aba 3: Editar Hero**
- [ ] Upload de imagem
- [ ] Editar título e subtítulo
- [ ] Preview em tempo real
- [ ] Salvar

**Aba 4: Editar Serviços**
- [ ] Para cada tipo (Família, Profissional, Criativo, Festivos):
  - [ ] Upload de imagem
  - [ ] Editar título/descrição
  - [ ] Editar itens inclusos
  - [ ] Editar preço

**Aba 5: Clientes (CRM)**
- [ ] Listar clientes
- [ ] Adicionar novo cliente
- [ ] Editar dados
- [ ] Vincular galerias
- [ ] Ver histórico

**Aba 6: Relatórios**
- [ ] Por galeria (acessos, downloads, cliente)
- [ ] Por cliente (total gasto, galerias)
- [ ] Geral (faturamento, estatísticas)

---

## 📸 SPRINT 3: Galeria do Cliente (Semana 3-4)

**Funcionalidades**
- [ ] Carregar fotos com miniaturas
- [ ] Grid responsivo
- [ ] Preview de foto (lightbox/modal)
- [ ] Checkbox para multi-seleção
- [ ] Botão "Baixar Selecionadas"
- [ ] Informações (preço, tipo, status)
- [ ] Avisos (aguardando pagamento / liberado)

**Configurações por Galeria**
- [ ] Tipo: Premium (X fotos por Y reais) ou Por Foto (R$ Z cada)
- [ ] Limite de downloads (número ou ilimitado)
- [ ] Pode compartilhar? (sim/não)
- [ ] Marca d'água? (sim/não)
- [ ] Status: Bloqueado / Liberado

---

## 🔐 SPRINT 4: Autenticação & Segurança (Semana 4-5)

**Admin**
- [ ] Login com JWT
- [ ] Senha (hash com bcrypt)
- [ ] Sessão persistente
- [ ] Logout

**Cliente**
- [ ] Link único por galeria
- [ ] Acesso sem login (ou com senha, conforme config)
- [ ] Token de acesso na URL

**Backend**
- [ ] Middleware de autenticação
- [ ] Validação de rotas privadas

---

## 🎁 SPRINT 5: Features Avançadas (Semana 5-6)

### Marca d'Água
- [ ] Usar Sharp para gerar marca d'água
- [ ] Customizar: logo, texto, opacidade
- [ ] Preview antes de baixar

### Compressão
- [ ] Comprimir JPG/PNG antes de baixar
- [ ] Gerar múltiplas resoluções (thumb, web, original)

### Email
- [ ] Enviar link de galeria ao cliente
- [ ] Notificar quando galeria estiver pronta
- [ ] Lembretes de pagamento

### Pagamento (Future)
- [ ] Integração Stripe / PagSeguro
- [ ] Carrinho (para compras por foto)
- [ ] Gerar recibo

---

## 💾 SPRINT 6: Banco de Dados (Semana 6-7)

**Migrar de JSON para SQL**
- [ ] Criar tabelas: photographers, clients, galleries, photos, downloads
- [ ] Migrations
- [ ] Seeds (dados iniciais)

**Options:**
- SQLite (simples, sem servidor)
- PostgreSQL (robusto, escalável)

---

## 🚀 SPRINT 7: Deploy (Semana 7-8)

- [ ] Configurar Vercel / Render / DigitalOcean
- [ ] Variáveis de ambiente em produção
- [ ] HTTPS/SSL
- [ ] Backup automático
- [ ] CDN para imagens (Cloudflare)

---

## 📊 Priorização

| Prioridade | Sprint | Task | Tempo |
|-----------|--------|------|-------|
| 🔴 CRÍTICA | 1 | Estrutura | ✅ Feito |
| 🔴 CRÍTICA | 2 | Admin funcional | 5h |
| 🔴 CRÍTICA | 3 | Galeria cliente | 4h |
| 🟠 ALTA | 4 | Autenticação | 3h |
| 🟠 ALTA | 5 | Marca d'água | 2h |
| 🟡 MÉDIA | 6 | Banco de dados | 4h |
| 🟡 MÉDIA | 5 | Email | 2h |
| 🟢 BAIXA | 7 | Deploy | 2h |
| 🟢 BAIXA | 5 | Pagamento | 5h (future) |

---

## 🔄 Workflow

**Para cada nova feature:**

1. **Criar tarefa** nesta lista
2. **Cria branch**: `git checkout -b feature/nome`
3. **Desenvolve**: Estruture em componentes reutilizáveis
4. **Testa**: Verifique em localhost
5. **Commit**: `git commit -m "Add: descrição"`
6. **Push**: `git push origin feature/nome`
7. **Marca como feita**: ✅

---

## 📝 Checklist Final

- [ ] Estrutura organizada ✅
- [ ] Server rodando
- [ ] Admin painel funcional
- [ ] Galeria cliente pronta
- [ ] Autenticação implementada
- [ ] Marca d'água funcionando
- [ ] Banco de dados migrado
- [ ] Testes de segurança
- [ ] Deploy em produção

---

**Última atualização:** 01/02/2026
**Status:** Em andamento
