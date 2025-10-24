# Cloud Storage API - NestJS

Sistema de armazenamento em nuvem com integração Backblaze B2, autenticação externa e compartilhamento de arquivos/pastas.

## 🚀 Tecnologias

- **NestJS** com Fastify
- **Prisma ORM** com PostgreSQL
- **Backblaze B2** para armazenamento de arquivos
- **Autenticação externa** via auth-tehkly
- **TypeScript**

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta Backblaze B2
- pnpm (ou npm/yarn)

## 🔧 Instalação

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Instalar pacotes necessários

```bash
pnpm add @nestjs/config @fastify/cookie @fastify/multipart
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Database
DATABASE_URL='postgresql://user:password@localhost:5432/cloud_db'

# Auth
AUTH_API_URL='https://api-auth.tehkly.com'
JWT_SECRET='your_jwt_secret'
JWT_EXPIRES_IN='7d'

# Backblaze B2
B2_APPLICATION_KEY_ID='your_key_id'
B2_APPLICATION_KEY='your_key'
B2_BUCKET_NAME='your_bucket_name'
B2_ENDPOINT='https://s3.us-west-002.backblazeb2.com'
```

### 4. Subir banco de dados com Docker

```bash
docker-compose up -d
```

### 5. Executar migrations do Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

## 🏃 Executando o projeto

### Desenvolvimento

```bash
pnpm run start:dev
```

### Produção

```bash
pnpm run build
pnpm run start:prod
```

## 📚 Endpoints da API

### 🔐 Autenticação

Todas as rotas requerem autenticação via cookie `accessToken` validado pelo serviço auth-tehkly.

### 📁 Pastas (Folders)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/folders` | Criar pasta |
| GET | `/folders` | Listar pastas do usuário |
| GET | `/folders/:id` | Detalhes da pasta |
| PATCH | `/folders/:id` | Atualizar pasta |
| DELETE | `/folders/:id?recursive=true` | Deletar pasta |
| GET | `/folders/shared-with-me` | Pastas compartilhadas comigo |
| GET | `/folders/shared-by-me` | Pastas que compartilhei |

#### Criar pasta

```json
POST /folders
{
  "name": "Documentos",
  "parentId": "uuid-opcional",
  "color": "#FF5733",
  "description": "Meus documentos"
}
```

### 📄 Arquivos (Files)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/files/upload` | Upload de arquivo |
| GET | `/files` | Listar arquivos do usuário |
| GET | `/files?folderId=uuid` | Listar arquivos de uma pasta |
| GET | `/files/:id` | Detalhes do arquivo |
| GET | `/files/:id/download` | Download do arquivo |
| PATCH | `/files/:id` | Atualizar metadados |
| DELETE | `/files/:id` | Deletar arquivo |
| GET | `/files/shared-with-me` | Arquivos compartilhados comigo |
| GET | `/files/shared-by-me` | Arquivos que compartilhei |

#### Upload de arquivo

```bash
POST /files/upload
Content-Type: multipart/form-data

file: [arquivo]
name: "documento.pdf"
folderId: "uuid-da-pasta"
description: "Descrição opcional"
tags: ["tag1", "tag2"]
```

### 🤝 Compartilhamento

#### Compartilhar Pasta

```json
POST /folder-shares
{
  "folderId": "uuid",
  "userId": "uuid-do-usuario",
  "role": "EDITOR" // ou "VIEWER"
}
```

#### Compartilhar Arquivo

```json
POST /file-shares
{
  "fileId": "uuid",
  "userId": "uuid-do-usuario",
  "role": "EDITOR" // ou "VIEWER"
}
```

#### Listar compartilhamentos

```
GET /folder-shares/folder/:folderId
GET /file-shares/file/:fileId
```

#### Atualizar/Remover compartilhamento

```
PATCH /folder-shares/:id
DELETE /folder-shares/:id

PATCH /file-shares/:id
DELETE /file-shares/:id
```

## 🗂️ Estrutura do Projeto

```
src/
├── auth/                    # Autenticação externa
│   ├── infrastructure/
│   │   └── guards/
│   │       └── auth.guard.ts
│   └── application/
│       └── auth.module.ts
├── backblaze/              # Integração Backblaze B2
│   ├── backblaze.service.ts
│   └── backblaze.module.ts
├── file/                   # Módulo de arquivos
│   ├── application/
│   │   ├── services/
│   │   │   ├── file.service.ts
│   │   │   └── file-share.service.ts
│   │   └── file.module.ts
│   ├── dto/
│   ├── infrastructure/
│   │   └── controllers/
│   │       └── file-share.controller.ts
│   └── file.controller.ts
├── folder/                 # Módulo de pastas
│   ├── application/
│   │   ├── services/
│   │   │   ├── folder.service.ts
│   │   │   └── folder-share.service.ts
│   │   └── folder.module.ts
│   ├── dto/
│   └── infrastructure/
│       └── controllers/
│           ├── folder.controller.ts
│           └── folder-share.controller.ts
├── user/                   # Módulo de usuários
│   ├── application/
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   └── user.module.ts
│   └── infrastructure/
│       └── controllers/
│           └── user.controller.ts
├── prisma/                 # Prisma ORM
│   └── prisma.service.ts
└── main.ts
```

## 🔒 Segurança

- Todas as rotas protegidas com `AuthGuard`
- Validação de permissões (owner, editor, viewer)
- Verificação de quota de armazenamento
- Validação de tamanho de arquivo (max 100MB)
- Hash SHA256 dos arquivos para deduplicação

## 📊 Schema do Banco de Dados

### User
- Sincronizado com auth-tehkly
- Quota e uso de armazenamento
- Pasta raiz automática

### Folder
- Estrutura hierárquica (pastas e subpastas)
- Compartilhamento com permissões
- Metadados (cor, descrição)

### File
- Armazenamento no Backblaze B2
- Metadados completos (mime-type, size, tags)
- Compartilhamento com permissões
- Hash para deduplicação

### FolderShare / FileShare
- Permissões: OWNER, EDITOR, VIEWER
- Compartilhamento organizacional por domínio

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes e2e
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📝 Notas Importantes

1. **Autenticação Externa**: O sistema não gerencia signup/signin. Isso é feito pelo serviço `auth-tehkly`.

2. **Backblaze B2**: Configure corretamente as credenciais B2. O bucket deve existir antes de usar a API.

3. **Quota de Storage**: Por padrão, usuários têm quota 0. Implemente sistema de subscription para definir quotas.

4. **Pasta Raiz**: Criada automaticamente no primeiro login do usuário.

5. **Permissões**:
   - **OWNER**: Todas as permissões
   - **EDITOR**: Pode editar, fazer upload, renomear
   - **VIEWER**: Apenas visualizar e fazer download

## 🐛 Troubleshooting

### Erro: Cannot find module '@nestjs/config'

```bash
pnpm add @nestjs/config
```

### Erro de conexão com PostgreSQL

Verifique se o Docker está rodando:
```bash
docker-compose ps
```

### Erro de autenticação Backblaze

Verifique as credenciais no `.env` e se o bucket existe.

## 📄 Licença

UNLICENSED - Projeto privado

## 👥 Autor

Desenvolvido para o projeto Cloud Tehkly
