import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import multer from 'multer'; // Import default ao invés de namespace
import { createMulterConfig } from '../config/multerConfig';

@Injectable()
export class DynamicFilesInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const folderId = request.params.folderId;

    if (!folderId) {
      throw new BadRequestException('folderId is required');
    }

    // Cria o multer com configuração dinâmica
    const config = createMulterConfig(folderId);
    const upload = multer(config).array('files', 20);

    return new Promise((resolve, reject) => {
      upload(request, context.switchToHttp().getResponse(), (err: any) => {
        if (err) {
          reject(new BadRequestException(err.message));
        }
        resolve(next.handle());
      });
    });
  }
}