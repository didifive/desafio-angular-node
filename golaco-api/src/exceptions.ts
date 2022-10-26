import { HttpStatus, HttpException } from '@nestjs/common';

export class GolacoApiError extends HttpException {
  constructor(statusCode: HttpStatus, message: string) {
    super(
      {
        statusCode: statusCode,
        timestamp: new Date().toISOString(),
        message: message,
      },
      statusCode,
    );
  }
}
export class EntityNotFoundException extends GolacoApiError {
  constructor(entityName: string, id?: number, name?: string) {
    let message: string;
    if (id) {
      message = `${entityName} com id ${id} não foi encontrado(a).`;
    }
    if (name) {
      message = `${entityName} ${name} não foi encontrado(a).`;
    }
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class DataViolationException extends GolacoApiError {
  constructor(message: string) {
    super(
      HttpStatus.CONFLICT,
      `Ocorreu um problema ao tentar executar a operação: ${message}.`,
    );
  }
}

export class BadRequestException extends GolacoApiError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

export class ForbiddenException extends GolacoApiError {
  constructor(message: string) {
    super(HttpStatus.FORBIDDEN, message);
  }
}
