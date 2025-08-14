import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { DesafiosModule } from './desafios/desafios.module';
import { ProfilePicModule } from './profile-pic/profile-pic.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { VisionModule } from './vision/vision.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    PostsModule,
    DesafiosModule,
    ProfilePicModule,
    VisionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
