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
import { calculatePasswordEntropy } from '../utils/password.utils';




  @Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // Inject JwtService here
  ) {}

  async forgetPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('No user found with this email');
    }

    // Generate a reset token (valid for 15 minutes)
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    );

    // Send token to the user's email (mocked)
    console.log(`Send this reset link to the user's email: http://localhost:3000/auth/reset-password?token=${resetToken}`);

    return { message: 'Password reset link has been sent to your email' };
  }


  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Verify the token
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const entropy = calculatePasswordEntropy(newPassword);
      if (entropy < 60) {
        throw new BadRequestException('Password entropy is too low. Use a more complex password.');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.hashedPassword = hashedPassword;

      // Save the updated user to the database
      await this.userRepository.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}