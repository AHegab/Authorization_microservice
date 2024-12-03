import { Controller, Post, Body, BadRequestException, Query } from '@nestjs/common';
import { PasswordService } from '../services/password.service';
import { ForgetPasswordDto } from '../dtos/forget-password.dto';
import { ResetPasswordDto } from '../dtos/password-reset.dto';

@Controller('password')
export class PasswordController {
    constructor(private readonly passwordService: PasswordService) { }

    /**
     * Endpoint to request a password reset email.
     */
    @Post('forget')
    async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto): Promise<{ message: string }> {
        const { email } = forgetPasswordDto;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        // Call the service to handle forget password logic
        return await this.passwordService.forgetPassword(email);
    }

    /**
     * Endpoint to reset the password using the reset token.
     */
    @Post('reset')
    async resetPassword(
        @Query('token') token: string,
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        const { newPassword } = resetPasswordDto;

        if (!token || !newPassword) {
            throw new BadRequestException('Token and new password are required');
        }

        // Call the service to handle the password reset logic
        return await this.passwordService.resetPassword(token, newPassword);
    }
}
