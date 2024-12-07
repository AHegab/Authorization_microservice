import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import * as amqp from 'amqplib';
import { AuthService } from '../services/auth.service';

@Controller()
export class RabbitMQAuthController {
    private readonly logger = new Logger(RabbitMQAuthController.name);

    constructor(private readonly authService: AuthService) {}

    @MessagePattern() // Handles messages from auth_queue
    async validateToken(@Payload() data: { token: string }, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const transactionsQueue = 'transactions_queue';

        if (!data.token) {
            throw new BadRequestException('Token is required');
        }

        try {
            console.log(`Auth Service received token: ${data.token}`);
            const isValid = await this.authService.validateJwt(data.token);
            const userId = isValid ? this.authService.extractUserIdFromToken(data.token) : null;

            console.log(`Validation result: isValid=${isValid}, userId=${userId}`);

            const response = { isValid, userId };
            const connection = await amqp.connect(process.env.RABBITMQ_URL);
            const responseChannel = await connection.createChannel();
            await responseChannel.assertQueue(transactionsQueue, { durable: true });
            responseChannel.sendToQueue(
                transactionsQueue,
                Buffer.from(JSON.stringify(response)),
                { correlationId: originalMsg.properties.correlationId } // Attach correlationId
            );

            this.logger.log(`Response sent to queue: ${transactionsQueue}`, response);
            channel.ack(originalMsg);
        } catch (err) {
            this.logger.error(`Error validating token: ${err.message}`);
            channel.nack(originalMsg);
        }
    }
}
