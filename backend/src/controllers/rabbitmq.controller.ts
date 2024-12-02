import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';

@Controller()
export class RabbitMQAuthController {
    private readonly logger = new Logger(RabbitMQAuthController.name);

    constructor(private readonly authService: AuthService) {}

    @MessagePattern('validate_token')
    async validateToken(@Payload() data: { token: string }, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.log(`Received token validation request: ${data.token.substring(0, 10)}...`);
            
            const isValid = await this.authService.validateJwt(data.token);
            const userId = isValid ? this.authService.extractUserIdFromToken(data.token) : null;
            
            this.logger.log(`Token validation result - Valid: ${isValid}, UserId: ${userId}`);
            
            channel.ack(originalMsg);
            return { isValid, userId };
        } catch (err) {
            this.logger.error(`Token validation error: ${err.message}`);
            channel.nack(originalMsg);
            return { isValid: false, error: err.message };
        }
    }
}