import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { calculatePasswordEntropy } from '../utils/password.utils';
import { EmailService } from '../services/email.service'; // Ensure this service exists

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService, // Inject EmailService
  ) {}

  /**
   * Handle forget password logic: generate and send a reset token.
   */
  async forgetPassword(email: string): Promise<{ message: string }> {
    // Check if the user exists
    const user = await this.userRepository.findOne({ where: { email } });

    // Always return the same message to avoid email enumeration
    if (!user) {
      return { message: 'Password reset link has been sent to your email' };
    }

    // Generate a reset token (valid for 15 minutes)
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    );

    // Send the reset email
    const resetLink = `${process.env.FRONTEND_URL}/passwords/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    return { message: 'Password reset link has been sent to your email' };
  }

  /**
   * Handle password reset logic: validate token and update the password.
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Verify and decode the token
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      // Check if the user exists
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Validate password strength
      const entropy = calculatePasswordEntropy(newPassword);
      if (entropy < 60) {
        throw new BadRequestException(
          'Password is too weak. Use a more complex password with a mix of letters, numbers, and symbols.',
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.hashedPassword = hashedPassword;

      // Save the updated user to the database
      await this.userRepository.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Reset token has expired. Please request a new one.');
      }
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
