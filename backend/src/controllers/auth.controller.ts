import { Controller, Get, Post, Req, Res, Body, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity'; // Adjust the path as necessary
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

    // Set a cookie for the user session
    res.cookie('auth_token', 'session-token-placeholder', {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return res.status(201).send(user);
  }

  @UseGuards(JwtAuthGuard)
@Get('profile/:id')
async getProfile(@Param('id') id: string, @Req() req: any) {
    const userIdFromToken = req.user.sub; // Use 'sub' to match the payload field in the token
    if (userIdFromToken !== id) {
        throw new UnauthorizedException('You can only access your own profile');
    }

    const user = await this.authService.findById(id);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    return user;
}


  
@Post('login')
async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
    );

    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.authService.generateJwt(user);

    // Set JWT as a cookie
    res.cookie('auth_token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour
    });

    return res.status(200).json({ token });
}


  @Post('2fa/enable')
  async enable2FA(@Body() enable2FADto: Enable2FADto) {
    return this.authService.enable2FA(enable2FADto.email);
  }

  @Get('users')
  async findAll() {
    return this.authService.findAll();
  }

  @Get('set-cookie')
  setCookie(@Res() res: Response) {
    res.cookie('user', 'testuser', {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    });
    return res.send('Cookie has been set!');
  }

  @Get('get-cookie')
  getCookie(@Req() req: Request) {
    const userCookie = req.cookies['user'];
    return { userCookie };
  }

  @Get('destroy-session')
  destroySession(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('auth_token');
    return res.send({ message: 'Session destroyed' });
  }
}
