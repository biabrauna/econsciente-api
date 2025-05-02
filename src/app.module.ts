import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DesafiosModule } from './desafios/desafios.module';
import { PostsModule } from './posts/posts.module';
import { ProfilePicModule } from './profile-pic/profile-pic.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    DesafiosModule,
    PostsModule,
    ProfilePicModule,
  ],
})
export class AppModule {}