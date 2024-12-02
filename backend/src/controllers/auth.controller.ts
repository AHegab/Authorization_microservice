import { Controller, Get, Post, Req, Res, Body, BadRequestException,UnauthorizedException,Patch, NotFoundException, Query } from '@nestjs/common';
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




  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res() res: Response): Promise<{ message: string }> {
    // Clear the cookie storing the JWT token
    res.clearCookie('auth_token', { httpOnly: true });

    // Optionally destroy the session if using sessions
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          throw new Error('Error destroying session');
        }
      });
    }

    res.status(200).json({ message: 'Logout successful' });
    return { message: 'Logout successful' };
  }




}
