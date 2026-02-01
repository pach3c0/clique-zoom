# 📸 CLIQUE·ZOOM - Plataforma Fotográfica

## Sobre

CLIQUE·ZOOM é uma **plataforma completa** para fotógrafos apresentarem portfólios e gerenciarem sessões com clientes, tudo em um único lugar.

### 3 Camadas Integradas:
1. **Site Público** - Portfolio para atrair clientes
2. **Painel Admin** - Fotógrafo gerencia tudo (WordPress-style)
3. **Galeria Privada** - Cliente vê/baixa suas fotos

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js >= 16.0
- npm ou yarn

### Instalação & Execução

```bash
# Entrar no diretório
cd Site

# Instalar dependências
npm install

# Criar arquivo .env (cópia de .env.example)
cp .env.example .env

# Iniciar servidor
npm start
```

**O servidor estará disponível em:**
- 📸 Site: http://localhost:3050
- 🔧 Admin: http://localhost:3050/admin
- 👁️ Galeria: http://localhost:3050/galeria/[id]

---

## 📁 Estrutura do Projeto

```
Site/
├─ src/                      Backend (Express)
│  └─ server.js             Servidor principal
├─ public/                   Camada 1: Site Público
│  └─ index.html            Portfolio do fotógrafo
├─ admin/                    Camada 2: Painel Admin
│  └─ index.html            Dashboard (WordPress-style)
├─ cliente/                  Camada 3: Galeria Privada
│  └─ index.html            Galeria para cliente
├─ assets/                   Recursos Compartilhados
│  ├─ css/
│  ├─ js/
│  ├─ data/
│  └─ [imagens & logos]
├─ uploads/                  Arquivos enviados
├─ package.json
├─ .env.example             Variáveis de ambiente
└─ REQUISITOS_PLATAFORMA.md Especificação completa
```

---

## 📋 Funcionalidades

### Site Público (public/index.html)
- ✅ Hero section dinâmico
- ✅ 4 tipos de serviço (Família, Profissional, Criativo, Festivos)
- ✅ Guia de estilos (6 looks visuais)
- ✅ Calculadora de preço interativa
- ✅ Curadoria com IA (integração Gemini)
- ✅ Responsivo (mobile-first)

### Painel Admin (admin/index.html)
- 📊 Dashboard com métricas
- 📁 Gerenciar galerias de clientes
- ⚙️ Editar hero, serviços, preços
- 👥 CRM básico de clientes
- 📈 Relatórios e estatísticas
- 🖼️ Upload de imagens
- **Status:** Em desenvolvimento

### Galeria Cliente (cliente/index.html)
- 🖼️ Grade de fotos com miniaturas
- 💾 Download de fotos individuais
- 📦 Download em lote
- ⚠️ Marca d'água (customizável)
- 🔒 Acesso privado com token
- 💳 Suporte a 2 modelos: Premium (X fotos por Y) ou Por Foto
- **Status:** Em desenvolvimento

---

## 🔧 Dependências Principais

- **express** - Framework web
- **multer** - Upload de arquivos
- **cors** - CORS habilitado
- **sharp** - Processamento de imagens (marca d'água)
- **jsonwebtoken** - Autenticação JWT
- **dotenv** - Variáveis de ambiente

---

## 📝 API Endpoints

### Site Público
```
GET  /              Renderiza site público
GET  /api/portfolio Retorna dados de portfólio
GET  /api/style-guide Retorna guia de estilos
```

### Painel Admin
```
POST /api/admin/portfolio  Atualiza dados de portfólio
POST /api/admin/upload     Upload de imagens
```

### Galeria Cliente
```
GET  /galeria/:galleryId                Acessa galeria privada
GET  /api/galeria/:galleryId            Retorna dados da galeria
POST /api/galeria/:galleryId/download   Faz download de fotos
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
PORT=3050
NODE_ENV=development
ADMIN_PASSWORD=senha_temporaria
JWT_SECRET=sua_chave_secreta
```

---

## 🛠️ Desenvolvimento

### Adicionar uma nova feature

1. **Cria branch**
   ```bash
   git checkout -b feature/nome-feature
   ```

2. **Desenvolve e testa**
   ```bash
   npm start
   # Edita arquivos em public/, admin/, cliente/
   ```

3. **Commit e push**
   ```bash
   git add .
   git commit -m "Add: descrição da feature"
   git push origin feature/nome-feature
   ```

---

## 📊 Roadmap

### ✅ Concluído
- [x] Estrutura do projeto organizada
- [x] Server.js com 3 camadas

### 🔄 Em Progresso
- [ ] Painel admin funcional
- [ ] Galeria do cliente
- [ ] Autenticação JWT

### 📅 Próximos
- [ ] Marca d'água com Sharp
- [ ] Banco de dados (SQLite/PostgreSQL)
- [ ] Email (Nodemailer)
- [ ] Pagamento (Stripe/PagSeguro)
- [ ] Deploy

Ver [PLANO_DESENVOLVIMENTO.md](PLANO_DESENVOLVIMENTO.md) para detalhes.

---

## 🔐 Segurança

- ⚠️ **IMPORTANTE**: Ainda não implementada autenticação
- 🚨 **TODO**: Adicionar JWT/autenticação no painel admin
- 🔒 **TODO**: Validar acesso a galerias privadas
- 🛡️ **TODO**: HTTPS em produção

---

## 📚 Documentação

- [REQUISITOS_PLATAFORMA.md](REQUISITOS_PLATAFORMA.md) - Especificação funcional completa
- [PLANO_DESENVOLVIMENTO.md](PLANO_DESENVOLVIMENTO.md) - Roadmap de desenvolvimento
- [ESTRUTURA_ORGANIZADA.md](ESTRUTURA_ORGANIZADA.md) - Explicação da reorganização

---

## 🤝 Contribuir

Ao adicionar novas features:

1. Mantenha a estrutura de pastas
2. Evite código redundante
3. Use componentes reutilizáveis
4. Documente sua feature
5. Teste antes de commit

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a [documentação](.)
2. Veja o [plano de desenvolvimento](PLANO_DESENVOLVIMENTO.md)
3. Teste localmente: `npm start`

---

## 📄 Licença

MIT - Sinta-se livre para usar e modificar.

---

**Última atualização:** 01/02/2026  
**Versão:** 2.0.0  
**Status:** Em desenvolvimento
