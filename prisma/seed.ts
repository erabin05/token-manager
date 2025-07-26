import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base : supprimer dans l'ordre des dépendances
  await prisma.tokenValue.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.tokenGroup.deleteMany({});
  await prisma.theme.deleteMany({});
  await prisma.user.deleteMany({});

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

  // Créer des thèmes seulement s'ils n'existent pas
  let lightTheme = await prisma.theme.findUnique({
    where: { name: 'light' },
  });
  if (!lightTheme) {
    lightTheme = await prisma.theme.create({
      data: { name: 'light' },
    });
  }

  let darkTheme = await prisma.theme.findUnique({
    where: { name: 'dark' },
  });
  if (!darkTheme) {
    darkTheme = await prisma.theme.create({
      data: { name: 'dark' },
    });
  }

  // Créer des design tokens avec leurs values pour chaque thème
  const primaryColorToken = await prisma.token.create({
    data: {
      name: 'primary-color',
      tokenValues: {
        create: [
          { value: '#007bff', themeId: lightTheme.id },
          { value: '#4dabf7', themeId: darkTheme.id },
        ],
      },
    },
  });

  const borderRadiusToken = await prisma.token.create({
    data: {
      name: 'border-radius',
      tokenValues: {
        create: [
          { value: '4px', themeId: lightTheme.id },
          { value: '6px', themeId: darkTheme.id },
        ],
      },
    },
  });

  const fontSizeToken = await prisma.token.create({
    data: {
      name: 'font-size',
      tokenValues: {
        create: [
          { value: '16px', themeId: lightTheme.id },
          { value: '18px', themeId: darkTheme.id },
        ],
      },
    },
  });

  const spacingToken = await prisma.token.create({
    data: {
      name: 'spacing',
      tokenValues: {
        create: [
          { value: '16px', themeId: lightTheme.id },
          { value: '20px', themeId: darkTheme.id },
        ],
      },
    },
  });

  // Créer des groupes de tokens
  const colorGroup = await prisma.tokenGroup.create({
    data: { name: 'Colors' },
  });
  const sizeGroup = await prisma.tokenGroup.create({
    data: { name: 'Sizes' },
  });
  const borderGroup = await prisma.tokenGroup.create({
    data: { name: 'Borders', parentId: sizeGroup.id },
  });

  // Mettre à jour les tokens pour les associer à un groupe
  await prisma.token.update({
    where: { id: primaryColorToken.id },
    data: { groupId: colorGroup.id },
  });
  await prisma.token.update({
    where: { id: borderRadiusToken.id },
    data: { groupId: borderGroup.id },
  });
  await prisma.token.update({
    where: { id: fontSizeToken.id },
    data: { groupId: sizeGroup.id },
  });
  await prisma.token.update({
    where: { id: spacingToken.id },
    data: { groupId: sizeGroup.id },
  });

  console.log('Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
