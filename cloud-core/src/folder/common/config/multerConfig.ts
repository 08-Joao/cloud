import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const createMulterConfig = (folderId: string) => ({
  storage: diskStorage({
    destination: (req, file, callback) => {
      // Cria o caminho: uploads/folderId
      const uploadPath = join('./uploads', folderId);
      
      // Cria a pasta se não existir
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB por arquivo
    files: 20, // máximo 20 arquivos
  },
  fileFilter: (req, file, callback) => {
    // Validações adicionais se necessário
    callback(null, true);
  },
});