import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { User } from '../entities/user.entity';
import { RabbitMQAuthController } from '../controllers/rabbitmq.controller';
import { MFAService } from '../services/mfa.service';
import { PasswordService } from '../services/password.service';
import { ProfileService } from '../services/profile.service';
import { MFAController } from '../controllers/mfa.controller';
import { EmailService } from '../services/email.service';
import { PasswordController } from '../controllers/password.controller';
import { RmqService } from '../services/rmq.service';
import { ProfileController } from '../controllers/profile.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, RabbitMQAuthController, MFAController ,PasswordController,RabbitMQAuthController,ProfileController],
  providers: [
    AuthService,
    MFAService,
    PasswordService,
    ProfileService,
    EmailService,
    RmqService
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}