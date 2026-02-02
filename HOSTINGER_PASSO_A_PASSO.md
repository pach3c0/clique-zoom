# Deploy CLIQUE·ZOOM na Hostinger - Guia Prático

## ⚠️ PRÉ-REQUISITO: Tipo de Plano

Acesse **hpanel.hostinger.com** e verifique:

- ❌ **Shared Hosting** → Node.js NÃO funciona (precisa upgrade)
- ✅ **Cloud Hosting** → Node.js funciona
- ✅ **VPS** → Melhor para produção

Se tiver Shared Hosting, faça upgrade para Cloud ou VPS!

---

## Passo 1: Preparar Código no GitHub

```bash
cd /Users/macbook/Documents/ProjetoEstudio/Site

git add .
git commit -m "Deploy: Hostinger production"
git push origin main
```

**Resultado:** URL do repositório como `https://github.com/seu-usuario/seu-repo.git`

---

## Passo 2: Acessar Terminal na Hostinger

**Opção A - No navegador (mais fácil):**
1. Abra hpanel.hostinger.com
2. Vá em **VPS/Cloud**
3. Clique em **Terminal** ou **Advanced → Terminal**

**Opção B - SSH (via seu computador):**
```bash
ssh root@seu-ip-vps
```
(Senha enviada por email pela Hostinger)

---

## Passo 3: Instalar Node.js, Git e Nginx

Cole **exatamente** isso no terminal Hostinger:

```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs git nginx

node --version
npm --version
```

**Saída esperada:**
```
v16.xx.x (ou superior)
8.xx.x (ou superior)
```

---

## Passo 4: Clonar Projeto e Instalar Dependências

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/seu-repo.git clique-zoom
cd clique-zoom

npm install --production
```

⏱️ **Isso leva 2-3 minutos na primeira vez...**

---

## Passo 5: Configurar .env

```bash
cp .env.example .env
nano .env
```

**Editar apenas:**
```
ADMIN_PASSWORD=admin123
NODE_ENV=production
```

**Salvar:** Pressione `Ctrl+O`, depois `Enter`, depois `Ctrl+X`

---

## Passo 6: Iniciar Aplicação com PM2

```bash
sudo npm install -g pm2

pm2 start src/server.js --name "clique-zoom"
pm2 startup
pm2 save

pm2 status
pm2 logs clique-zoom
```

**Saída esperada:**
```
│ clique-zoom │ running │ 0 │ 0s │ 0 B
```

---

## Passo 7: Configurar Nginx (Proxy Reverso)

```bash
sudo nano /etc/nginx/sites-available/clique-zoom
```

Cole isto (substituir `seu-dominio.com`):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## Passo 8: Ativar Nginx

```bash
sudo ln -s /etc/nginx/sites-available/clique-zoom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Saída esperada:**
```
nginx: configuration is OK
```

---

## Passo 9: Configurar SSL/HTTPS com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

**Responder:**
1. Email: `seu-email@gmail.com`
2. Aceitar termos: `y`
3. Compartilhar email: `n`
4. Redirecionar HTTP para HTTPS: `2`

**Resultado:** SSL ativado automaticamente! ✅

---

## Passo 10: Apontar Domínio (se for novo)

1. Compre domínio (pode ser na Hostinger mesmo)
2. Na Hostinger: **Domínios** → Seu domínio → **Apontar para Hostinger**
3. Use os nameservers da Hostinger
4. Aguarde 24-48h para propagar

---

## Passo 11: Testar

Abra no navegador:

```
https://seu-dominio.com           → Site público
https://seu-dominio.com/admin     → Painel (senha: admin123)
https://seu-dominio.com/cliente   → Galeria cliente
```

**Tudo funcionando?** 🎉

---

## Verificações Rápidas

```bash
# Ver status
pm2 status

# Ver logs (últimas 100 linhas)
pm2 logs clique-zoom --lines 100

# Ver logs nginx
sudo tail -f /var/log/nginx/error.log

# Testar localmente
curl http://localhost:3050
```

---

## Troubleshooting

**"Cannot find module"**
```bash
cd /var/www/clique-zoom
npm install --production
```

**"Port 3050 already in use"**
```bash
pm2 kill
pm2 start src/server.js --name "clique-zoom"
```

**"Nginx error"**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**"SSL certificate error"**
```bash
sudo certbot renew
```

---

## Backup Automático

```bash
# Criar backup do banco e uploads
crontab -e

# Adicionar esta linha (todo dia às 2 da manhã):
0 2 * * * tar -czf ~/backup-clique-zoom-$(date +\%Y\%m\%d).tar.gz /var/www/clique-zoom/uploads/
```

---

## Monitoramento Contínuo

```bash
# Ver em tempo real
watch -n 2 'pm2 status'

# Logs em tempo real
pm2 logs clique-zoom
```

---

## Comandos Úteis Pós-Deploy

```bash
# Reiniciar aplicação
pm2 restart clique-zoom

# Parar aplicação
pm2 stop clique-zoom

# Remover aplicação
pm2 delete clique-zoom

# Atualizar código
cd /var/www/clique-zoom
git pull origin main
npm install --production
pm2 restart clique-zoom
```

---

## Checklist Final

- [ ] Verificou tipo de plano (Cloud ou VPS)
- [ ] Código em repositório GitHub
- [ ] Node.js instalado (`node --version`)
- [ ] Projeto clonado em `/var/www/clique-zoom`
- [ ] `.env` configurado com `ADMIN_PASSWORD`
- [ ] PM2 iniciado (`pm2 status`)
- [ ] Nginx configurado e testado
- [ ] SSL/HTTPS ativo
- [ ] Domínio apontado
- [ ] Site acessível em `https://seu-dominio.com`
- [ ] Admin funciona com a senha

---

## Suporte

Documentação completa em:
- **HOSTINGER_DEPLOYMENT.md** - Guia detalhado com screenshots
- **DEPLOYMENT.md** - Guias para Vercel, Heroku, VPS
- **README.md** - Documentação geral do projeto

---

**Status:** ✅ Pronto para Produção  
**Última atualização:** 02/02/2026  
**Versão:** 1.0
