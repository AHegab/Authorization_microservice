import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
import { RmqService } from '../libs/common/rmq/rmq.service';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
    dotenv.config();
    
    const app = await NestFactory.create(AppModule);
    
    // Get RMQ Service
    const rmqService = app.get<RmqService>(RmqService);
    
    // Connect microservice with proper configuration
    app.connectMicroservice<MicroserviceOptions>(
        rmqService.getOptions('auth_queue')
    );

    try {
        await app.startAllMicroservices();
        await app.listen(4000);
        console.log('Application is running on port 4000');
    } catch (error) {
        console.error('Error starting the application:', error);
    }
}

bootstrap();
