import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

import { RabbitMQAuthController } from '../controllers/rabbitmq.controller';
import { RmqModule } from './rabbitmq.module';
import { AuthModule } from './auth.module';
import { profile } from 'console';
import { ProfileService } from '../services/profile.service';



@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RmqModule,
  ],
  providers: [ProfileService],
  controllers: [RabbitMQAuthController],
})
export class AppModule {}

