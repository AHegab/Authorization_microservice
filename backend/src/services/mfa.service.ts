import { BadRequestException, Injectable, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';


@Injectable()
export class MFAService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService, // Inject JwtService here
    ) { }


    async enable2FA(userId: string): Promise<string> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
    
        const secret = speakeasy.generateSecret({ name: `PersonalFinanceTracker (${user.email})` });
        user.twoFactorSecret = secret.base32;
        user.isTwoFactorEnabled = true;
        await this.userRepository.save(user);
    
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        return qrCodeUrl;
    }
    

    async verify2FA(userId: string, otp: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            throw new UnauthorizedException('2FA is not enabled');
        }
    
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otp,
        });
    
        console.log({ secret: user.twoFactorSecret, otp, isValid });
        return isValid;
    }

        async validateToken(token: string): Promise<any> {
            try {
                return this.jwtService.verify(token); // Validate token with JwtService
            } catch (error) {
                throw new BadRequestException('Invalid token');
            }
        }





}