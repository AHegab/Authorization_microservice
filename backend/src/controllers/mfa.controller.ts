import { BadRequestException, Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Enable2FADto } from '../dtos/enable-2fa.dto';
import { MFAService } from '../services/mfa.service'; // Ensure this file exists at the specified path
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';






@Controller('mfa')
export class MFAController {
    constructor(
        private readonly mfaService: MFAService,
        private readonly jwtService: JwtService
    ) { }


    @UseGuards(JwtAuthGuard)
    @Post('enable')
    async enable2FA(@Req() req: any) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Invalid Authorization header format');
        }

        // Verify token and extract the payload
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        const userId = payload.sub;

        if (!userId) {
            throw new UnauthorizedException('Invalid token');
        }

        // Enable 2FA for the user
        const qrCodeUrl = await this.mfaService.enable2FA(userId);
        return { qrCodeUrl };
    }


    @UseGuards(JwtAuthGuard)
    @Post('verify')
    async verify2FA(@Body() body: { otp: string }, @Req() req: any) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }
    
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Invalid Authorization header format');
        }
    
        // Verify token and extract payload
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        const userId = payload.sub;
    
        if (!userId) {
            throw new UnauthorizedException('Invalid token');
        }
    
        // Verify OTP
        const isValid = await this.mfaService.verify2FA(userId, body.otp);
        if (!isValid) {
            throw new UnauthorizedException('Invalid OTP');
        }
    
        return { message: '2FA successful', success: true };
    }

    @Post('validate-token')
    async validateToken(@Body('token') token: string) {
        if (!token) {
            throw new BadRequestException('Token is required');
        }

        return await this.mfaService.validateToken(token);
    }
    

}