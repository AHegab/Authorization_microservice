import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { calculatePasswordEntropy } from '../utils/password.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MessagePattern } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}


  @MessagePattern('transaction_created')
  async handleTransactionCreated(data: any) {
    console.log('Transaction created:', data);
    // Handle the transaction creation logic here
  }

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
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    if (calculatePasswordEntropy(plainPassword) < 50) {
      throw new BadRequestException('Password is weak');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

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

    return await this.userRepository.save(user);
  }

  /**
   * Authenticate a user and generate a JWT.
   */
  async login(email: string, plainPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(plainPassword, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateJwt(user);

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
    return this.jwtService.sign(payload);
  }

  /**
   * Validate a user for the Guard (used in strategies).
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      return user;
    }
    return null;
  }

  /**
   * Validate a token.
   */
  
  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded; // Validate token with JwtService
    } catch (error) {
      return null; // Return null if token is invalid
    }
  }
}