import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import {
  assertResponseOk,
  assertEntityExists,
  assertEntityName,
  assertTokenValue,
  assertEntityDeleted,
} from './utils/assertions';
import { TestDataFactory, generateUniqueName } from './utils/factories';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://user:password@localhost:5433/token_manager_test',
    },
  },
});

test.describe('Tokens API E2E Tests', () => {
  test.beforeEach(async () => {
    // Clean up the database before each test (except themes)
    await prisma.tokenValue.deleteMany();
    await prisma.token.deleteMany();
    await prisma.tokenGroup.deleteMany();
    await prisma.user.deleteMany();
    // Do not delete themes - each test will create the ones it needs
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create token and verify DB state', async ({ request }) => {
    // Test data
    const tokenName = generateUniqueName('test-token');
    const expectedValue = '#000000';

    // Create required themes using factory
    const themes = await TestDataFactory.createThemesForTokens(2);

    // Wait a bit to ensure themes are created
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create token via API
    const createResponse = await request.post('/tokens', {
      data: {
        name: tokenName,
        defaultValue: expectedValue,
      },
    });
    assertResponseOk(createResponse, 'token creation');

    const createdToken = await createResponse.json();
    assertEntityName(createdToken, tokenName, 'created token');

    // Verify database state
    const dbToken = await prisma.token.findFirst({
      where: { name: tokenName },
      include: { tokenValues: true },
    });
    assertEntityExists(dbToken, 'database token');
    assertTokenValue(dbToken!.tokenValues[0], expectedValue);
    assertTokenValue(dbToken!.tokenValues[1], expectedValue);
  });

  test('should delete token and verify DB state', async ({ request }) => {
    // Test data
    const tokenName = `delete-token-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create required themes
    const lightTheme = await prisma.theme.create({
      data: {
        name: `light-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      },
    });
    const darkTheme = await prisma.theme.create({
      data: { name: `dark-${Date.now()}-${Math.floor(Math.random() * 10000)}` },
    });

    // Create token via API
    const createResponse = await request.post('/tokens', {
      data: {
        name: tokenName,
        defaultValue: '#000000',
      },
    });
    assertResponseOk(createResponse, 'token creation');

    const createdToken = await createResponse.json();
    const tokenId = createdToken.id;

    // Verify token exists in DB
    const existingToken = await prisma.token.findFirst({
      where: { name: tokenName },
    });
    assertEntityExists(existingToken, 'existing token');

    // Delete token via API
    const deleteResponse = await request.delete(`/tokens/${tokenId}`);
    assertResponseOk(deleteResponse, 'token deletion');

    // Verify token is deleted from DB
    const deletedToken = await prisma.token.findFirst({
      where: { name: tokenName },
    });
    assertEntityDeleted(deletedToken, 'deleted token');
  });

  test('should get tokens and verify response matches DB', async ({
    request,
  }) => {
    // Test data
    const tokenName1 = `unique-token-1-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const tokenName2 = `unique-token-2-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create required themes
    const lightTheme = await prisma.theme.create({
      data: {
        name: `light-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      },
    });
    const darkTheme = await prisma.theme.create({
      data: { name: `dark-${Date.now()}-${Math.floor(Math.random() * 10000)}` },
    });

    // Create tokens via API
    const token1Response = await request.post('/tokens', {
      data: { name: tokenName1, defaultValue: '#111111' },
    });
    assertResponseOk(token1Response, 'first token creation');

    const token2Response = await request.post('/tokens', {
      data: { name: tokenName2, defaultValue: '#222222' },
    });
    assertResponseOk(token2Response, 'second token creation');

    // Get tokens via API
    const getResponse = await request.get('/tokens');
    assertResponseOk(getResponse, 'tokens retrieval');

    const tokens = await getResponse.json();
    expect(Array.isArray(tokens), 'Response should be an array').toBeTruthy();

    // Verify database state
    const dbTokens = await prisma.token.findMany({
      where: { name: { in: [tokenName1, tokenName2] } },
    });
    expect(
      dbTokens.length,
      'Should have created tokens in database'
    ).toBeGreaterThan(0);
  });

  test('should get specific token by ID', async ({ request }) => {
    // Test data
    const tokenName = `specific-token-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create required themes
    const lightTheme = await prisma.theme.create({
      data: {
        name: `light-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      },
    });
    const darkTheme = await prisma.theme.create({
      data: { name: `dark-${Date.now()}-${Math.floor(Math.random() * 10000)}` },
    });

    // Create token via API
    const createResponse = await request.post('/tokens', {
      data: {
        name: tokenName,
        defaultValue: '#333333',
      },
    });
    assertResponseOk(createResponse, 'token creation');

    const createdToken = await createResponse.json();
    const tokenId = createdToken.id;

    // Get specific token via API
    const getResponse = await request.get(`/tokens/${tokenId}`);
    assertResponseOk(getResponse, 'token retrieval');

    const token = await getResponse.json();
    expect(token.id, 'Token ID should match').toBe(tokenId);
    assertEntityName(token, tokenName, 'retrieved token');
  });
});
