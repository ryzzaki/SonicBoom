import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'nestjs-redis';
import { typeOrmConfig } from './config/typeorm.config';
import { redisModuleConfig } from './config/redis.config';
import { SpotifyModule } from './spotify/spotify.module';
import { WebplayerModule } from './webplayer/webplayer.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    RedisModule.register(redisModuleConfig),
    AuthModule,
    SpotifyModule,
    WebplayerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', './frontend-sb/build'),
    }),
    SessionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
