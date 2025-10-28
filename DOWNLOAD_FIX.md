# Fix: Download de Arquivos do Backblaze B2

## Problema Identificado

O sistema de download não estava funcionando corretamente porque:

1. **Backend baixava primeiro**: O método `downloadFile` no controller fazia o backend baixar o arquivo completo do Backblaze e depois enviar para o frontend, causando:
   - Uso excessivo de memória no servidor
   - Lentidão no download
   - Timeout em arquivos grandes

2. **Falta de URL pré-assinada**: O `BackblazeService` não tinha método para gerar URLs pré-assinadas de download (apenas para upload).

3. **URL pública sem autenticação**: O método `getPublicUrl()` retornava uma URL que não funcionava porque o bucket não é público.

## Solução Implementada

### 1. Novo Método no BackblazeService

**Arquivo:** `/root/cloud/cloud-core/src/backblaze/backblaze.service.ts`

Adicionados dois novos métodos:

```typescript
/**
 * Gera uma URL pré-assinada de download do Backblaze B2
 */
async generateSignedDownloadUrl(storageKey: string, expiresInSeconds = 3600): Promise<string>

/**
 * Obtém o token de autorização atual para uso em downloads
 */
async getAuthorizationToken(): Promise<string>
```

Estes métodos permitem que o frontend faça download direto do Backblaze usando o token de autorização.

### 2. Atualização do FileService

**Arquivo:** `/root/cloud/cloud-core/src/file/application/services/file.service.ts`

Modificado o método `getDownloadUrlWithToken` para retornar:
- URL do arquivo no Backblaze
- Token de autorização para acesso

```typescript
async getDownloadUrlWithToken(token: string, fileId: string): Promise<{ downloadUrl: string; authToken: string }>
```

### 3. Atualização do Controller

**Arquivo:** `/root/cloud/cloud-core/src/file/file.controller.ts`

O endpoint `/files/download/:fileId/:token` agora retorna:

```json
{
  "downloadUrl": "https://f000.backblazeb2.com/file/bucket-name/path/to/file",
  "authToken": "authorization_token_here"
}
```

### 4. Atualização do Frontend

**Arquivo:** `/root/cloud/cloud-frontend/src/app/(protected)/folder/[folderId]/page.tsx`

A função `handleDownloadFile` foi atualizada para:

1. Obter token de download do backend
2. Obter URL pré-assinada (que já inclui o token como query parameter)
3. Fazer download direto do Backblaze **sem headers customizados** (evita preflight CORS)
4. Mostrar progresso do download

```typescript
const fileResponse = await fetch(downloadData.downloadUrl, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit'
});
```

**Importante:** Não enviamos headers customizados como `Authorization` porque isso causa um preflight request (OPTIONS) que o Backblaze rejeita. O token está incluído na URL como query parameter.

### 5. Configuração CORS Atualizada

**Arquivo:** `/root/cloud/cloud-core/scripts/configure-b2-cors.ts`

Adicionadas operações de download nas regras CORS:
- `b2_download_file_by_name`
- `s3_get`

E headers expostos:
- `content-length`
- `content-type`

## Como Aplicar a Solução

### 1. Recompilar o Backend

```bash
cd /root/cloud/cloud-core
pnpm install
pnpm build
```

### 2. Atualizar Regras CORS no Backblaze

```bash
cd /root/cloud/cloud-core
pnpm b2:configure-cors
```

### 3. Reiniciar os Serviços

```bash
# Reiniciar backend
pm2 restart cloud-backend

# Reiniciar frontend (se necessário)
pm2 restart cloud-frontend
```

## Fluxo de Download

```
Frontend                    Backend                     Backblaze B2
   |                           |                              |
   |--1. getDownloadToken----->|                              |
   |<-----token----------------|                              |
   |                           |                              |
   |--2. getDownloadUrl------->|                              |
   |   (com token)             |                              |
   |                           |--3. authenticate------------>|
   |                           |<----authToken----------------|
   |                           |                              |
   |<--downloadUrl+authToken---|                              |
   |                           |                              |
   |--4. download (com Authorization header)----------------->|
   |<--arquivo (stream com progresso)-------------------------|
```

## Vantagens da Nova Implementação

1. **Performance**: Download direto do Backblaze sem passar pelo backend
2. **Escalabilidade**: Backend não precisa processar o arquivo
3. **Progresso**: Frontend pode mostrar progresso real do download
4. **Segurança**: Token de autorização temporário e validado
5. **Eficiência**: Menos uso de memória e CPU no servidor

## Notas Técnicas

- **Token de Autorização**: O token do Backblaze é válido por um período limitado (geralmente 24 horas)
- **CORS**: É essencial que as regras CORS incluam operações de download
- **Headers**: O header `Authorization` deve ser enviado com cada requisição de download
- **Segurança**: O token de download do backend valida permissões antes de gerar a URL

## Verificação

Para verificar se o download está funcionando:

1. Abra o DevTools (F12)
2. Vá para a aba Network
3. Clique para baixar um arquivo
4. Verifique:
   - Requisição para `/files/:id/download-token` retorna token
   - Requisição para `/files/download/:fileId/:token` retorna `downloadUrl` e `authToken`
   - Requisição para o Backblaze (domínio `backblazeb2.com`) com header `Authorization`
   - Download completa com sucesso

## Troubleshooting

### Erro de CORS
- Execute `pnpm b2:configure-cors` no backend
- Verifique se as origens estão corretas no script

### Erro 401 Unauthorized
- Token de autorização pode ter expirado
- Backend precisa reautenticar com o Backblaze

### Download não inicia
- Verifique se o arquivo existe no Backblaze
- Verifique logs do backend para erros de autenticação
