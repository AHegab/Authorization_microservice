import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';

@Controller()
export class RabbitMQAuthController {
    constructor(private readonly authService: AuthService) {}

    @MessagePattern('validate_token')
    async validateToken(@Payload() data: { token: string }, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            const isValid = await this.authService.validateJwt(data.token);
            channel.ack(originalMsg);
            return { isValid, userId: isValid ? this.authService.extractUserIdFromToken(data.token) : null };
        } catch (err) {
            channel.nack(originalMsg);
            return { isValid: false, error: err.message };
        }
    }
}
