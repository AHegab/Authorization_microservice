import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { calculatePasswordEntropy } from '../utils/password.utils';




@Injectable()
export class  AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }





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

    const savedUser = await this.userRepository.save(user);

   

    return savedUser;
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








  ///////// SECURITY //////////

  generateJwt(user: User) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload); // Use the injected JwtService to sign the token
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      return user;
    }
    return null;
  }



  async validateJwt(token: string) {
    try {
      this.jwtService.verify(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
        return this.jwtService.verify(token); // Validate token with JwtService
    } catch (error) {
        throw new BadRequestException('Invalid token');
    }
}


  extractUserIdFromToken(token: string) {
    const decoded: any = this.jwtService.decode(token);
    return decoded.sub;
  }



}