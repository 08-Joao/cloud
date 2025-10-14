// src/common/filters/prisma-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'generated/prisma';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocorreu um erro inesperado no banco de dados.';

    this.logger.error(
        `Prisma Error Code: ${exception.code} - ${exception.message}`,
        `Path: ${request.url}`
    );

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT; 
        const field = (exception.meta?.target as string[])?.join(', ');
        message = `Já existe um registro com este valor no campo: ${field}.`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND; // 404
        message = `O registro que você tentou operar não foi encontrado.`;
        break;
      }
      
      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Erro interno no processamento da requisição ao banco de dados.';
        break;
      }
    }
    
    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}