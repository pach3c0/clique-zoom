# 🚀 GUIA DE DEPLOY NA HOSTINGER - CLIQUE·ZOOM

## ✅ Atualização (02/02/2026)
- Produção: API e persistência via MongoDB com fallback em memória.
- Upload de imagens: em produção (Vercel) o filesystem é read-only; upload depende de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sem isso, usar URL externa.
- Pendência: rotacionar a senha do MongoDB Atlas e atualizar o `MONGODB_URI` no Vercel.

**Data:** 02/02/2026  
**Versão:** 2.0.1  
**Plataforma:** Hostinger

---

## 🎯 ANTES DE COMEÇAR

### Verificar Tipo de Plano
1. Acessar: https://hpanel.hostinger.com
2. Dashboard → Planos
3. Identificar seu tipo:
   - ❌ **Shared Hosting** → Node.js NÃO funciona (limitado a PHP)
   - ✅ **Cloud Hosting** → Node.js funciona
   - ✅ **VPS** → Node.js funciona (recomendado)

**Se você tem Shared Hosting:** Você precisa fazer upgrade para Cloud ou VPS!

---

## ✅ OPÇÃO 1: CLOUD HOSTING (Recomendado para Iniciante)

### 1.1 Preparar Domínio
1. No hPanel Hostinger:
   - Domínios → Seu domínio
   - Apontamentos DNS (já deve estar apontando para Hostinger)
   - SSL: Hostinger fornece gratuito ✓

### 1.2 Acessar Aplicações
1. Dashboard → Aplicações
2. Procurar por "Node.js" ou "Node"
3. Clique em "Instalar"
4. Selecione:
   - **Versão Node.js:** 16.0 ou superior
   - **Domínio:** seu-dominio.com
   - **Porta:** 3050 (será convertida para 80/443)

### 1.3 Clonar Repositório
```bash
# Hostinger fornece SSH access
# Conectar via terminal ou hPanel
cd /home/seu-usuario/public_html

# Se existir arquivo index.html, fazer backup
mv index.html index.html.bak

# Clonar seu repositório Git
git clone <seu-repo-url> .

# ou, se usar arquivo .zip:
# Fazer upload do ZIP via File Manager
# Descompactar
```

### 1.4 Instalar Dependências
```bash
npm install --production

# Criar arquivo .env
cp .env.example .env
nano .env
# Adicionar:
# ADMIN_PASSWORD=admin123
# NODE_ENV=production
```

### 1.5 Iniciar Aplicação
```bash
# Usar PM2 (gerenciador de processos)
npm install -g pm2

# Iniciar
pm2 start src/server.js --name "clique-zoom"
pm2 startup
pm2 save

# Verificar status
pm2 status
```

### 1.6 Configurar Proxy (Nginx)
Hostinger Cloud geralmente configura automaticamente!
Mas se precisar manual:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ✅ OPÇÃO 2: VPS HOSTINGER (Melhor Controle)

### 2.1 Acessar VPS via SSH

```bash
# Terminal (macOS/Linux) ou PuTTY (Windows)
ssh seu-usuario@seu-dominio.com
# ou ssh root@seu-ip-vps

# Ou usar hPanel:
# Dashboard → VPS → Terminal (no navegador)
```

### 2.2 Instalar Node.js

```bash
# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2.3 Clonar Projeto

```bash
# Criar diretório
sudo mkdir -p /var/www/clique-zoom
sudo chown $USER:$USER /var/www/clique-zoom
cd /var/www/clique-zoom

# Clonar repositório
git clone <seu-repo-url> .

# Se não tiver Git instalado:
sudo apt-get install -y git
```

### 2.4 Instalar Dependências

```bash
npm install --production

# Criar .env
cp .env.example .env
nano .env

# Adicionar:
# ADMIN_PASSWORD=admin123
# NODE_ENV=production
# PORT=3050
```

### 2.5 Configurar PM2 (Manter Processo Rodando)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start src/server.js --name "clique-zoom"

# Configurar para iniciar com sistema
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs

# Para parar/reiniciar
# pm2 stop clique-zoom
# pm2 restart clique-zoom
# pm2 delete clique-zoom
```

### 2.6 Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt-get install -y nginx

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/clique-zoom
```

**Adicionar conteúdo:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;  # Limite de upload
    }
}
```

**Ativar site:**
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/clique-zoom \
           /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 2.7 Configurar SSL (HTTPS) com Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Gerar certificado (automático com Nginx)
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Verificar auto-renew (automático no Certbot)
sudo certbot renew --dry-run
```

Depois, seu Nginx será atualizado automaticamente para HTTPS!

---

## 🔐 CONFIGURAÇÕES DE SEGURANÇA

### Firewall
```bash
# Ver status
sudo ufw status

# Ativar
sudo ufw enable

# Permitir portas essenciais
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Verificar
sudo ufw status
```

### Backup de Dados
```bash
# Fazer backup local
tar -czf clique-zoom-backup-$(date +%Y%m%d).tar.gz \
  /var/www/clique-zoom/

# Fazer backup de uploads também
tar -czf uploads-$(date +%Y%m%d).tar.gz \
  /var/www/clique-zoom/uploads/
```

---

## 🌍 APONTAR DOMÍNIO NA HOSTINGER

### Via hPanel (Mais Fácil)
1. Dashboard → Domínios
2. Selecione seu domínio
3. "Gerenciar apontamentos" ou "Nameservers"
4. Se VPS próprio:
   - Apontar para IP da VPS (fornecido pela Hostinger)
5. Se Cloud Hostinger:
   - Já deve estar automático

### Via DNS Manual (Se Necessário)
1. Acessar registrador (Hostinger ou outro)
2. Adicionar registro A:
   - **Nome:** @ (ou vazio)
   - **Valor:** IP da VPS
   - **TTL:** 3600

3. Adicionar www (CNAME):
   - **Nome:** www
   - **Valor:** seu-dominio.com
   - **TTL:** 3600

---

## ✅ CHECKLIST DE DEPLOY

### Antes de Começar
- [ ] Verificar tipo de plano (Cloud ou VPS)
- [ ] Domínio apontado para Hostinger
- [ ] Código pronto em Git (ou arquivo .zip)
- [ ] Arquivo .env.example correto

### Durante Setup
- [ ] Node.js instalado
- [ ] Dependências instaladas (npm install)
- [ ] Arquivo .env criado com senhas
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado (se VPS)
- [ ] SSL/HTTPS ativado
- [ ] Firewall configurado

### Testes Finais
- [ ] Site acessível em https://seu-dominio.com
- [ ] Admin funciona em https://seu-dominio.com/admin
- [ ] Senha admin123 funciona
- [ ] Editor de fotos funciona
- [ ] Upload de imagens funciona
- [ ] Sem erros no console (F12)

### Monitoramento
- [ ] Verificar PM2: `pm2 logs clique-zoom`
- [ ] Verificar Nginx: `sudo tail -f /var/log/nginx/error.log`
- [ ] Monitorar performance

---

## 🆘 TROUBLESHOOTING NA HOSTINGER

### "Erro de Conexão - Site não carrega"
```bash
# Verificar se Node.js está rodando
pm2 status

# Se não está:
pm2 start src/server.js --name "clique-zoom"

# Verificar logs
pm2 logs clique-zoom
```

### "HTTPS não funciona"
```bash
# Verificar certificado
sudo certbot certificates

# Renovar se necessário
sudo certbot renew --force-renewal

# Verificar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### "Admin password não funciona"
```bash
# Confirmar .env tem a senha
cat .env

# Se não estiver, editar
nano .env

# Depois reiniciar
pm2 restart clique-zoom
```

### "Upload de imagens falha"
```bash
# Verificar permissões da pasta uploads
ls -la /var/www/clique-zoom/uploads/

# Se problema, ajustar permissões
chmod 755 /var/www/clique-zoom/uploads/

# Verificar limite de upload no Nginx
# Editar: /etc/nginx/sites-available/clique-zoom
# Adicionar: client_max_body_size 50M;
```

### "Página branca / Erro 502"
```bash
# Verificar se Node.js está rodando
pm2 status

# Verificar logs
pm2 logs clique-zoom

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Testar localmente
curl http://localhost:3050
```

---

## 📞 CONTATO HOSTINGER SUPPORT

Se precisar de ajuda oficial:
1. hPanel → Support
2. Chat ao vivo (geralmente 24/7)
3. Email: support@hostinger.com
4. Telefone: +55 11 2829-2050 (Brasil)

---

## 🎉 PRÓXIMAS ETAPAS

### Pós-Deploy
- [ ] Testar 24h
- [ ] Fazer backup inicial
- [ ] Configurar email de notificações (Fase 2)
- [ ] Monitorar performance

### Fase 2 (Database)
```bash
# Quando quiser adicionar banco de dados:
sudo apt-get install -y postgresql
# ou
sudo apt-get install -y mysql-server
```

---

## 📚 RECURSOS ÚTEIS

- [Documentação Node.js](https://nodejs.org/docs/)
- [PM2 Docs](https://pm2.keymetrics.io/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Certbot Docs](https://certbot.eff.org/)

---

**Status:** Pronto para Deploy ✅  
**Última Atualização:** 02/02/2026  
**Próximo Passo:** Fazer deploy e testar!
