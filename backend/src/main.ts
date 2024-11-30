import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

// async function bootstrap() {
//     // Load environment variables
//     dotenv.config();

//     const app = await NestFactory.create(AppModule);

//     // Connect to RabbitMQ Microservice
//     const microservice = app.connectMicroservice<MicroserviceOptions>({
//         transport: Transport.RMQ,
//         options: {
//             urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'], // RabbitMQ URL
//             queue: process.env.RABBITMQ_QUEUE || 'default_queue', // Default queue
//             queueOptions: { durable: true }, // Ensure queue survives restarts
//         },
//     });

//     await app.startAllMicroservices(); // Start RabbitMQ microservice
//     await app.listen(process.env.PORT || 3000); // Start REST API server

//     console.log(`Application is running on port ${process.env.PORT || 3000}`);
//     console.log(`RabbitMQ is connected to queue ${process.env.RABBITMQ_QUEUE || 'default_queue'}`);
// }

// bootstrap();





async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://uNXXla3rKflI6s8p:mLjDBJ~GppHabuq.oBxWCB11pHUJrHc8@junction.proxy.rlwy.net:34338'], // Your RabbitMQ URL
      queue: 'auth_queue',
      queueOptions: {
        durable: false
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
