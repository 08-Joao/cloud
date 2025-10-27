# Fix: Backend Build e CORS Issues

## Problemas Encontrados

### 1. Erro de CORS no Backend (502 Bad Gateway)
```
Access to XMLHttpRequest at 'https://api-cloud.tehkly.com/user/me' 
from origin 'https://cloud.tehkly.com' has been blocked by CORS policy
```

### 2. Backend não iniciava (MODULE_NOT_FOUND)
```
Error: Cannot find module '/app/dist/main'
```

## Causas

1. **TypeScript Config Incompatível**: O `tsconfig.json` estava usando `module: "nodenext"` que não é compatível com NestJS
2. **Estrutura de Build Incorreta**: O NestJS estava gerando arquivos em `dist/src/` ao invés de `dist/`
3. **Imports do Prisma**: O caminho do Prisma Client não estava sendo resolvido corretamente

## Soluções Aplicadas

### 1. Corrigido tsconfig.json

**Arquivo:** `/root/cloud/cloud-core/tsconfig.json`

Mudanças:
- `module: "nodenext"` → `module: "commonjs"`
- `moduleResolution: "nodenext"` → `moduleResolution: "node"`
- Adicionado `paths` para resolver imports do Prisma:
  ```json
  "paths": {
    "generated/prisma": ["./generated/prisma"]
  }
  ```

### 2. Ajustado Dockerfile

**Arquivo:** `/root/cloud/cloud-core/Dockerfile`

Mudanças:
- CMD atualizado para: `["node", "-r", "tsconfig-paths/register", "dist/src/main.js"]`
- Adicionado cópia do `generated` para dentro do `dist`:
  ```dockerfile
  COPY --from=builder /app/generated ./dist/generated
  ```

### 3. Corrigido Import do Prisma

**Arquivo:** `/root/cloud/cloud-core/src/prisma/prisma.service.ts`

Mudança:
```typescript
// Antes
import { PrismaClient } from '@prisma/client';

// Depois
import { PrismaClient } from 'generated/prisma';
```

### 4. Fix do Upload (Backblaze CORS)

**Arquivo:** `/root/cloud/cloud-frontend/src/components/modals/uploadModal.tsx`

Mudança:
```typescript
// Antes
await axios.put(uploadUrl, file, { ... })

// Depois  
await axios.post(uploadUrl, file, { ... })
```

## Verificação

### Backend está rodando:
```bash
docker logs cloud_backend --tail 20
# Deve mostrar: "Nest application successfully started"
```

### CORS está funcionando:
```bash
curl -I -H "Origin: https://cloud.tehkly.com" http://localhost:4002/user/me
# Deve retornar: access-control-allow-origin: https://cloud.tehkly.com
```

### Containers ativos:
```bash
docker compose ps
# Todos devem estar "Up" e "healthy"
```

## Comandos Úteis

### Rebuild completo:
```bash
cd /root/cloud
docker compose down
docker compose up -d --build
```

### Ver logs em tempo real:
```bash
docker logs -f cloud_backend
```

### Verificar estrutura do dist:
```bash
docker exec cloud_backend ls -la /app/dist/src/
```

## Status Final

✅ Backend compilando corretamente  
✅ Backend iniciando sem erros  
✅ CORS configurado para `https://cloud.tehkly.com`  
✅ Backblaze B2 CORS configurado  
✅ Upload usando POST ao invés de PUT  
✅ Prisma Client sendo importado corretamente  

## Próximos Passos

1. Testar upload de arquivo no frontend
2. Verificar se o erro de CORS do Backblaze foi resolvido
3. Monitorar logs para garantir estabilidade
