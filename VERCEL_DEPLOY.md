# Deploy CLIQUE·ZOOM na Vercel - Guia Completo

## ✅ Atualização (02/02/2026)
- Produção: API e persistência via MongoDB com fallback em memória.
- Upload de imagens: em produção (Vercel) o filesystem é read-only; upload depende de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sem isso, usar URL externa.
- Pendência: rotacionar a senha do MongoDB Atlas e atualizar o `MONGODB_URI` no Vercel.

## 🎯 Por que Vercel?

✅ **Gratuito** até escalar muito  
✅ **SSL/HTTPS** automático  
✅ **Deploy automático** via Git  
✅ **Domínio personalizado** gratuito  
✅ **Preview** de cada commit  
✅ **Zero configuração**

---

## Passo 1: Preparar Código

```bash
cd /Users/macbook/Documents/ProjetoEstudio/Site

# Verificar se está tudo commitado
git status

# Se tiver mudanças, commitar
git add .
git commit -m "Deploy: Vercel production"
git push origin main
```

✅ **Repositório deve estar no GitHub**

---

## Passo 2: Criar Conta na Vercel

1. Acesse: https://vercel.com/signup
2. Escolha **Continue with GitHub**
3. Autorize acesso aos repositórios

✅ **Conta criada!**

---

## Passo 3: Importar Projeto

### Via Dashboard Vercel:

1. Clique em **"Add New..."** → **Project**
2. Encontre seu repositório: `ProjetoEstudio/Site` (ou nome do repo)
3. Clique em **Import**

### Configurações:

```
Framework Preset: Other
Build Command: npm install
Output Directory: (deixar vazio)
Install Command: npm install
```

### Variáveis de Ambiente:

Clique em **Environment Variables** e adicione:

```
NODE_ENV = production
ADMIN_PASSWORD = admin123
PORT = 3050
```

4. Clique em **Deploy**

⏱️ **Aguarde 2-3 minutos...**

✅ **Deploy completo!** Seu site estará em: `https://cliquezoom.vercel.app`

---

## Passo 4: Adicionar Domínio Personalizado

### 4.1 No Dashboard Vercel:

1. Vá em **Settings** → **Domains**
2. Clique em **Add Domain**
3. Digite: `cliquezoom.com.br`
4. Clique em **Add**
5. Repita para: `www.cliquezoom.com.br`

Vercel mostrará os registros DNS necessários:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.2 Na Hostinger (hPanel):

1. Acesse: https://hpanel.hostinger.com
2. Vá em **Domains** → `cliquezoom.com.br`
3. Clique em **DNS / Name Servers**
4. Clique em **Manage DNS Records**

**Adicionar/Editar registros:**

```
Tipo: A
Nome: @
Aponta para: 76.76.21.21
TTL: 14400
```

```
Tipo: CNAME
Nome: www
Aponta para: cname.vercel-dns.com
TTL: 14400
```

5. Clique em **Save**

⏱️ **Propagação DNS: 5 minutos a 24 horas** (geralmente 15-30 min)

---

## Passo 5: Verificar SSL

Após propagação DNS:

1. Volte ao Dashboard Vercel → **Settings** → **Domains**
2. Aguarde SSL ativar automaticamente (ícone verde)

✅ **HTTPS ativo!**

---

## Passo 6: Testar

Abra no navegador:

```
https://cliquezoom.com.br           → Site público
https://cliquezoom.com.br/admin     → Painel (senha: admin123)
https://cliquezoom.com.br/cliente   → Galeria cliente
```

✅ **Site no ar!**

---

## Deploy Automático (Opcional)

Agora **cada push** para `main` faz deploy automático:

```bash
# Fazer mudanças no código
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

🚀 **Vercel detecta e faz deploy automaticamente!**

---

## Comandos Úteis (via Terminal)

### Instalar Vercel CLI:

```bash
npm install -g vercel
```

### Login:

```bash
vercel login
```

### Deploy via CLI:

```bash
cd /Users/macbook/Documents/ProjetoEstudio/Site
vercel --prod
```

### Ver logs:

```bash
vercel logs
```

---

## Troubleshooting

### "Build failed"

```bash
# Verificar logs no Dashboard Vercel
# Geralmente é falta de variável de ambiente
```

### "Domain not verified"

```bash
# Aguardar propagação DNS (até 24h)
# Verificar registros DNS na Hostinger
```

### "Cannot find module"

```bash
# Verificar package.json
# Adicionar dependência faltante
npm install <pacote-faltante>
git push
```

### "Port already in use"

```bash
# Vercel usa porta automática
# Não precisa configurar PORT
```

---

## Monitoramento

### Dashboard Vercel:

- **Analytics**: Tráfego e performance
- **Logs**: Ver erros em tempo real
- **Deployments**: Histórico de deploys

### Ver logs:

```bash
vercel logs --follow
```

---

## Custos

### Plano Hobby (Gratuito):

- ✅ Domínios ilimitados
- ✅ SSL automático
- ✅ 100 GB bandwidth/mês
- ✅ Deploy ilimitado
- ✅ Preview ilimitado

### Quando cobram:

- ❌ Mais de 100 GB bandwidth
- ❌ Mais de 100 GB-hours (serverless execution)
- ❌ Mais de 1000 builds/mês

**Para seu projeto:** Gratuito por muito tempo! 🎉

---

## Preview de Branches

Criar branch para testar:

```bash
git checkout -b feature/nova-galeria
# fazer mudanças
git push origin feature/nova-galeria
```

🚀 **Vercel cria preview automático:** `https://cliquezoom-git-feature-nova-galeria.vercel.app`

---

## Rollback (Voltar versão)

1. Dashboard Vercel → **Deployments**
2. Encontre deploy anterior
3. Clique em **⋯** → **Promote to Production**

✅ **Voltou para versão anterior!**

---

## Checklist Final

- [ ] Código no GitHub
- [ ] Conta Vercel criada
- [ ] Projeto importado
- [ ] Variáveis de ambiente configuradas (NODE_ENV, ADMIN_PASSWORD)
- [ ] Primeiro deploy completo
- [ ] DNS configurado na Hostinger (A + CNAME)
- [ ] Domínio adicionado na Vercel
- [ ] SSL/HTTPS ativo (ícone verde)
- [ ] Site acessível em https://cliquezoom.com.br
- [ ] Admin funciona com senha
- [ ] Uploads testados

---

## Recursos Úteis

- **Dashboard:** https://vercel.com/dashboard
- **Documentação:** https://vercel.com/docs
- **Status:** https://vercel-status.com
- **Suporte:** https://vercel.com/support

---

## Próximos Passos (Futuro)

- [ ] Adicionar analytics (já incluído gratuito)
- [ ] Configurar email (via Resend ou SendGrid)
- [ ] Adicionar banco de dados (MongoDB Atlas gratuito)
- [ ] Configurar backups automáticos
- [ ] Adicionar monitoramento (Sentry)

---

**Status:** ✅ Pronto para Deploy  
**Tempo estimado:** 15-30 minutos  
**Custo:** R$ 0,00 (gratuito)  
**Última atualização:** 02/02/2026
