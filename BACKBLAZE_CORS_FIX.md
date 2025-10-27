# Fix: Erro de CORS no Upload para Backblaze B2

## Problema

Ao tentar fazer upload direto do frontend para o Backblaze B2 usando presigned URLs, ocorria o seguinte erro:

```
Access to XMLHttpRequest at 'https://pod-050-1037-19.backblaze.com/b2api/v2/b2_upload_file/...' 
from origin 'https://cloud.tehkly.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Causa

O Backblaze B2 precisa ter regras CORS configuradas diretamente no bucket para aceitar requisições de origens específicas (como `https://cloud.tehkly.com`). Não é suficiente configurar CORS apenas no backend NestJS.

## Solução Aplicada

### 1. Criado Script de Configuração CORS

Arquivo: `/root/cloud/cloud-core/scripts/configure-b2-cors.ts`

Este script:
- Autentica com a API do Backblaze B2
- Busca o bucket configurado no `.env`
- Configura regras CORS permitindo:
  - Origem: `https://cloud.tehkly.com`
  - Origem: `http://localhost:3002` e `http://localhost:3000` (desenvolvimento)
  - Operações: `b2_upload_file`, `b2_upload_part`, `s3_put`, `s3_post`
  - Headers: Todos (`*`)
  - Expose Headers: `x-bz-content-sha1`, `x-bz-file-id`, `x-bz-file-name`

### 2. Corrigido Método HTTP no Frontend

**Arquivo:** `/root/cloud/cloud-frontend/src/components/modals/uploadModal.tsx`

**Mudança:** Alterado de `axios.put()` para `axios.post()` na linha 135.

O Backblaze B2 usa POST para uploads, não PUT.

### 3. Adicionado Script NPM

**Arquivo:** `/root/cloud/cloud-core/package.json`

Adicionado script para facilitar futuras configurações:

```bash
npm run b2:configure-cors
```

ou

```bash
pnpm b2:configure-cors
```

## Como Usar

### Primeira Configuração

1. Certifique-se de que as variáveis de ambiente estão configuradas no `.env`:
   ```env
   B2_APPLICATION_KEY_ID=your_key_id
   B2_APPLICATION_KEY=your_key
   B2_BUCKET_NAME=your_bucket_name
   ```

2. Execute o script de configuração:
   ```bash
   cd /root/cloud/cloud-core
   pnpm b2:configure-cors
   ```

3. Reinicie o frontend se estiver rodando.

### Adicionar Novas Origens

Para adicionar novas origens permitidas (ex: novo domínio de produção):

1. Edite `/root/cloud/cloud-core/scripts/configure-b2-cors.ts`
2. Adicione a nova origem no array `allowedOrigins` de uma regra existente ou crie uma nova regra
3. Execute novamente: `pnpm b2:configure-cors`

## Verificação

Após aplicar a solução, o upload deve funcionar sem erros de CORS. Você pode verificar:

1. Abra o DevTools do navegador (F12)
2. Vá para a aba Network
3. Tente fazer um upload
4. Verifique se a requisição OPTIONS (preflight) retorna status 200
5. Verifique se a requisição POST de upload é bem-sucedida

## Notas Técnicas

- **CORS no Backend NestJS:** O CORS configurado em `main.ts` só afeta as requisições para o próprio backend, não para o Backblaze B2.
- **Presigned URLs:** As URLs assinadas geradas pelo backend já incluem autenticação, mas o CORS ainda precisa ser configurado no bucket.
- **Segurança:** As regras CORS são específicas por origem, garantindo que apenas domínios autorizados possam fazer upload.

## Referências

- [Backblaze B2 CORS Documentation](https://www.backblaze.com/docs/cloud-storage-cross-origin-resource-sharing-rules)
- [Backblaze B2 API Reference](https://www.backblaze.com/apidocs/)
