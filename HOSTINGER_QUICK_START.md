# ⚡ HOSTINGER - GUIA RÁPIDO (5 PASSOS)

## 1️⃣ VERIFICAR TIPO DE PLANO

```
Acesso: hpanel.hostinger.com
├── Shared Hosting? ❌ Node.js NÃO funciona
├── Cloud Hosting? ✅ Node.js funciona
└── VPS? ✅ Melhor opção
```

**Se tem Shared Hosting:** Precisa fazer upgrade!

---

## 2️⃣ PREPARAR REPOSITÓRIO

```bash
# Seu computador - fazer commit final
cd /Users/macbook/Documents/ProjetoEstudio/Site

git add .
git commit -m "Deploy: Hostinger ready"
git push origin main

# Você terá a URL do repositório como:
# https://github.com/seu-usuario/seu-repo.git
```

---

## 3️⃣ ACESSAR VPS/CLOUD HOSTINGER

### Via hPanel (mais fácil):
```
Dashboard → VPS/Cloud → Terminal
```

### Ou via SSH (seu computador):
```bash
ssh root@seu-ip-vps
# Senha: (fornecida por email pela Hostinger)
```

---

## 4️⃣ INSTALAR E RODAR (Copy & Paste)

```bash
# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# 3. Clonar seu projeto
cd /var/www
sudo git clone https://github.com/seu-usuario/seu-repo.git clique-zoom
cd clique-zoom

# 4. Instalar dependências
npm install --production

# 5. Criar .env
cp .env.example .env
nano .env
# Adicionar: ADMIN_PASSWORD=admin123
# Salvar: Ctrl+O, Enter, Ctrl+X

# 6. Instalar PM2 (mantém rodando 24/7)
sudo npm install -g pm2
pm2 start src/server.js --name "clique-zoom"
pm2 startup
pm2 save

# 7. Configurar Nginx (proxy)
sudo tee /etc/nginx/sites-available/clique-zoom > /dev/null << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# 8. Ativar site
sudo ln -s /etc/nginx/sites-available/clique-zoom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Ativar HTTPS (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# 10. Pronto!
echo "✅ Deploy concluído!"
```

---

## 5️⃣ VERIFICAR SE ESTÁ RODANDO

```bash
# Checar status
pm2 status

# Ver logs
pm2 logs clique-zoom

# Testar localmente
curl http://localhost:3050

# Ou acessar no navegador:
# https://seu-dominio.com
# https://seu-dominio.com/admin (senha: admin123)
```

---

## ⚡ CHECKLIST FINAL

- [ ] Plano é Cloud ou VPS
- [ ] Código em repositório Git
- [ ] SSH acessível
- [ ] Node.js instalado
- [ ] PM2 rodando (`pm2 status`)
- [ ] Nginx configurado (`sudo nginx -t`)
- [ ] SSL ativado (`sudo certbot certificates`)
- [ ] Site acessível em https://seu-dominio.com
- [ ] Admin funciona (`https://seu-dominio.com/admin`)

---

## 🆘 PROBLEMA? TENTE ISSO

```bash
# Ver se Node está rodando
pm2 status

# Reiniciar
pm2 restart clique-zoom

# Ver erro
pm2 logs clique-zoom

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Teste local
curl http://localhost:3050

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

**Pronto para ir ao ar!** 🚀
