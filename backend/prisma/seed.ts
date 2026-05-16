import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const org = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      passwordHash,
    },
    create: {
      email: 'admin@test.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      orgId: org.id,
    },
  });

  console.log('Seeded database with user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
