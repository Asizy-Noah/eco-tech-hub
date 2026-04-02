import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller'; // Ensure this path matches your folder structure
import { AuthController } from './auth/auth.controller';   
import { PrismaService } from './prisma.service';
import { ProjectApiController } from './projects/projects.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [],
  controllers: [
    AppController, 
    AdminController, 
    AuthController,
    ProjectApiController,
  ],
  providers: [AppService, PrismaService, S3Service],
})
export class AppModule {}