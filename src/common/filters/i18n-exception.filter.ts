import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log('response', response);
    // const request = ctx.getRequest<Request>();
    // console.log('request', request);
    // const i18n = I18nContext.current(host);

    // const message = '';

    // const exceptionMessage = (exception) =>
    //   exception instanceof MongoError
    //     ? exception?.message
    //     : exception?.response?.message;

    // console.log('exception', exception);

    // const translatedMessage = i18n.t(
    //   exceptionMessage(exception),
    // );

    response.status(status).json({
      statusCode: status,
      message: exception,
    });
  }
}
