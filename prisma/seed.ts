import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur seulement s'il n'existe pas
  const existingUser = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
      },
    });
  }

  // Créer des design tokens avec leurs values
  const token1 = await prisma.token.create({
    data: {
      name: 'primary-color',
      tokenValues: {
        create: [
          { value: '#007bff' },
          { value: '#0056b3' },
          { value: '#004085' },
        ],
      },
    },
  });

  const token2 = await prisma.token.create({
    data: {
      name: 'border-radius',
      tokenValues: {
        create: [
          { value: '4px' },
          { value: '8px' },
          { value: '12px' },
          { value: '16px' },
        ],
      },
    },
  });

  const token3 = await prisma.token.create({
    data: {
      name: 'font-size',
      tokenValues: {
        create: [
          { value: '12px' },
          { value: '14px' },
          { value: '16px' },
          { value: '18px' },
          { value: '24px' },
          { value: '32px' },
        ],
      },
    },
  });

  const token4 = await prisma.token.create({
    data: {
      name: 'spacing',
      tokenValues: {
        create: [
          { value: '4px' },
          { value: '8px' },
          { value: '16px' },
          { value: '24px' },
          { value: '32px' },
          { value: '48px' },
        ],
      },
    },
  });

  console.log('Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
