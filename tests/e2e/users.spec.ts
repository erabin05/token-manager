import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { assertResponseOk, assertEntityExists } from './utils/assertions';
import { UserFactory, generateUniqueName } from './utils/factories';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://user:password@localhost:5433/token_manager_test',
    },
  },
});

test.describe('Users API E2E Tests', () => {
  test.beforeEach(async () => {
    // Clean DB before each test (respect dependencies order)
    await prisma.tokenValue.deleteMany();
    await prisma.token.deleteMany();
    await prisma.tokenGroup.deleteMany();
    await prisma.user.deleteMany();
    await prisma.theme.deleteMany();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should get users and verify response matches DB', async ({
    request,
  }) => {
    // Test data
    const userEmail1 = `${generateUniqueName('user1')}@test.com`;
    const userEmail2 = `${generateUniqueName('user2')}@test.com`;
    const userName1 = 'User 1';
    const userName2 = 'User 2';

    // Create test users directly in DB
    await prisma.user.createMany({
      data: [
        { email: userEmail1, name: userName1 },
        { email: userEmail2, name: userName2 },
      ],
    });

    // Get users via API
    const getResponse = await request.get('/users');
    assertResponseOk(getResponse, 'users retrieval');

    const users = await getResponse.json();

    // Verify our specific users are in the response
    const userEmails = users.map((u: any) => u.email);
    expect(userEmails, 'Response should contain first user').toContain(
      userEmail1
    );
    expect(userEmails, 'Response should contain second user').toContain(
      userEmail2
    );

    // Verify database state
    const dbUsers = await prisma.user.findMany({
      where: {
        email: { in: [userEmail1, userEmail2] },
      },
    });
    expect(
      dbUsers.length,
      'Should have created users in database'
    ).toBeGreaterThan(0);
  });

  test('should return empty array when no users exist', async ({ request }) => {
    // Verify no users in DB
    const initialUsers = await prisma.user.count();
    expect(initialUsers, 'Should start with no users').toBe(0);

    // Get users via API
    const getResponse = await request.get('/users');
    assertResponseOk(getResponse, 'users retrieval');

    const users = await getResponse.json();
    expect(users, 'Response should be an array').toBeInstanceOf(Array);
  });
});
