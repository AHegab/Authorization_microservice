import { Controller, Get, Post, Req, Res, Body, BadRequestException, UnauthorizedException, Patch, NotFoundException, Query } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { Enable2FADto } from '../dtos/enable-2fa.dto';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ForgetPasswordDto } from '../dtos/forget-password.dto';
import { ResetPasswordDto } from '../dtos/password-reset.dto'; // Ensure this file exists at the specified path
import { UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PasswordService } from '../services/password.service';




@Controller('password')
export class PasswordController {
    constructor(private readonly passwordService: PasswordService) { }


    @Post('forget')
    async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
        const email = forgetPasswordDto.email;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        return await this.passwordService.forgetPassword(email);
    }



    @Post('reset')
    async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
        const { newPassword } = resetPasswordDto;

        if (!token || !newPassword) {
            throw new BadRequestException('Token and new password are required');
        }

        return await this.passwordService.resetPassword(token, newPassword);
    }
}