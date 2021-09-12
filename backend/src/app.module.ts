import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
        ignoreEnvFile: false,
        isGlobal: true
    }),
    MongooseModule.forRoot(`mongodb+srv://unknw-nestjs-app:${process.env.MONGODB_PASS.toString()}@unknwcluster0.9igmn.mongodb.net/Main?retryWrites=true&w=majority`),
    AuthModule,
    UsersModule
  ],
  providers: [
      {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
      }
  ]
})
export class AppModule {}
