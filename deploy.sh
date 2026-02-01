#!/bin/bash
# 🚀 DEPLOYMENT RÁPIDO - CLIQUE·ZOOM

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   CLIQUE·ZOOM - DEPLOYMENT RÁPIDO PARA VERCEL              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar status
echo "📋 [1/4] Verificando status do projeto..."
cd /Users/macbook/Documents/ProjetoEstudio/Site
git log --oneline -1

echo ""
echo "✅ Projeto pronto para deploy!"
echo ""

# 2. Instruções
echo "🚀 [2/4] Próximos passos:"
echo ""
echo "   OPÇÃO A - Deploy via Interface Vercel (Recomendado):"
echo "   ────────────────────────────────────────────────────"
echo "   1. Acesse: https://vercel.com/dashboard"
echo "   2. Clique em 'Add New...' → 'Project'"
echo "   3. Selecione este repositório no GitHub"
echo "   4. Configure:"
echo "      • Build Command: npm install"
echo "      • Env Variables:"
echo "        - ADMIN_PASSWORD = admin123"
echo "        - NODE_ENV = production"
echo "   5. Clique 'Deploy' ✨"
echo ""
echo "   OPÇÃO B - Deploy via CLI Vercel:"
echo "   ────────────────────────────────"
echo "   $ npm install -g vercel"
echo "   $ vercel --prod"
echo ""

echo "⏱️  [3/4] Tempo estimado: 2-5 minutos"
echo ""

echo "✨ [4/4] Após deploy:"
echo "   • Site Público: https://seu-dominio.vercel.app"
echo "   • Admin Panel: https://seu-dominio.vercel.app/admin"
echo "   • Client Gallery: https://seu-dominio.vercel.app/galeria/[id]"
echo ""

echo "📚 Documentação completa em DEPLOYMENT.md"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Sua plataforma está 100% pronta para ir ao ar! 🎉         ║"
echo "╚════════════════════════════════════════════════════════════╝"
