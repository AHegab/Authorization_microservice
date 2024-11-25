import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';

import { AuthController } from '../controllers/auth.controller';
import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';

dotenv.config();

@Module({
    imports: [
        // TypeORM configuration for database connection
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_DATABASE || 'auth_service',
            schema: 'public', // Adjust if using a different schema
            entities: [User], // Register entities
            synchronize: true, // Use true for development, false for production
            logging: false, // Enable logging if needed
        }),

        // Register the User entity with TypeORM
        TypeOrmModule.forFeature([User]),

        // Passport and JWT configurations
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'defaultSecret', // Use a secure key in production
            signOptions: { expiresIn: '1h' }, // Token expiry
        }),
    ],
    controllers: [AuthController], // Controller for routes
    providers: [
        AuthService, // Auth service to handle business logic
        JwtAuthGuard, // Guard to protect routes
        JwtStrategy, // JWT strategy for validating tokens
    ],
    exports: [JwtModule, PassportModule], // Export modules if needed in other modules
})
export class AppModule {}
