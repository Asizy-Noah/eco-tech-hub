import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

const expressLayouts = require('express-ejs-layouts');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.use(expressLayouts);  

  // Use process.cwd() to consistently point to the project root
  const rootPath = process.cwd();
   
  // Set paths relative to the project root
  app.useStaticAssets(join(rootPath, 'public')); 
  app.setBaseViewsDir(join(rootPath, 'views')); 
  app.setViewEngine('ejs');

  app.set('layout', 'layouts/admin'); 

  await app.listen(3000);  
  console.log(`Eco Tech Hub is running on: http://localhost:3000`);
}
bootstrap();