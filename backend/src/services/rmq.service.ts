import { Injectable } from "@nestjs/common";
import { RmqOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RmqService {
    constructor(private readonly configService: ConfigService) {}
    
    getOptions(queue: string, noAck = false): RmqOptions {
        const RABBITMQ_URL = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
        
        return {
            transport: Transport.RMQ,
            options: {
                urls: [RABBITMQ_URL],
                queue: queue,
                noAck,
                persistent: true,
                queueOptions: {
                    durable: true,  // Changed to false to match
                },
            }
        };
    }
}
