import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { AuthController } from '../controllers/auth.controller';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ProfileService } from '../services/profile.service';
import { PasswordService } from '../services/password.service';
import { MFAService } from '../services/mfa.service';
import { MFAController } from '../controllers/mfa.controller';
import { ProfileController } from '../controllers/profile.controller';
import { PasswordController } from '../controllers/password.controller';
import { RabbitMQService } from '../services/rabbitmq.service';
import * as fs from 'fs';

import { ClientsModule,Transport } from '@nestjs/microservices';

dotenv.config();

@Module({
    imports: [

        ClientsModule.register([
            {
                name: 'TRANSACTIONS_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL],
                    queue: 'transaction-queue',
                    queueOptions: {
                        durable: false
                    },
                },
            },
        ]),
        // TypeORM configuration for database connection
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            url: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false, // Use true in production and provide the CA certificate
            },
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
        }),

        // Register the User entity with TypeORM
        TypeOrmModule.forFeature([User]),

        // Passport and JWT configurations
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET, // Use a secure key in production
            signOptions: { expiresIn: '1h' }, // Token expiry
        }),
    ],
    controllers: [AuthController, MFAController, ProfileController, PasswordController], // Controller for routes
    providers: [
        RabbitMQService,
        ProfileService,
        PasswordService,
        MFAService,
        AuthService, // Auth service to handle business logic
        JwtAuthGuard, // Guard to protect routes
        JwtStrategy, // JWT strategy for validating tokens
    ],
    exports: [JwtModule, PassportModule], // Export modules if needed in other modules
})
export class AppModule { }
