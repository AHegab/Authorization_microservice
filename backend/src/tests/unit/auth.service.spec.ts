// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../services/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
    let service: AuthService;

    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should hash password and register a user', async () => {
        mockUserRepository.findOne.mockResolvedValue(null); // No existing user
        mockUserRepository.save.mockResolvedValue({ id: '1', email: 'test@example.com' });

        const result = await service.register(
            'test@example.com',
            'password123',
            'John',
            'Doe',
        );

        expect(mockUserRepository.save).toHaveBeenCalled();
        expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should throw an error if user already exists', async () => {
        mockUserRepository.findOne.mockResolvedValue({ email: 'test@example.com' });

        await expect(
            service.register('test@example.com', 'password123', 'John', 'Doe'),
        ).rejects.toThrow();
    });
});
