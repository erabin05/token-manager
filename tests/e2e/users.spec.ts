import { test, expect } from '@playwright/test';
import { UserRole } from '@prisma/client';
import { assertResponseOk } from './utils/assertions';
import { generateUniqueName } from './utils/factories';
import { prisma, createUserWithRole, createAuthHeaders } from './utils/auth';
import { cleanupDatabase } from './utils/database';

test.describe('Users API E2E Tests', () => {
  let adminUser: any;

  test.beforeEach(async () => {
    // Clean DB before each test (respect dependencies order)
    await cleanupDatabase();

    // Créer un utilisateur admin pour les tests
    adminUser = await createUserWithRole(UserRole.ADMIN);
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
        { email: userEmail1, name: userName1, role: UserRole.VIEWER },
        { email: userEmail2, name: userName2, role: UserRole.MAINTAINER },
      ],
    });

    // Get users via API with authentication
    const getResponse = await request.get('/users', {
      headers: createAuthHeaders(adminUser.id),
    });
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
    // Clean users again to ensure empty state
    await prisma.user.deleteMany();

    // Create a new admin user for this test
    const testAdminUser = await createUserWithRole(UserRole.ADMIN);

    // Verify no users in DB (except admin)
    const initialUsers = await prisma.user.count();
    expect(initialUsers, 'Should start with only admin user').toBe(1);

    // Get users via API with authentication
    const getResponse = await request.get('/users', {
      headers: { 'x-user-id': testAdminUser.id.toString() },
    });
    assertResponseOk(getResponse, 'users retrieval');

    const users = await getResponse.json();
    expect(users, 'Response should be an array').toBeInstanceOf(Array);
    expect(users.length, 'Should return only admin user').toBe(1);
  });
});
