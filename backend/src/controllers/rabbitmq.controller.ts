import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import * as amqp from 'amqplib';
import { AuthService } from '../services/auth.service';

@Controller()
export class RabbitMQAuthController {
    private readonly logger = new Logger(RabbitMQAuthController.name);
    private readonly queues = {
        transactions: 'transactions_queue',
        analysis: 'analysis_queue',
    };

    constructor(private readonly authService: AuthService) {}

    @MessagePattern() // Handles messages from auth_queue
    async validateToken(
        @Payload() data: { token: string; flag: boolean },
        @Ctx() context: RmqContext,
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        if (!data.token) {
            this.logger.warn('Validation failed: Token is missing');
            throw new BadRequestException('Token is required');
        }

        const targetQueue = data.flag ? this.queues.transactions : this.queues.analysis;

        try {
            this.logger.log(`Auth Service received token: ${data.token}`);
            const isValid = await this.authService.validateJwt(data.token);
            const userId = isValid ? this.authService.extractUserIdFromToken(data.token) : null;

            const response = { isValid, userId };
            await this.sendResponseToQueue(targetQueue, response, originalMsg);

            this.logger.log(`Response sent to queue: ${targetQueue}`, response);
            channel.ack(originalMsg);
        } catch (err) {
            this.logger.error(`Error validating token: ${err.message}`);
            channel.nack(originalMsg, false, false); // Reject the message without requeue
        }
    }

    private async sendResponseToQueue(
        queueName: string,
        response: any,
        originalMsg: any,
    ): Promise<void> {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const responseChannel = await connection.createChannel();

        await responseChannel.assertQueue(queueName, { durable: true });
        responseChannel.sendToQueue(
            queueName,
            Buffer.from(JSON.stringify(response)),
            { correlationId: originalMsg.properties.correlationId },
        );

        this.logger.debug(`Sent response to ${queueName} with correlationId: ${originalMsg.properties.correlationId}`);
        await responseChannel.close(); // Close the channel after sending
        await connection.close(); // Close the connection
    }
}
