import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller'; // Ensure this path matches your folder structure
import { AuthController } from './auth/auth.controller';   
import { PrismaService } from './prisma.service';
import { ProjectApiController } from './projects/projects.controller';
import { S3Service } from './s3.service';
import { ServicesApiController } from './services/services.controller';
import { BlogsApiController } from './blogs/blogs.controller';
import { QuotesApiController } from './quotes/quotes.controller';
import { MailService } from './mail.service';
import { MessagesApiController } from './messages/messages.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ViewDataInterceptor } from './view-data.interceptor';

@Module({
  imports: [],
  controllers: [
    AppController, 
    AdminController, 
    AuthController,
    ProjectApiController,
    ServicesApiController,
    BlogsApiController,
    QuotesApiController,
    MessagesApiController,
  ],
  providers: [AppService, PrismaService, S3Service, MailService, {
      provide: APP_INTERCEPTOR,
      useClass: ViewDataInterceptor,
    },],
})
export class AppModule {}