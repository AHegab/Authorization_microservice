import { Test, TestingModule } from '@nestjs/testing';
import { PasswordController } from '../../src/controllers/password.controller';
import { PasswordService } from '../../src/services/password.service';
import { BadRequestException } from '@nestjs/common';
import { ForgetPasswordDto } from '../../src/dtos/forget-password.dto';
import { ResetPasswordDto } from '../../src/dtos/password-reset.dto';

describe('PasswordController', () => {
  let passwordController: PasswordController;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordController],
      providers: [
        {
          provide: PasswordService,
          useValue: {
            forgetPassword: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    passwordController = module.get<PasswordController>(PasswordController);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  describe('forgetPassword', () => {
    it('should call forgetPassword and return a message', async () => {
      const forgetPasswordDto: ForgetPasswordDto = { email: 'test@example.com' };
      const result = { message: 'Password reset link has been sent to your email' };
      jest.spyOn(passwordService, 'forgetPassword').mockResolvedValue(result);

      expect(await passwordController.forgetPassword(forgetPasswordDto)).toEqual(result);
    });

    it('should throw BadRequestException if email is not provided', async () => {
      await expect(passwordController.forgetPassword({ email: '' } as ForgetPasswordDto))
        .rejects
        .toThrowError(new BadRequestException('Email is required'));
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword and return a success message', async () => {
      const resetPasswordDto: ResetPasswordDto = { newPassword: 'NewPassword123!' };
      const token = 'valid-reset-token';
      const result = { message: 'Password reset successfully' };
      jest.spyOn(passwordService, 'resetPassword').mockResolvedValue(result);

      expect(await passwordController.resetPassword(token, resetPasswordDto)).toEqual(result);
    });

    it('should throw BadRequestException if token or newPassword is not provided', async () => {
      await expect(passwordController.resetPassword('', { newPassword: 'NewPassword123!' }))
        .rejects
        .toThrowError(new BadRequestException('Token and new password are required'));
      await expect(passwordController.resetPassword('valid-token', { newPassword: '' }))
        .rejects
        .toThrowError(new BadRequestException('Token and new password are required'));
    });
  });
});