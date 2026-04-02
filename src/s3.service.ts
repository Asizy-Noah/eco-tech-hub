import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid'; // Fixed import

@Injectable()
export class S3Service {
  private s3: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        // Use non-null assertion (!) to fix TS2345
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'projects'): Promise<string> {
    const uniqueFilename = `${folder}/${uuidv4()}${extname(file.originalname)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueFilename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3.send(command);
      return `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`;
    } catch (error) {
      this.logger.error('Failed to upload to R2', error);
      throw new Error('Image upload failed');
    }
  }
}