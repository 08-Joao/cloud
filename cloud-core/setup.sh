#!/bin/bash

echo "🚀 Cloud Storage API - Setup Script"
echo "===================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar Node.js
echo "📦 Verificando Node.js..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js não encontrado. Instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

# 2. Verificar pnpm
echo ""
echo "📦 Verificando pnpm..."
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓ pnpm instalado: $PNPM_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ pnpm não encontrado. Instalando...${NC}"
    npm install -g pnpm
fi

# 3. Instalar dependências
echo ""
echo "📦 Instalando dependências..."
pnpm install

# 4. Instalar dependências necessárias
echo ""
echo "📦 Verificando dependências necessárias..."

DEPS_TO_INSTALL=""

if ! grep -q "@nestjs/config" package.json; then
    DEPS_TO_INSTALL="$DEPS_TO_INSTALL @nestjs/config"
fi

if ! grep -q "@fastify/cookie" package.json; then
    DEPS_TO_INSTALL="$DEPS_TO_INSTALL @fastify/cookie"
fi

if ! grep -q "@fastify/multipart" package.json; then
    DEPS_TO_INSTALL="$DEPS_TO_INSTALL @fastify/multipart"
fi

if [ -n "$DEPS_TO_INSTALL" ]; then
    echo -e "${YELLOW}⚠ Instalando:$DEPS_TO_INSTALL${NC}"
    pnpm add $DEPS_TO_INSTALL
else
    echo -e "${GREEN}✓ Todas as dependências já instaladas${NC}"
fi

# 5. Verificar Docker
echo ""
echo "🐳 Verificando Docker..."
if command_exists docker; then
    DOCKER_VERSION=$(docker -v)
    echo -e "${GREEN}✓ Docker instalado: $DOCKER_VERSION${NC}"
    
    # Perguntar se quer subir o banco
    read -p "Deseja subir o PostgreSQL com Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 Subindo PostgreSQL..."
        docker-compose up -d
        echo -e "${GREEN}✓ PostgreSQL rodando${NC}"
        sleep 3
    fi
else
    echo -e "${YELLOW}⚠ Docker não encontrado. Você precisará configurar PostgreSQL manualmente.${NC}"
fi

# 6. Configurar .env
echo ""
echo "⚙️  Configurando variáveis de ambiente..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
    echo -e "${YELLOW}⚠ IMPORTANTE: Edite o arquivo .env com suas credenciais!${NC}"
else
    echo -e "${GREEN}✓ Arquivo .env já existe${NC}"
fi

# 7. Gerar Prisma Client
echo ""
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# 8. Executar migrations
echo ""
read -p "Deseja executar as migrations do banco? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Executando migrations..."
    npx prisma migrate dev --name init
    echo -e "${GREEN}✓ Migrations executadas${NC}"
fi

# 9. Resumo
echo ""
echo "===================================="
echo -e "${GREEN}✓ Setup concluído!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "1. Edite o arquivo .env com suas credenciais:"
echo "   - DATABASE_URL"
echo "   - AUTH_API_URL"
echo "   - B2_APPLICATION_KEY_ID"
echo "   - B2_APPLICATION_KEY"
echo "   - B2_BUCKET_NAME"
echo ""
echo "2. Execute o projeto:"
echo "   pnpm run start:dev"
echo ""
echo "3. Acesse a API em:"
echo "   http://localhost:4002"
echo ""
echo "4. PgAdmin (se Docker foi iniciado):"
echo "   http://localhost:5050"
echo "   Email: admin@cloud.com"
echo "   Senha: admin"
echo ""
echo "===================================="
