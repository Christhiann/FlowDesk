import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
