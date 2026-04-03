import { Controller, Post, Get, Patch, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail.service';
import type { Response } from 'express';

@Controller('api/messages')
export class MessagesApiController {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  // 1. PUBLIC: Submit a "Contact Us" message
  @Post()
  async submitMessage(@Body() data, @Res() res: Response) {
    try {
      const msg = await this.prisma.message.create({
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject || 'General Inquiry',
          message: data.message,
        },
      });

      // Send email notification to Admin asynchronously
      this.mailService.sendAdminNotification(
        `New Contact Message: ${msg.subject}`,
        `<h2>New Message Received</h2>
         <p><strong>From:</strong> ${msg.name} (${msg.email})</p>
         <p><strong>Subject:</strong> ${msg.subject}</p>
         <p><strong>Message:</strong><br/>${msg.message.replace(/\n/g, '<br/>')}</p>`
      );

      return res.status(HttpStatus.CREATED).json({ message: 'Message sent successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Failed to send message' });
    }
  }

  // 2. ADMIN: Get unread count for sidebar
  @Get('unread-count')
  async getUnreadCount(@Res() res: Response) {
    const count = await this.prisma.message.count({ where: { isRead: false } });
    return res.status(HttpStatus.OK).json({ count });
  }

  // 3. ADMIN: Mark as read
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Res() res: Response) {
    await this.prisma.message.update({ where: { id }, data: { isRead: true } });
    return res.status(HttpStatus.OK).json({ message: 'Marked as read' });
  }

  // 4. ADMIN: Delete message
  @Delete(':id')
  async deleteMessage(@Param('id') id: string, @Res() res: Response) {
    await this.prisma.message.delete({ where: { id } });
    return res.status(HttpStatus.OK).json({ message: 'Deleted' });
  }
}