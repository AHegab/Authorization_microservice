import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'TRANSACTIONS_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672'],
                    queue: 'transactions_queue',
                    queueOptions: { durable: true },
                },
            },
        ]),
    ],
    exports: ['TRANSACTIONS_SERVICE'],
})
export class RabbitMQModule { }
