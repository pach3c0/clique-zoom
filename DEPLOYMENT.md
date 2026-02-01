# 🚀 DEPLOYMENT CLIQUE·ZOOM

## Pré-requisitos
- ✅ Conta GitHub (repositório já criado)
- ✅ Conta Vercel (gratuita)
- ✅ Código pronto em produção

## Passo 1: Push para GitHub

```bash
cd /Users/macbook/Documents/ProjetoEstudio/Site
git remote -v  # Verificar se remote existe
git branch -M main
git push -u origin main
```

## Passo 2: Deploy no Vercel (2-3 minutos)

### Opção A: Interface Web (Recomendado)
1. Ir para [https://vercel.com/dashboard](https://vercel.com/dashboard)
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
