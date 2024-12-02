import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

import { ValidationPipe } from '@nestjs/common';
import { RmqService } from './services/rmq.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const rmqService = app.get<RmqService>(RmqService);
  
  app.useGlobalPipes(new ValidationPipe());
  
  app.connectMicroservice(rmqService.getOptions('auth_queue'));
  
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
