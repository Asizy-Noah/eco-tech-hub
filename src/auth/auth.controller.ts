import { Controller, Post, Body, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';


@Controller('api/auth')
export class AuthController {
    constructor(private prisma: PrismaService) {}
  
  @Post('login')
  async login(@Body() body, @Res() res: Response) {
    const { email, password } = body;

    // 1. Find user in the SQLite database
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password securely using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. In a full production app, you would sign a JWT here. 
    // For now, we set a simple secure cookie to authorize dashboard access.
    res.cookie('admin_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return res.status(200).json({ success: true, message: 'Logged in successfully' });
  }
}