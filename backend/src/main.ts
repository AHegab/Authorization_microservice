import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';




async function bootstrap() {
    dotenv.config();
  const app = await NestFactory.create(AppModule);
  //7amada
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
        urls: [process.env.RABBITMQ_URL ], // Use environment variable
        queue: process.env.RABBITMQ_QUEUE || 'auth_queue', // Use environment variable
      queueOptions: {
        durable: false
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
