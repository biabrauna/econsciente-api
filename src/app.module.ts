import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { DesafiosModule } from './desafios/desafios.module';
import { ProfilePicModule } from './profile-pic/profile-pic.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { VisionModule } from './vision/vision.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CustomLoggerService } from './common/logger/custom-logger.service';
import { ConquistasModule } from './conquistas/conquistas.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { FollowModule } from './follow/follow.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthModule,
    PrismaModule,
    UsersModule,
    PostsModule,
    DesafiosModule,
    ProfilePicModule,
    VisionModule,
    ConquistasModule,
    NotificacoesModule,
    FollowModule,
    OnboardingModule,
    ComentariosModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CustomLoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
