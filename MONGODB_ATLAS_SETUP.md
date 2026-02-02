# MongoDB Atlas - Guia de Configuração

## ✅ Atualização (02/02/2026)
- Produção: API e persistência via MongoDB com fallback em memória.
- Upload de imagens: em produção (Vercel) o filesystem é read-only; upload depende de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sem isso, usar URL externa.
- Pendência: rotacionar a senha do MongoDB Atlas e atualizar o `MONGODB_URI` no Vercel.

## Por que MongoDB?

✅ **Gratuito**: 512 MB de armazenamento  
✅ **Fácil**: Integração simples com Node.js  
✅ **Escalável**: Funciona do desenvolvimento à produção  
✅ **Gerenciado**: Sem necessidade de configurar servidor  

---

## Passo 1: Criar conta no MongoDB Atlas

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Clique em **Sign Up** e escolha:
   - Email/senha OU
   - Continue with Google
3. Complete o cadastro

---

## Passo 2: Criar Cluster Gratuito

1. Após login, clique em **+ Create**
2. Escolha: **M0 (FREE)**
3. Provedor: **AWS** (ou qualquer um)
4. Região: **São Paulo (sa-east-1)** (mais próximo do Brasil)
5. Nome do Cluster: `clique-zoom` (ou deixe padrão)
6. Clique em **Create Deployment**

⏱️ Aguarde 1-3 minutos...

---

## Passo 3: Criar Usuário do Banco

1. Tela aparecerá: **Security Quickstart**
2. **Username**: `cliquezoom-admin`
3. **Password**: Clique em **Autogenerate Secure Password** → **COPIE A SENHA**
4. Clique em **Create Database User**

⚠️ **IMPORTANTE**: Salve a senha em lugar seguro!

---

## Passo 4: Configurar IP Access List

1. Na mesma tela, vá em **Network Access**
2. Clique em **Add Entry** (ou já aparece)
3. Escolha: **Allow Access from Anywhere** (IP: `0.0.0.0/0`)
4. Clique em **Add Entry** ou **Confirm**

⚠️ Isso permite acesso de qualquer IP (necessário para Vercel)

---

## Passo 5: Obter Connection String

1. Clique em **Database** no menu esquerdo
2. Encontre seu cluster e clique em **Connect**
3. Escolha: **Drivers**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copie a **Connection String**:

```
mongodb+srv://cliquezoom-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Substitua** `<password>` pela senha que você copiou no Passo 3
8. **Adicione** o nome do banco antes do `?`:

```
mongodb+srv://cliquezoom-admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/cliquezoom?retryWrites=true&w=majority
```

---

## Passo 6: Configurar Localmente

Crie o arquivo `.env` na raiz do projeto:

```bash
PORT=3050
NODE_ENV=development
ADMIN_PASSWORD=admin123
MONGODB_URI=mongodb+srv://cliquezoom-admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/cliquezoom?retryWrites=true&w=majority
```

---

## Passo 7: Testar Localmente

```bash
npm start
```

Se aparecer:
```
✅ MongoDB conectado com sucesso
🚀 Servidor rodando em http://localhost:3050
```

**Está funcionando!** ✅

---

## Passo 8: Configurar na Vercel

1. Vá em: https://vercel.com/dashboard
2. Seu projeto → **Settings** → **Environment Variables**
3. Adicione:

```
Nome: MONGODB_URI
Valor: mongodb+srv://cliquezoom-admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/cliquezoom?retryWrites=true&w=majority
```

4. **Environments**: Marque **Production**, **Preview**, **Development**
5. Clique em **Save**

---

## Passo 9: Redeploy na Vercel

1. Vá em **Deployments**
2. Clique nos **⋯** do último deploy
3. **Redeploy**

Ou faça novo push no GitHub (deploy automático).

---

## Verificar se está funcionando

Após deploy, acesse:

```
https://cliquezoom.com.br/admin
```

1. Faça login
2. Adicione conteúdo (hero, portfolio, etc)
3. Abra em **outra aba anônima**: `https://cliquezoom.com.br`
4. Deve ver o conteúdo que você adicionou!

✅ **Funcionou! Todos os visitantes agora veem suas alterações.**

---

## Monitoramento (Opcional)

### Ver dados no banco:

1. MongoDB Atlas → **Database** → **Browse Collections**
2. Database: `cliquezoom`
3. Collection: `sitedata`
4. Ver documento JSON

### Ver logs de conexão:

```bash
vercel logs
```

---

## Troubleshooting

### "MongoNetworkError: connect ECONNREFUSED"

- Verifique se a connection string está correta
- Confirme que substituiu `<password>` pela senha real
- Verifique IP Access List (0.0.0.0/0)

### "Authentication failed"

- Senha incorreta
- Recrie usuário do banco ou resete senha

### "Database not found"

- Adicione `/cliquezoom` antes do `?` na connection string

### Vercel não conecta

- Confirme que `MONGODB_URI` está em Environment Variables
- Redeploy após adicionar variável
- Verifique logs: `vercel logs`

---

## Custos

### Plano M0 (Gratuito) Inclui:

- ✅ 512 MB de storage
- ✅ Shared RAM
- ✅ Sem necessidade de cartão
- ✅ Sempre gratuito

### Quando upgrade é necessário:

- ❌ Mais de 512 MB de dados (milhares de registros)
- ❌ Mais de 100 conexões simultâneas
- ❌ Backups automáticos
- ❌ Performance crítica

**Para seu projeto: Gratuito é suficiente!** 🎉

---

## Backup Manual (Recomendado)

Periodicamente, exporte seus dados:

1. MongoDB Atlas → Database → Browse Collections
2. Botão **Export Collection**
3. Formato: JSON
4. Salve localmente

---

## Recursos

- **Dashboard MongoDB**: https://cloud.mongodb.com
- **Documentação**: https://docs.mongodb.com/drivers/node
- **Suporte**: https://support.mongodb.com

---

**Status:** ✅ Pronto para produção  
**Custo:** R$ 0,00 (gratuito)  
**Última atualização:** 02/02/2026
