import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { calculatePasswordEntropy } from '../utils/password.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   */
  async register(
    email: string,
    plainPassword: string,
    firstName: string,
    lastName: string,
    birthDay?: Date,
    middleName?: string,
    phoneNumber?: string,
    profilePicture?: string,
  ): Promise<User> {
    // Check if a user with the given email already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password strength
    if (calculatePasswordEntropy(plainPassword) < 50) {
      throw new BadRequestException('Password is weak');
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create a new user entity
    const user = this.userRepository.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      middleName: middleName || null,
      phoneNumber: phoneNumber || null,
      profilePicture: profilePicture || null,
      birthDay: birthDay || null,
      isTwoFactorEnabled: false,
      twoFactorSecret: null,
    });

    // Save the user to the database
    return await this.userRepository.save(user);
  }

  /**
   * Authenticate a user and generate a JWT.
   */
  async login(email: string, plainPassword: string) {
    // Find the user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate the provided password
    const isPasswordValid = await bcrypt.compare(plainPassword, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate a JWT token for the authenticated user
    const token = this.generateJwt(user);

    // Return user details and token
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  /**
   * Generate a JWT for the user.
   */
   generateJwt(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload); // Use the JwtService to sign the token
  }

  /**
   * Validate a user for the Guard (used in strategies).
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    // Find the user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      return user;
    }
    return null;
  }

  async validateToken(token: string): Promise<any> {
    try {
        return this.jwtService.verify(token); // Validate token with JwtService
    } catch (error) {
        throw new BadRequestException('Invalid token');
    }
}

}
