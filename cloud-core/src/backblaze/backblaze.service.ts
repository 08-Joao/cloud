import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

interface B2UploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

interface B2FileResponse {
  fileId: string;
  fileName: string;
  contentLength: number;
  contentType: string;
  contentSha1: string;
  fileInfo: Record<string, string>;
}

@Injectable()
export class BackblazeService {
  private readonly logger = new Logger(BackblazeService.name);
  private authToken: string;
  private apiUrl: string;
  private downloadUrl: string;
  private bucketId: string;
  private httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      timeout: 30000,
    });
  }

  /**
   * Autentica com Backblaze B2 e obtém tokens de acesso
   */
  private async authenticate(): Promise<void> {
    const applicationKeyId = this.configService.get<string>('B2_APPLICATION_KEY_ID');
    const applicationKey = this.configService.get<string>('B2_APPLICATION_KEY');

    if (!applicationKeyId || !applicationKey) {
      throw new InternalServerErrorException('Credenciais B2 não configuradas');
    }

    try {
      const credentials = Buffer.from(`${applicationKeyId}:${applicationKey}`).toString('base64');

      const response = await this.httpClient.post<B2AuthResponse>(
        'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      this.authToken = response.data.authorizationToken;
      this.apiUrl = response.data.apiUrl;
      this.downloadUrl = response.data.downloadUrl;

      this.logger.log('Autenticado com sucesso no Backblaze B2');
    } catch (error) {
      this.logger.error('Erro ao autenticar com Backblaze B2', error);
      throw new InternalServerErrorException('Falha na autenticação com Backblaze B2');
    }
  }

  /**
   * Obtém o bucket ID (busca ou usa cache)
   */
  private async getBucketId(): Promise<string> {
    if (this.bucketId) {
      return this.bucketId;
    }

    if (!this.authToken) {
      await this.authenticate();
    }

    const bucketName = this.configService.get<string>('B2_BUCKET_NAME');

    try {
      const response = await this.httpClient.post(
        `${this.apiUrl}/b2api/v2/b2_list_buckets`,
        {
          accountId: this.configService.get<string>('B2_APPLICATION_KEY_ID'),
          bucketName,
        },
        {
          headers: {
            Authorization: this.authToken,
          },
        },
      );

      const bucket = response.data.buckets[0];
      if (!bucket) {
        throw new InternalServerErrorException(`Bucket ${bucketName} não encontrado`);
      }

      this.bucketId = bucket.bucketId;
      return this.bucketId;
    } catch (error) {
      this.logger.error('Erro ao buscar bucket ID', error);
      throw new InternalServerErrorException('Falha ao buscar bucket');
    }
  }

  /**
   * Obtém URL de upload
   */
  private async getUploadUrl(): Promise<B2UploadUrlResponse> {
    if (!this.authToken) {
      await this.authenticate();
    }

    const bucketId = await this.getBucketId();

    try {
      const response = await this.httpClient.post<B2UploadUrlResponse>(
        `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
        { bucketId },
        {
          headers: {
            Authorization: this.authToken,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Erro ao obter URL de upload', error);
      throw new InternalServerErrorException('Falha ao obter URL de upload');
    }
  }

  /**
   * Faz upload de arquivo para Backblaze B2
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string,
  ): Promise<{ storageKey: string; publicUrl: string; fileId: string }> {
    try {
      // Gera nome único para o arquivo
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const storageKey = `users/${userId}/${timestamp}-${randomString}-${fileName}`;

      // Calcula SHA1 do arquivo
      const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');

      // Obtém URL de upload
      const uploadData = await this.getUploadUrl();

      // Faz upload
      const response = await this.httpClient.post<B2FileResponse>(
        uploadData.uploadUrl,
        buffer,
        {
          headers: {
            Authorization: uploadData.authorizationToken,
            'X-Bz-File-Name': encodeURIComponent(storageKey),
            'Content-Type': mimeType,
            'Content-Length': buffer.length,
            'X-Bz-Content-Sha1': sha1,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      const bucketName = this.configService.get<string>('B2_BUCKET_NAME');
      const publicUrl = `${this.downloadUrl}/file/${bucketName}/${storageKey}`;

      this.logger.log(`Arquivo ${fileName} enviado com sucesso: ${storageKey}`);

      return {
        storageKey,
        publicUrl,
        fileId: response.data.fileId,
      };
    } catch (error) {
      this.logger.error('Erro ao fazer upload do arquivo', error);
      throw new InternalServerErrorException('Falha ao fazer upload do arquivo');
    }
  }

  /**
   * Faz download de arquivo do Backblaze B2
   */
  async downloadFile(storageKey: string): Promise<Buffer> {
    if (!this.authToken) {
      await this.authenticate();
    }

    try {
      const bucketName = this.configService.get<string>('B2_BUCKET_NAME');
      const url = `${this.downloadUrl}/file/${bucketName}/${storageKey}`;

      const response = await this.httpClient.get(url, {
        headers: {
          Authorization: this.authToken,
        },
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('Erro ao fazer download do arquivo', error);
      throw new InternalServerErrorException('Falha ao fazer download do arquivo');
    }
  }

  /**
   * Deleta arquivo do Backblaze B2
   */
  async deleteFile(storageKey: string, fileId?: string): Promise<void> {
    if (!this.authToken) {
      await this.authenticate();
    }

    try {
      // Se não tiver fileId, precisa buscar
      let b2FileId = fileId;

      if (!b2FileId) {
        b2FileId = await this.getFileId(storageKey);
      }

      await this.httpClient.post(
        `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
        {
          fileId: b2FileId,
          fileName: storageKey,
        },
        {
          headers: {
            Authorization: this.authToken,
          },
        },
      );

      this.logger.log(`Arquivo ${storageKey} deletado com sucesso`);
    } catch (error) {
      this.logger.error('Erro ao deletar arquivo', error);
      throw new InternalServerErrorException('Falha ao deletar arquivo');
    }
  }

  /**
   * Busca fileId pelo storageKey
   */
  private async getFileId(storageKey: string): Promise<string> {
    try {
      const bucketId = await this.getBucketId();

      const response = await this.httpClient.post(
        `${this.apiUrl}/b2api/v2/b2_list_file_names`,
        {
          bucketId,
          prefix: storageKey,
          maxFileCount: 1,
        },
        {
          headers: {
            Authorization: this.authToken,
          },
        },
      );

      const file = response.data.files[0];
      if (!file) {
        throw new InternalServerErrorException('Arquivo não encontrado no B2');
      }

      return file.fileId;
    } catch (error) {
      this.logger.error('Erro ao buscar fileId', error);
      throw new InternalServerErrorException('Falha ao buscar arquivo');
    }
  }

  /**
   * Gera URL pública para um arquivo
   */
  getPublicUrl(storageKey: string): string {
    const bucketName = this.configService.get<string>('B2_BUCKET_NAME');
    return `${this.downloadUrl}/file/${bucketName}/${storageKey}`;
  }

  /**
   * Gera uma URL de upload assinada para uso direto do cliente
   */
  async generateSignedUploadUrl(
    fileName: string,
    mimeType: string,
    userId: string,
    expiresInSeconds = 3600 // 1 hora padrão
  ): Promise<{
    uploadUrl: string;
    authorizationToken: string;
    fileId: string;
    storageKey: string;
    corsHeaders: {
      'Access-Control-Allow-Origin': string;
      'Access-Control-Allow-Methods': string;
      'Access-Control-Allow-Headers': string;
    };
  }> {
    try {
      // Gera nome único para o arquivo
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const storageKey = `users/${userId}/${timestamp}-${randomString}-${fileName}`;

      // Obtém URL de upload
      const uploadData = await this.getUploadUrl();

      return {
        uploadUrl: uploadData.uploadUrl,
        authorizationToken: uploadData.authorizationToken,
        fileId: '', // Será preenchido após upload
        storageKey,
        corsHeaders: {
          'Access-Control-Allow-Origin': 'https://cloud.tehkly.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Bz-File-Name, X-Bz-Content-Sha1, X-Bz-Info-src_last_modified_millis'
        }
      };
    } catch (error) {
      this.logger.error('Erro ao gerar URL de upload assinada', error);
      throw new InternalServerErrorException('Falha ao gerar URL de upload');
    }
  }
}
