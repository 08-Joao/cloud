import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  accountId: string;
}

interface B2Bucket {
  bucketId: string;
  bucketName: string;
}

async function configureCORS() {
  const applicationKeyId = process.env.B2_APPLICATION_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  const bucketName = process.env.B2_BUCKET_NAME;

  if (!applicationKeyId || !applicationKey || !bucketName) {
    throw new Error('Credenciais B2 não configuradas no .env');
  }

  try {
    // 1. Autenticar
    console.log('🔐 Autenticando com Backblaze B2...');
    const credentials = Buffer.from(`${applicationKeyId}:${applicationKey}`).toString('base64');
    
    const authResponse = await axios.post<B2AuthResponse>(
      'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    const { authorizationToken, apiUrl, accountId } = authResponse.data;
    console.log('✅ Autenticado com sucesso!');

    // 2. Buscar bucket
    console.log(`🔍 Buscando bucket: ${bucketName}...`);
    const bucketsResponse = await axios.post(
      `${apiUrl}/b2api/v2/b2_list_buckets`,
      {
        accountId,
        bucketName,
      },
      {
        headers: {
          Authorization: authorizationToken,
        },
      },
    );

    const bucket: B2Bucket = bucketsResponse.data.buckets[0];
    if (!bucket) {
      throw new Error(`Bucket ${bucketName} não encontrado`);
    }
    console.log(`✅ Bucket encontrado: ${bucket.bucketId}`);

    // 3. Configurar CORS
    console.log('⚙️  Configurando regras CORS...');
    const corsRules = [
      {
        corsRuleName: 'allowCloudTehkly',
        allowedOrigins: ['https://cloud.tehkly.com'],
        allowedOperations: ['b2_upload_file', 'b2_upload_part', 's3_put', 's3_post'],
        allowedHeaders: ['*'],
        exposeHeaders: ['x-bz-content-sha1', 'x-bz-file-id', 'x-bz-file-name'],
        maxAgeSeconds: 3600,
      },
      {
        corsRuleName: 'allowLocalhost',
        allowedOrigins: ['http://localhost:3002', 'http://localhost:3000'],
        allowedOperations: ['b2_upload_file', 'b2_upload_part', 's3_put', 's3_post'],
        allowedHeaders: ['*'],
        exposeHeaders: ['x-bz-content-sha1', 'x-bz-file-id', 'x-bz-file-name'],
        maxAgeSeconds: 3600,
      },
    ];

    await axios.post(
      `${apiUrl}/b2api/v2/b2_update_bucket`,
      {
        accountId,
        bucketId: bucket.bucketId,
        corsRules,
      },
      {
        headers: {
          Authorization: authorizationToken,
        },
      },
    );

    console.log('✅ Regras CORS configuradas com sucesso!');
    console.log('\n📋 Regras aplicadas:');
    corsRules.forEach((rule) => {
      console.log(`  - ${rule.corsRuleName}:`);
      console.log(`    Origens: ${rule.allowedOrigins.join(', ')}`);
      console.log(`    Operações: ${rule.allowedOperations.join(', ')}`);
    });
    
    console.log('\n✨ Configuração concluída! Agora você pode fazer upload direto do frontend.');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Erro ao configurar CORS:', error.response?.data || error.message);
    } else {
      console.error('❌ Erro:', error);
    }
    process.exit(1);
  }
}

configureCORS();
