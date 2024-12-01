import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class RabbitMQController {
    @EventPattern('user_event')
    async handleUserEvent(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            console.log('Received user event:', data);
            channel.ack(originalMsg);
        } catch (err) {
            console.error('Error processing message:', err);
            channel.nack(originalMsg);
        }
    }
}