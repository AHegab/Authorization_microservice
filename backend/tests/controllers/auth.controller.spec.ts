import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/controllers/auth.controller';
import { AuthService } from '../../src/services/auth.service';
import { CreateUserDto } from '../../src/dtos/create-user.dto';
import { LoginDto } from '../../src/dtos/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { User } from '../../src/entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'jwt-token'),
            verify: jest.fn(() => ({ userId: 1 })),
          },
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>('UserRepository');
  });

  describe('register', () => {
    it('should register a new user and return the user object', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        plainPassword: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        birthDay: new Date(),
        middleName: 'Middle',
        phoneNumber: '123456789',
        profilePicture: undefined,
      };

      const mockUser = {
        ...createUserDto,
        password: 'hashed-password', // simulate password hashing
        plainPassword: undefined, // plainPassword should not be saved
      };

      // mock the methods
      jest.spyOn(authService, 'register').mockResolvedValue(mockUser as any);

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as Partial<Response> as Response;

      const result = await authController.register(createUserDto, mockRes);

      expect(authService.register).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.plainPassword,
        createUserDto.firstName,
        createUserDto.lastName,
        createUserDto.birthDay,
        createUserDto.middleName,
        createUserDto.phoneNumber,
        createUserDto.profilePicture
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('login', () => {
    it('should login the user and return a JWT token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };
  
      const mockUser = {
        email: 'test@example.com',
        password: 'hashed-password',
        isTwoFactorEnabled: false,
        id: 1, 
      };
  
      const mockToken = 'jwt-token';
  
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser as any);
      const signMock = jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);
  
      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnValue({ token: mockToken }),
      } as Partial<Response> as Response;
  
      const result = await authController.login(loginDto, mockRes);
  
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
  
      console.log('JWT sign args:', signMock.mock.calls);
  
      expect(signMock).toHaveBeenCalledWith({
        sub: mockUser.id, 
        email: mockUser.email,
      });
  
      expect(result).toEqual({ token: mockToken });
    });
  
    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };
  
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
  
      await expect(
        authController.login(loginDto, {} as Partial<Response> as Response),
      ).rejects.toThrow(UnauthorizedException);
    });
  });  

  describe('logout', () => {
    it('should logout the user by clearing the cookie', async () => {
      const mockReq = { session: { destroy: jest.fn((cb) => cb(null)) } } as unknown as Partial<Request> as Request;

      const mockRes = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => data),
      } as Partial<Response> as Response;

      const result = await authController.logout(mockReq, mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('auth_token', { httpOnly: true });
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logout successful' });
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});