import { Controller, Post, Get, Patch, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail.service';
import type { Response } from 'express';

@Controller('api/quotes')
export class QuotesApiController {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  // 1. PUBLIC: Submit a new Quote
  @Post()
  async submitQuote(@Body() data, @Res() res: Response) {
    try {
      const quote = await this.prisma.quote.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          service: data.service,
          message: data.message,
        },
      });

      // Fire off email notification asynchronously
      this.mailService.sendAdminNotification(
        `New Quote Request from ${quote.name}`,
        `<h2>New Quote Request</h2>
         <p><strong>Name:</strong> ${quote.name}</p>
         <p><strong>Email:</strong> ${quote.email}</p>
         <p><strong>Phone:</strong> ${quote.phone || 'N/A'}</p>
         <p><strong>Service of Interest:</strong> ${quote.service || 'General'}</p>
         <p><strong>Message:</strong><br/>${quote.message}</p>`
      );

      return res.status(HttpStatus.CREATED).json({ message: 'Quote submitted successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Submission failed' });
    }
  }

  // 2. ADMIN: Get unread count (for the sidebar badge)
  @Get('unread-count')
  async getUnreadCount(@Res() res: Response) {
    const count = await this.prisma.quote.count({ where: { isRead: false } });
    return res.status(HttpStatus.OK).json({ count });
  }

  // 3. ADMIN: Mark as read
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Res() res: Response) {
    await this.prisma.quote.update({ where: { id }, data: { isRead: true } });
    return res.status(HttpStatus.OK).json({ message: 'Marked as read' });
  }

  // 4. ADMIN: Delete quote
  @Delete(':id')
  async deleteQuote(@Param('id') id: string, @Res() res: Response) {
    await this.prisma.quote.delete({ where: { id } });
    return res.status(HttpStatus.OK).json({ message: 'Deleted' });
  }
}