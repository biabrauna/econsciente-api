import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { DesafiosModule } from './desafios/desafios.module';
import { ProfilePicModule } from './profile-pic/profile-pic.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FallbackController } from './fallback.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
    }),
    AuthModule,
    PrismaModule,
    UsersModule,
    PostsModule,
    DesafiosModule,
    ProfilePicModule,
  ],
  controllers: [AppController, FallbackController],
  providers: [AppService],
})
export class AppModule {}
