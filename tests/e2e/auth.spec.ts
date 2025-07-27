import { test, expect } from './utils/test-setup';
import { UserRole } from '@prisma/client';
import {
  prisma,
  createTestUsers,
  createAuthHeaders,
  loginAsAdmin,
} from './utils/auth';
import { cleanupDatabase } from './utils/database';
import { generateUniqueName } from './utils/factories';

test.describe('Authentication and Authorization E2E Tests', () => {
  let viewerUser: any;
  let maintainerUser: any;
  let adminUser: any;
  let testTheme: any;
  let testToken: any;
  let testGroup: any;

  test.beforeEach(async ({ request }) => {
    // Nettoyer la base de données
    await cleanupDatabase();

    // Créer les utilisateurs de test avec différents rôles
    const users = await createTestUsers();
    viewerUser = users.viewerUser;
    maintainerUser = users.maintainerUser;
    adminUser = users.adminUser;

    // Créer des données de test
    testTheme = await prisma.theme.create({
      data: { name: generateUniqueName('test-theme') },
    });

    testGroup = await prisma.tokenGroup.create({
      data: { name: generateUniqueName('test-group') },
    });

    testToken = await prisma.token.create({
      data: {
        name: generateUniqueName('test-token'),
        groupId: testGroup.id,
        tokenValues: {
          create: {
            value: '#000000',
            themeId: testTheme.id,
          },
        },
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test.describe('Authentication', () => {
    test('should reject requests without authorization header', async ({
      request,
    }) => {
      const response = await request.get('/users');
      expect(response.status()).toBe(401);

      const error = await response.json();
      expect(error.error).toBe(
        'Authorization header with Bearer token is required'
      );
    });

    test('should reject requests with invalid token', async ({ request }) => {
      const response = await request.get('/users', {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      expect(response.status()).toBe(401);

      const error = await response.json();
      expect(error.error).toBe('Invalid or expired token');
    });

    test('should accept requests with valid token', async ({
      request,
      authInfo,
    }) => {
      const response = await request.get('/users', {
        headers: createAuthHeaders(authInfo.accessToken),
      });
      expect(response.status()).toBe(200);
    });

    test('should login successfully with admin credentials', async ({
      request,
    }) => {
      const authInfo = await loginAsAdmin(request);

      expect(authInfo.accessToken).toBeDefined();
      expect(authInfo.refreshToken).toBeDefined();
      expect(authInfo.user.role).toBe('ADMIN');
      expect(authInfo.user.email).toBe(
        process.env.ADMIN_EMAIL || 'admin@token-manager.com'
      );
    });

    test('should reject login with invalid credentials', async ({
      request,
    }) => {
      const response = await request.post('/auth/login', {
        data: {
          email: 'invalid@test.com',
          password: 'wrongpassword',
        },
      });

      expect(response.status()).toBe(401);
      const error = await response.json();
      expect(error.error).toBe('Invalid email or password');
    });
  });

  test.describe('VIEWER Role Permissions', () => {
    test('should allow VIEWER to read users', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.get('/users', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(200);

      const users = await response.json();
      expect(Array.isArray(users)).toBe(true);
    });

    test('should allow VIEWER to read themes', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.get('/themes', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(200);

      const themes = await response.json();
      expect(Array.isArray(themes)).toBe(true);
    });

    test('should allow VIEWER to read tokens', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.get('/tokens', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(200);

      const tokens = await response.json();
      expect(Array.isArray(tokens)).toBe(true);
    });

    test('should allow VIEWER to read groups', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.get('/groups', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(200);

      const groups = await response.json();
      expect(Array.isArray(groups)).toBe(true);
    });

    test('should deny VIEWER from creating users', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.post('/users', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
        data: {
          email: 'newuser@test.com',
          name: 'New User',
        },
      });
      expect(response.status()).toBe(403);

      const error = await response.json();
      expect(error.error).toBe('Insufficient permissions');
    });

    test('should deny VIEWER from creating themes', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.post('/themes', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
        data: {
          name: 'New Theme',
        },
      });
      expect(response.status()).toBe(403);

      const error = await response.json();
      expect(error.error).toBe('Insufficient permissions');
    });

    test('should deny VIEWER from creating tokens', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.post('/tokens', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
        data: {
          name: 'New Token',
        },
      });
      expect(response.status()).toBe(403);

      const error = await response.json();
      expect(error.error).toBe('Insufficient permissions');
    });

    test('should deny VIEWER from creating groups', async ({ request }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.post('/groups', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
        data: {
          name: 'New Group',
        },
      });
      expect(response.status()).toBe(403);

      const error = await response.json();
      expect(error.error).toBe('Insufficient permissions');
    });
  });

  test.describe('MAINTAINER Role Permissions', () => {
    test('should allow MAINTAINER to read all entities', async ({
      request,
    }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const endpoints = ['/users', '/themes', '/tokens', '/groups'];

      for (const endpoint of endpoints) {
        const response = await request.get(endpoint, {
          headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        });
        expect(response.status()).toBe(200);
      }
    });

    test('should allow MAINTAINER to create themes', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const response = await request.post('/themes', {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          name: generateUniqueName('maintainer-theme'),
        },
      });
      expect(response.status()).toBe(201);

      const theme = await response.json();
      expect(theme.name).toContain('maintainer-theme');
    });

    test('should allow MAINTAINER to create tokens', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const response = await request.post('/tokens', {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          name: generateUniqueName('maintainer-token'),
        },
      });
      expect(response.status()).toBe(201);

      const token = await response.json();
      expect(token.name).toContain('maintainer-token');
    });

    test('should allow MAINTAINER to create groups', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const response = await request.post('/groups', {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          name: generateUniqueName('maintainer-group'),
        },
      });
      expect(response.status()).toBe(201);

      const group = await response.json();
      expect(group.name).toContain('maintainer-group');
    });

    test('should allow MAINTAINER to update themes', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const newName = generateUniqueName('updated-theme');
      const response = await request.put(`/themes/${testTheme.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          name: newName,
        },
      });
      expect(response.status()).toBe(200);

      const theme = await response.json();
      expect(theme.name).toBe(newName);
    });

    test('should allow MAINTAINER to update tokens', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const newName = generateUniqueName('updated-token');
      const response = await request.put(`/tokens/${testToken.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          name: newName,
        },
      });
      expect(response.status()).toBe(200);

      const token = await response.json();
      expect(token.name).toBe(newName);
    });

    test('should allow MAINTAINER to update groups', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const newName = generateUniqueName('updated-group');
      const response = await request.put(`/groups/${testGroup.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          name: newName,
        },
      });
      expect(response.status()).toBe(200);

      const group = await response.json();
      expect(group.name).toBe(newName);
    });

    test('should allow MAINTAINER to delete themes', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const themeToDelete = await prisma.theme.create({
        data: { name: generateUniqueName('delete-theme') },
      });

      const response = await request.delete(`/themes/${themeToDelete.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(204);
    });

    test('should allow MAINTAINER to delete tokens', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const tokenToDelete = await prisma.token.create({
        data: {
          name: generateUniqueName('delete-token'),
          tokenValues: {
            create: {
              value: '#000000',
              themeId: testTheme.id,
            },
          },
        },
      });

      const response = await request.delete(`/tokens/${tokenToDelete.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(204);
    });

    test('should allow MAINTAINER to delete groups', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const groupToDelete = await prisma.tokenGroup.create({
        data: { name: generateUniqueName('delete-group') },
      });

      const response = await request.delete(`/groups/${groupToDelete.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(204);
    });

    test('should deny MAINTAINER from creating users', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const response = await request.post('/users', {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          email: 'maintainer@test.com',
          name: 'Maintainer User',
        },
      });
      expect(response.status()).toBe(403);

      const error = await response.json();
      expect(error.error).toBe('Insufficient permissions');
    });

    test('should deny MAINTAINER from updating users', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const response = await request.put(`/users/${viewerUser.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
        data: {
          name: 'Updated Name',
        },
      });
      expect(response.status()).toBe(403);

      const error = await response.json();
      expect(error.error).toBe('Insufficient permissions');
    });

    test('should deny MAINTAINER from deleting users', async ({ request }) => {
      // Se connecter avec l'utilisateur maintainer
      const maintainerAuth = await request.post('/auth/login', {
        data: {
          email: maintainerUser.email,
          password: 'password123',
        },
      });
      const maintainerAuthInfo = await maintainerAuth.json();

      const response = await request.delete(`/users/${viewerUser.id}`, {
        headers: createAuthHeaders(maintainerAuthInfo.accessToken),
      });
      expect(response.status()).toBe(403);

      const error = await response.json();
      expect(error.error).toBe('Insufficient permissions');
    });
  });

  test.describe('ADMIN Role Permissions', () => {
    test('should allow ADMIN to perform all operations', async ({
      request,
      authInfo,
    }) => {
      // Test création d'utilisateur
      const newUserData = {
        email: `${generateUniqueName('admin-created')}@test.com`,
        name: generateUniqueName('admin-user'),
        password: 'password123',
        role: UserRole.VIEWER,
      };

      const createUserResponse = await request.post('/users', {
        headers: createAuthHeaders(authInfo.accessToken),
        data: newUserData,
      });
      expect(createUserResponse.status()).toBe(201);

      const createdUser = await createUserResponse.json();
      expect(createdUser.email).toBe(newUserData.email);
      expect(createdUser.role).toBe(UserRole.VIEWER);

      // Test mise à jour d'utilisateur
      const updateUserResponse = await request.put(`/users/${createdUser.id}`, {
        headers: createAuthHeaders(authInfo.accessToken),
        data: {
          name: 'Updated Admin User',
          role: UserRole.MAINTAINER,
        },
      });
      expect(updateUserResponse.status()).toBe(200);

      const updatedUser = await updateUserResponse.json();
      expect(updatedUser.name).toBe('Updated Admin User');
      expect(updatedUser.role).toBe(UserRole.MAINTAINER);

      // Test suppression d'utilisateur
      const deleteUserResponse = await request.delete(
        `/users/${createdUser.id}`,
        {
          headers: createAuthHeaders(authInfo.accessToken),
        }
      );
      expect(deleteUserResponse.status()).toBe(204);
    });

    test('should allow ADMIN to manage all entities', async ({
      request,
      authInfo,
    }) => {
      // Créer et gérer un thème
      const themeResponse = await request.post('/themes', {
        headers: createAuthHeaders(authInfo.accessToken),
        data: { name: generateUniqueName('admin-theme') },
      });
      expect(themeResponse.status()).toBe(201);
      const theme = await themeResponse.json();

      // Créer et gérer un groupe
      const groupResponse = await request.post('/groups', {
        headers: createAuthHeaders(authInfo.accessToken),
        data: { name: generateUniqueName('admin-group') },
      });
      expect(groupResponse.status()).toBe(201);
      const group = await groupResponse.json();

      // Créer et gérer un token
      const tokenResponse = await request.post('/tokens', {
        headers: createAuthHeaders(authInfo.accessToken),
        data: {
          name: generateUniqueName('admin-token'),
          groupId: group.id,
        },
      });
      expect(tokenResponse.status()).toBe(201);
      const token = await tokenResponse.json();

      // Mettre à jour le thème
      const updateThemeResponse = await request.put(`/themes/${theme.id}`, {
        headers: createAuthHeaders(authInfo.accessToken),
        data: { name: generateUniqueName('updated-admin-theme') },
      });
      expect(updateThemeResponse.status()).toBe(200);

      // Mettre à jour le groupe
      const updateGroupResponse = await request.put(`/groups/${group.id}`, {
        headers: createAuthHeaders(authInfo.accessToken),
        data: { name: generateUniqueName('updated-admin-group') },
      });
      expect(updateGroupResponse.status()).toBe(200);

      // Mettre à jour le token
      const updateTokenResponse = await request.put(`/tokens/${token.id}`, {
        headers: createAuthHeaders(authInfo.accessToken),
        data: { name: generateUniqueName('updated-admin-token') },
      });
      expect(updateTokenResponse.status()).toBe(200);

      // Supprimer les entités
      await request.delete(`/tokens/${token.id}`, {
        headers: createAuthHeaders(authInfo.accessToken),
      });
      await request.delete(`/groups/${group.id}`, {
        headers: createAuthHeaders(authInfo.accessToken),
      });
      await request.delete(`/themes/${theme.id}`, {
        headers: createAuthHeaders(authInfo.accessToken),
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should return proper error messages for permission violations', async ({
      request,
    }) => {
      // Se connecter avec l'utilisateur viewer
      const viewerAuth = await request.post('/auth/login', {
        data: {
          email: viewerUser.email,
          password: 'password123',
        },
      });
      const viewerAuthInfo = await viewerAuth.json();

      const response = await request.post('/users', {
        headers: createAuthHeaders(viewerAuthInfo.accessToken),
        data: {
          email: 'test@test.com',
          name: 'Test User',
        },
      });

      expect(response.status()).toBe(403);
      const error = await response.json();

      expect(error.error).toBe('Insufficient permissions');
      expect(error.required).toBe('users:write');
      expect(error.userRole).toBe('VIEWER');
      expect(Array.isArray(error.userPermissions)).toBe(true);
    });

    test('should handle invalid user operations gracefully', async ({
      request,
      authInfo,
    }) => {
      // Tenter de mettre à jour un utilisateur inexistant
      const response = await request.put('/users/99999', {
        headers: createAuthHeaders(authInfo.accessToken),
        data: {
          name: 'Updated Name',
        },
      });

      expect(response.status()).toBe(404);
      const error = await response.json();
      expect(error.error).toBe('User not found');
    });
  });
});
