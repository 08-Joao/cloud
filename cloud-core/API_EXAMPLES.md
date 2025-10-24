# Exemplos de Requisições - Cloud Storage API

## 🔐 Autenticação

Todas as requisições precisam do cookie `accessToken` obtido do serviço auth-tehkly.

```bash
# As requisições devem incluir o cookie
Cookie: accessToken=seu_token_aqui
```

---

## 📁 Pastas (Folders)

### 1. Criar Pasta

```bash
curl -X POST http://localhost:4002/folders \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "name": "Documentos Importantes",
    "color": "#FF5733",
    "description": "Pasta para documentos importantes"
  }'
```

### 2. Criar Subpasta

```bash
curl -X POST http://localhost:4002/folders \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "name": "Contratos",
    "parentId": "uuid-da-pasta-pai",
    "color": "#3498db"
  }'
```

### 3. Listar Todas as Pastas

```bash
curl -X GET http://localhost:4002/folders \
  -H "Cookie: accessToken=seu_token"
```

### 4. Detalhes de uma Pasta

```bash
curl -X GET http://localhost:4002/folders/{folder-id} \
  -H "Cookie: accessToken=seu_token"
```

### 5. Atualizar Pasta

```bash
curl -X PATCH http://localhost:4002/folders/{folder-id} \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "name": "Novo Nome",
    "color": "#2ecc71"
  }'
```

### 6. Deletar Pasta (vazia)

```bash
curl -X DELETE http://localhost:4002/folders/{folder-id} \
  -H "Cookie: accessToken=seu_token"
```

### 7. Deletar Pasta (recursivo - com conteúdo)

```bash
curl -X DELETE "http://localhost:4002/folders/{folder-id}?recursive=true" \
  -H "Cookie: accessToken=seu_token"
```

### 8. Pastas Compartilhadas Comigo

```bash
curl -X GET http://localhost:4002/folders/shared-with-me \
  -H "Cookie: accessToken=seu_token"
```

### 9. Pastas que Compartilhei

```bash
curl -X GET http://localhost:4002/folders/shared-by-me \
  -H "Cookie: accessToken=seu_token"
```

---

## 📄 Arquivos (Files)

### 1. Upload de Arquivo

```bash
curl -X POST http://localhost:4002/files/upload \
  -H "Cookie: accessToken=seu_token" \
  -F "file=@/caminho/para/arquivo.pdf" \
  -F "name=Documento Importante" \
  -F "folderId=uuid-da-pasta" \
  -F "description=Descrição do arquivo" \
  -F "tags[]=contrato" \
  -F "tags[]=2024"
```

### 2. Listar Todos os Arquivos

```bash
curl -X GET http://localhost:4002/files \
  -H "Cookie: accessToken=seu_token"
```

### 3. Listar Arquivos de uma Pasta

```bash
curl -X GET "http://localhost:4002/files?folderId={folder-id}" \
  -H "Cookie: accessToken=seu_token"
```

### 4. Detalhes de um Arquivo

```bash
curl -X GET http://localhost:4002/files/{file-id} \
  -H "Cookie: accessToken=seu_token"
```

### 5. Download de Arquivo

```bash
curl -X GET http://localhost:4002/files/{file-id}/download \
  -H "Cookie: accessToken=seu_token" \
  -o arquivo_baixado.pdf
```

### 6. Atualizar Metadados do Arquivo

```bash
curl -X PATCH http://localhost:4002/files/{file-id} \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "name": "Novo Nome do Arquivo",
    "description": "Nova descrição",
    "tags": ["tag1", "tag2", "tag3"]
  }'
```

### 7. Deletar Arquivo

```bash
curl -X DELETE http://localhost:4002/files/{file-id} \
  -H "Cookie: accessToken=seu_token"
```

### 8. Arquivos Compartilhados Comigo

```bash
curl -X GET http://localhost:4002/files/shared-with-me \
  -H "Cookie: accessToken=seu_token"
```

### 9. Arquivos que Compartilhei

```bash
curl -X GET http://localhost:4002/files/shared-by-me \
  -H "Cookie: accessToken=seu_token"
```

---

## 🤝 Compartilhamento de Pastas

### 1. Compartilhar Pasta

```bash
curl -X POST http://localhost:4002/folder-shares \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "folderId": "uuid-da-pasta",
    "userId": "uuid-do-usuario-destino",
    "role": "EDITOR"
  }'
```

**Roles disponíveis:**
- `OWNER`: Todas as permissões (apenas o criador)
- `EDITOR`: Pode editar, criar, fazer upload
- `VIEWER`: Apenas visualizar e fazer download

### 2. Listar Compartilhamentos de uma Pasta

```bash
curl -X GET http://localhost:4002/folder-shares/folder/{folder-id} \
  -H "Cookie: accessToken=seu_token"
```

### 3. Atualizar Permissão de Compartilhamento

```bash
curl -X PATCH http://localhost:4002/folder-shares/{share-id} \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "role": "VIEWER"
  }'
```

### 4. Remover Compartilhamento

```bash
curl -X DELETE http://localhost:4002/folder-shares/{share-id} \
  -H "Cookie: accessToken=seu_token"
```

---

## 🤝 Compartilhamento de Arquivos

### 1. Compartilhar Arquivo

```bash
curl -X POST http://localhost:4002/file-shares \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "fileId": "uuid-do-arquivo",
    "userId": "uuid-do-usuario-destino",
    "role": "EDITOR"
  }'
```

**Roles disponíveis:**
- `EDITOR`: Pode editar metadados e fazer download
- `VIEWER`: Apenas visualizar e fazer download

### 2. Listar Compartilhamentos de um Arquivo

```bash
curl -X GET http://localhost:4002/file-shares/file/{file-id} \
  -H "Cookie: accessToken=seu_token"
```

### 3. Atualizar Permissão de Compartilhamento

```bash
curl -X PATCH http://localhost:4002/file-shares/{share-id} \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "role": "VIEWER"
  }'
```

### 4. Remover Compartilhamento

```bash
curl -X DELETE http://localhost:4002/file-shares/{share-id} \
  -H "Cookie: accessToken=seu_token"
```

---

## 👤 Usuários

### 1. Listar Todos os Usuários

```bash
curl -X GET http://localhost:4002/users \
  -H "Cookie: accessToken=seu_token"
```

### 2. Detalhes do Usuário

```bash
curl -X GET http://localhost:4002/users/{user-id} \
  -H "Cookie: accessToken=seu_token"
```

---

## 📊 Fluxo Completo de Exemplo

### Cenário: Upload de arquivo em uma nova pasta e compartilhamento

```bash
# 1. Criar pasta
FOLDER_RESPONSE=$(curl -s -X POST http://localhost:4002/folders \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d '{
    "name": "Projeto X",
    "color": "#3498db"
  }')

FOLDER_ID=$(echo $FOLDER_RESPONSE | jq -r '.id')
echo "Pasta criada: $FOLDER_ID"

# 2. Upload de arquivo
FILE_RESPONSE=$(curl -s -X POST http://localhost:4002/files/upload \
  -H "Cookie: accessToken=seu_token" \
  -F "file=@documento.pdf" \
  -F "name=Proposta Projeto X" \
  -F "folderId=$FOLDER_ID" \
  -F "tags[]=proposta" \
  -F "tags[]=2024")

FILE_ID=$(echo $FILE_RESPONSE | jq -r '.id')
echo "Arquivo enviado: $FILE_ID"

# 3. Compartilhar pasta com outro usuário
curl -X POST http://localhost:4002/folder-shares \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token" \
  -d "{
    \"folderId\": \"$FOLDER_ID\",
    \"userId\": \"uuid-do-colega\",
    \"role\": \"EDITOR\"
  }"

echo "Pasta compartilhada com sucesso!"
```

---

## 🧪 Testando com Postman/Insomnia

### Configuração de Ambiente

```json
{
  "base_url": "http://localhost:4002",
  "access_token": "seu_token_aqui"
}
```

### Headers Globais

```
Cookie: accessToken={{access_token}}
Content-Type: application/json
```

---

## ⚠️ Códigos de Erro Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| 401 | Token inválido ou expirado | Faça login novamente |
| 403 | Sem permissão | Verifique se você tem acesso ao recurso |
| 404 | Recurso não encontrado | Verifique o ID |
| 400 | Dados inválidos | Verifique o formato da requisição |
| 413 | Arquivo muito grande | Max 100MB |
| 507 | Quota excedida | Libere espaço ou aumente a quota |

---

## 📝 Notas

1. **Autenticação**: Certifique-se de ter um token válido do serviço auth-tehkly
2. **UUIDs**: Todos os IDs são UUIDs v4
3. **Timestamps**: Formato ISO 8601 (ex: `2024-01-15T10:30:00.000Z`)
4. **Tamanho de Arquivo**: Limite de 100MB por arquivo
5. **Quota**: Verifique sua quota antes de fazer upload de arquivos grandes
