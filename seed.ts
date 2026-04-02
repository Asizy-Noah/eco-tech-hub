import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({ 
  url: process.env.DATABASE_URL || 'file:./dev.db' 
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const password = '#Abnormal123'; 
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'asionoah@gmail.com' },
    update: {},
    create: {
      email: 'asionoah@gmail.com',
      name: 'Eco Tech Admin',
      passwordHash: hash,
    },
  });

  console.log('Admin account created:', admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());