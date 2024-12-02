import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqService } from '../services/rmq.service';


@Module({
  imports: [ConfigModule],
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {}
