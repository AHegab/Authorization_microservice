import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './modules/app.module';
import { RmqService } from './services/rmq.service';
import { setupRabbitMQ } from './rabbitmq-setup';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const rmqService = app.get<RmqService>(RmqService);

    // Enable global validation pipes
    app.useGlobalPipes(new ValidationPipe());

    // Connect to RabbitMQ microservice for "auth_service_queue"
    app.connectMicroservice(rmqService.getOptions('auth_queue'));

    // Start microservices
    await app.startAllMicroservices();

    // Setup RabbitMQ
    await setupRabbitMQ();

    const configService = app.get<ConfigService>(ConfigService);
    console.log('Connecting to RabbitMQ at:', configService.get('RABBITMQ_URL'));

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Start HTTP server
    await app.listen(3000);
    console.log(`Auth Service is running on port 3000`);
}

bootstrap();
