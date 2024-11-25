import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // Inject JwtService here
  ) {}

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

  async login(email: string, plainPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const isPasswordValid = await bcrypt.compare(plainPassword, user.hashedPassword);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
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
      token, // Include the JWT token in the response
    };
  }

  generateJwt(user: User) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload); // Use the injected JwtService to sign the token
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token); // Validate token with JwtService
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      return user;
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async enable2FA(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = speakeasy.generateSecret();
    user.twoFactorSecret = secret.base32;
    user.isTwoFactorEnabled = true;
    await this.userRepository.save(user);

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    return qrCodeUrl;
  }
}
