import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

const expressLayouts = require('express-ejs-layouts');
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  // Use cookie-parser middleware
  app.use(cookieParser());
  app.use(expressLayouts);
  
  // Set 'views' directory for EJS templates
  app.useStaticAssets(join(__dirname, '..', '..', 'public')); 
  app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));
  app.setViewEngine('ejs');

  app.set('layout', 'layouts/admin'); 

  await app.listen(3000);  
  console.log(`Eco Tech Hub is running on: http://localhost:3000`);
}
bootstrap();