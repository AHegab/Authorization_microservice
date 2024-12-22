import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../../src/services/password.service';
import { User } from '../../src/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../src/services/email.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('PasswordService', () => {
  let passwordService: PasswordService;
  let userRepository: Repository<User>;
  let emailService: EmailService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUser = new User();
  mockUser.id = '1';
  mockUser.email = 'test@example.com';
  mockUser.hashedPassword = 'old-hashed-password';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    passwordService = module.get<PasswordService>(PasswordService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('forgetPassword', () => {
    it('should send a reset email and return a message', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('reset-token');
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await passwordService.forgetPassword(mockUser.email);

      expect(result).toEqual({ message: 'Password reset link has been sent to your email' });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String),
      );
    });

    it('should return a generic message if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await passwordService.forgetPassword('nonexistent@example.com');

      expect(result).toEqual({ message: 'Password reset link has been sent to your email' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password and return a success message', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123!';

      mockJwtService.verify.mockReturnValue({ sub: mockUser.id, email: mockUser.email });
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed-password' as never);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await passwordService.resetPassword(token, newPassword);

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockUser.hashedPassword).toBe('new-hashed-password');
    });

    it('should throw an error if the token is invalid', async () => {
      const token = 'invalid-token';
      const newPassword = 'NewPassword123!';

      mockJwtService.verify.mockImplementation(() => {
        throw new UnauthorizedException('Invalid or expired token');
      });

      await expect(passwordService.resetPassword(token, newPassword)).rejects.toThrowError(
        new UnauthorizedException('Invalid or expired token'),
      );
    });

    it('should throw an error if the password is too weak', async () => {
        const token = 'valid-token';
        const weakPassword = '123';
      
        mockJwtService.verify.mockReturnValue({ sub: mockUser.id, email: mockUser.email });
        mockUserRepository.findOne.mockResolvedValue(mockUser);
      
        const passwordUtils = require('../../src/utils/password.utils');
        jest.spyOn(passwordUtils, 'calculatePasswordEntropy').mockReturnValue(30);
      
        await expect(passwordService.resetPassword(token, weakPassword)).rejects.toThrowError(
          new BadRequestException(
            'Password is too weak. Use a more complex password with a mix of letters, numbers, and symbols.',
          ),
        );
      });                         
  });
});