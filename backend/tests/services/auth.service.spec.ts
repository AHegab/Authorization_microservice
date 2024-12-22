import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/services/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        hashedPassword: 'hashedpassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null); // No user exists
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);

      const result = await authService.register(
        'test@example.com',
        'StrongPassword123!',
        'John',
        'Doe',
        new Date(),
        'Middle',
        '123456789',
        undefined,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPassword123!', 10);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('validateUser', () => {
    it('should return a user when credentials are valid', async () => {
      const mockUser = {
        email: 'test@example.com',
        hashedPassword: 'hashedpassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(result).toEqual(mockUser);
    });
  });
});