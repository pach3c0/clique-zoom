# 🆘 Diagnóstico: WhatsApp Não Atualiza em Produção

## ⚠️ Situação
- ✅ API local funciona
- ✅ MongoDB local funciona
- ❌ Em cliquezoom.com.br/admin não atualiza o banco

## 🔍 Passos para Diagnosticar

### 1️⃣ Verificar Cache do Navegador
O problema mais comum é **cache do navegador/Vercel**.

**Limpe o cache completo:**
- Chrome: `Cmd + Shift + Delete` (Mac) ou `Ctrl + Shift + Delete` (Windows)
- Selecione "Todos os tempos"
- Marque "Cookies e dados de site armazenados"
- Clique "Limpar dados"
- Recarregue: `Cmd + R` ou `F5`

Aguarde 30 segundos (Vercel precisa propagar as mudanças).

### 2️⃣ Verificar a Versão do Admin Instalada
Abra seu navegador em: **cliquezoom.com.br/diagnostico.html**

Clique em "**4️⃣ Diagnóstico do Servidor**"

Você deve ver algo como:
```
✅ MongoDB: conectado
✅ Data Fetch: OK
Último WhatsApp no banco: +5511999999999
```

Se MongoDB estiver "desconectado", há um problema de conexão com MongoDB Atlas.

### 3️⃣ Verificar se o Admin.html tem o Fix
Abra DevTools (F12) em cliquezoom.com.br/admin

No Console, cole:
```javascript
fetch('/admin/')
  .then(r => r.text())
  .then(html => {
    const match = html.match(/Version: (.*?) --/);
    console.log('Versão Admin:', match ? match[1] : 'Não encontrada');
  });
```

Você deve ver: `Versão Admin: 3.1.1 (2026-02-04 - Fix WhatsApp Update)`

Se não aparecer, o arquivo não foi atualizado em produção.

### 4️⃣ Testar o PUT do API Diretamente
Em cliquezoom.com.br/diagnostico.html, clique em "**1️⃣ Testar API Diretamente**"

Resultado esperado:
```
✅ API respondeu sucesso
📥 Resposta studio.whatsapp: +5511999888777
```

## 🔧 Se o API não Responder com Sucesso

### Possível Problema 1: MongoDB Desconectado em Produção

**Solução:**
1. Verifique a conexão do MongoDB Atlas
2. Copie a URI correta do MongoDB Atlas
3. Adicione em Vercel → Settings → Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://usuario:senha@seu-cluster.mongodb.net/cliquezoom?retryWrites=true&w=majority
   ```
4. Faça redeploy em Vercel

### Possível Problema 2: Admin.html Não Atualizado

**Solução:**
1. Force redeploy em Vercel:
   - Vá em Vercel Dashboard
   - Selecione seu projeto
   - Vá em "Deployments"
   - Clique no deploy mais recente
   - Clique em "Redeploy"

2. Ou use terminal:
   ```bash
   vercel --prod --force
   ```

## ✅ Teste Final

Após resolver:

1. Limpe cache do navegador (Cmd+Shift+Delete)
2. Aguarde 1 minuto
3. Vá para cliquezoom.com.br/admin
4. Altere o WhatsApp para um número de teste: `+5511988776655`
5. Clique "Salvar Alterações"
6. Abra DevTools (F12) e veja os logs
7. Recarregue a página (Cmd+R)
8. Verifique se o número mudou

## 🆘 Se Ainda Não Funcionar

Verifique:
1. Logs do Vercel:
   - Vá em Vercel Dashboard
   - Selecione seu projeto
   - Vá em "Functions" ou "Logs"
   - Procure por erros ao fazer PUT em `/api/site-data`

2. Verifique o MongoDB Atlas:
   - Abra MongoDB Atlas
   - Selecione seu cluster
   - Vá em "Collections"
   - Procure pela collection "sitedata"
   - Abra o documento com seu site
   - Verifique se `studio.whatsapp` realmente não está sendo atualizado

3. Verifique se há autenticação necessária:
   - A rota PUT `/api/site-data` não requer autenticação?
   - Há algum middleware bloqueando?
