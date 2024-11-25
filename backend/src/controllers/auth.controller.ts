import { Controller, Get, Post, Req, Res, Body, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { Enable2FADto } from '../dtos/enable-2fa.dto';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.authService.register(
      createUserDto.email,
      createUserDto.plainPassword,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.birthDay,
      createUserDto.middleName,
      createUserDto.phoneNumber,
      createUserDto.profilePicture,
    );

    res.status(201).send(user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isTwoFactorEnabled) {
      const token = this.authService.generateJwt(user);
      return res.status(200).json({
        message: '2FA Required',
        twoFactorRequired: true,
        token,
      });
    }

    const token = this.authService.generateJwt(user);
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });
    return res.status(200).json({ token });
  }

  @Post('2fa/enable')
  async enable2FA(@Body() body: Enable2FADto) {
    const qrCodeUrl = await this.authService.enable2FA(body.email);
    return { qrCodeUrl };
  }

  @Post('2fa/verify')
  async verify2FA(@Body() body: { token: string; otp: string }) {
    const isValid = await this.authService.verify2FA(body.token, body.otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }
    return { message: '2FA successful', success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getProfile(@Param('id') id: string, @Req() req: any) {
    const userIdFromToken = req.user.sub;
    if (userIdFromToken !== id) {
      throw new UnauthorizedException('You can only access your own profile');
    }

    const user = await this.authService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
