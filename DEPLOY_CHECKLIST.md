# 🚀 DEPLOY CHECKLIST - CLIQUE·ZOOM

## ✅ PRÉ-DEPLOY (Antes de colocar no ar)

### Testes Locais
- [ ] Servidor rodando: `npm start`
- [ ] Site público acessível em `http://localhost:3050`
- [ ] Admin panel acessível em `http://localhost:3050/admin`
- [ ] Credencial admin123 funciona
- [ ] Editor de fotos funciona (abrir foto, editar, salvar)
- [ ] Sincronização funcionando (editar admin → site público atualiza)
- [ ] Upload de imagens funciona (JPG/PNG apenas)
- [ ] Sem erros no console (F12)

### Limpeza
- [ ] Remover arquivos temporários: `rm -rf uploads/*`
- [ ] Confirmar .env.example está correto
- [ ] Confirmar .gitignore está completo
- [ ] Verificar não há senhas em código

### Git & Repository
- [ ] Todos os commits estão sincronizados
- [ ] Branch `main` está atualizado
- [ ] Sem arquivos não commitados importantes

---

## 🌍 VERCEL DEPLOYMENT

### 1. Preparar Repositório
```bash
git add .
git commit -m "Deploy: Phase 1 - Production ready"
git push origin main
```

### 2. Primeira Vez (Setup Inicial)
```bash
npm install -g vercel
vercel login
cd /Users/macbook/Documents/ProjetoEstudio/Site
vercel
```

### 3. Configurar Variáveis de Ambiente
No Dashboard Vercel (https://vercel.com):
1. Selecionar projeto
2. Settings → Environment Variables
3. Adicionar:
   - `ADMIN_PASSWORD` = `admin123` (ou outra senha)
   - `NODE_ENV` = `production`

### 4. Deploy de Produção
```bash
vercel --prod
```

### 5. Verificar Deploy
- [ ] Build passou ✓
- [ ] Deployment concluído ✓
- [ ] URL funcional ✓
- [ ] HTTPS ativado ✓
- [ ] Admin acessível ✓

---

## 🔗 CONFIGURAR DOMÍNIO

### Opção A: Usar Domínio Vercel (Gratuito)
- Seu app terá URL: `seu-app-name.vercel.app`

### Opção B: Usar Domínio Customizado
1. Comprar domínio em (Godaddy, Namecheap, etc)
2. Dashboard Vercel → Settings → Domains
3. Adicionar domínio
4. Apontando registros DNS (instruções em Vercel)

---

## ✨ PÓS-DEPLOY

### Verificações
- [ ] Site carrega em `https://seu-dominio.com`
- [ ] Admin acessível em `https://seu-dominio.com/admin`
- [ ] Editor de fotos funciona
- [ ] Imagens carregam corretamente
- [ ] HTTPS está ativado
- [ ] Performance OK (abrir DevTools → Network)

### Monitoramento
- [ ] Verificar logs: `vercel logs seu-dominio`
- [ ] Monitorar erros (Vercel dashboard)
- [ ] Testar em celular

### Backup
```bash
# Fazer backup do projeto local
tar -czf clique-zoom-backup-$(date +%Y%m%d).tar.gz \
  /Users/macbook/Documents/ProjetoEstudio/Site/
```

---

## 🆘 TROUBLESHOOTING

### "Build failed"
- [ ] Verificar logs completos em Vercel dashboard
- [ ] Confirmar `npm start` funciona localmente
- [ ] Confirmar Node version compatível

### "Site branco / erros 500"
- [ ] Verificar variáveis de ambiente
- [ ] Verificar logs: `vercel logs`
- [ ] Testar localmente: `NODE_ENV=production npm start`

### "Admin password não funciona"
- [ ] Confirmar `ADMIN_PASSWORD` está em Vercel
- [ ] Confirmar valor correto
- [ ] Fazer redeploy: `vercel --prod`

---

## 📱 TESTES PÓS-DEPLOY

### Desktop
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Mobile
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet

### Funcionalidades
- [ ] Foto carrega corretamente
- [ ] Botões funcionam
- [ ] Forms funcionam
- [ ] Editor de fotos (desktop)
- [ ] Responsivo (mobile)

---

## 📞 ANTES DE COMUNICAR A CLIENTES

- [ ] Testar 24h antes de avisar
- [ ] Confirmar performance está OK
- [ ] Fazer backup final
- [ ] Documentar URLs públicas
- [ ] Criar guia de uso para admin (se necessário)

---

## 🎉 PRONTO!

Se todos os itens acima estão marcados, parabéns! 🎊

**Seu site CLIQUE·ZOOM está no ar!**

---

**Próximas Fases:**
- Fase 2: Database + Autenticação
- Fase 3: Marca d'água + Email
- Fase 4: Pagamento + Stripe

---

**Data de Check:** 02/02/2026  
**Versão:** 2.0.1  
**Status:** Pronto para Deploy ✅
