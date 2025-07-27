import { test, expect } from './utils/test-setup';
import { UserRole } from '@prisma/client';
import {
  assertResponseOk,
  assertEntityExists,
  assertEntityName,
  assertEntityDeleted,
} from './utils/assertions';
import { TestDataFactory, generateUniqueName } from './utils/factories';
import { prisma, createUserWithRole, createAuthHeaders } from './utils/auth';
import { cleanupDatabaseExceptThemes } from './utils/database';

test.describe('Themes API E2E Tests', () => {
  test.beforeEach(async () => {
    // Clean up before each test (except themes)
    await cleanupDatabaseExceptThemes();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create theme and verify DB state', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const themeName = generateUniqueName('theme');

    // Create theme via API
    const createResponse = await request.post('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: themeName },
    });
    assertResponseOk(createResponse, 'theme creation');

    const createdTheme = await createResponse.json();
    assertEntityName(createdTheme, themeName, 'created theme');

    // Verify database state
    const dbTheme = await prisma.theme.findFirst({
      where: { name: themeName },
    });
    assertEntityExists(dbTheme, 'database theme');
    assertEntityName(dbTheme!, themeName, 'database theme');
  });

  test('should create theme with parent and verify DB state', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const parentName = generateUniqueName('parent-theme');
    const childName = generateUniqueName('child-theme');

    // Create parent theme first
    const parentResponse = await request.post('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: parentName },
    });
    assertResponseOk(parentResponse, 'parent theme creation');

    const parentTheme = await parentResponse.json();

    // Create child theme with parent reference
    const childResponse = await request.post('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: childName, parentId: parentTheme.id },
    });
    assertResponseOk(childResponse, 'child theme creation');

    const childTheme = await childResponse.json();

    // Verify parent-child relationship
    expect(childTheme.parentId, 'Child should have parent ID').toBe(
      parentTheme.id
    );

    // Verify database state
    const dbChildTheme = await prisma.theme.findFirst({
      where: { name: childName },
      include: { parent: true },
    });
    assertEntityExists(dbChildTheme, 'database child theme');
    expect(dbChildTheme!.parent!.name, 'Parent name should match').toBe(
      parentName
    );
  });

  test('should delete theme and verify DB state', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const themeName = generateUniqueName('theme-to-delete');

    // Create theme via API
    const createResponse = await request.post('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: themeName },
    });
    assertResponseOk(createResponse, 'theme creation');

    const createdTheme = await createResponse.json();
    const themeId = createdTheme.id;

    // Verify theme exists in DB
    const existingTheme = await prisma.theme.findFirst({
      where: { name: themeName },
    });
    assertEntityExists(existingTheme, 'existing theme');

    // Delete theme via API
    const deleteResponse = await request.delete(`/themes/${themeId}`, {
      headers: createAuthHeaders(authInfo.accessToken),
    });
    assertResponseOk(deleteResponse, 'theme deletion');

    // Verify theme is deleted from DB
    const deletedTheme = await prisma.theme.findFirst({
      where: { name: themeName },
    });
    assertEntityDeleted(deletedTheme, 'deleted theme');
  });

  test('should get themes and verify response matches DB', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const themeName1 = generateUniqueName('theme-1');
    const themeName2 = generateUniqueName('theme-2');

    const theme1Response = await request.post('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: themeName1 },
    });
    assertResponseOk(theme1Response, 'first theme creation');

    const theme2Response = await request.post('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: themeName2 },
    });
    assertResponseOk(theme2Response, 'second theme creation');

    // Get themes via API
    const getResponse = await request.get('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
    });
    assertResponseOk(getResponse, 'themes retrieval');

    const themes = await getResponse.json();

    // Verify our themes are in the response
    const themeNames = themes.map((t: any) => t.name);
    expect(themeNames, 'Response should contain first theme').toContain(
      themeName1
    );
    expect(themeNames, 'Response should contain second theme').toContain(
      themeName2
    );

    // Verify in the database
    const dbThemes = await prisma.theme.findMany({
      where: {
        name: { in: [themeName1, themeName2] },
      },
    });
    expect(
      dbThemes.length,
      'Should have created themes in database'
    ).toBeGreaterThan(0);
  });

  test('should create theme with tokens and verify token values are created', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const themeName = generateUniqueName('theme');
    const tokenName1 = generateUniqueName('token-1');
    const tokenName2 = generateUniqueName('token-2');
    const expectedValue = 'new-value';

    // Create required themes using factory
    const themes = await TestDataFactory.createThemesForTokens(2);

    // Create theme via API
    const createThemeResponse = await request.post('/themes', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: themeName },
    });
    assertResponseOk(createThemeResponse, 'theme creation');
    const theme = await createThemeResponse.json();

    // Create two tokens via API
    const createToken1 = await request.post('/tokens', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: tokenName1, defaultValue: expectedValue },
    });
    assertResponseOk(createToken1, 'first token creation');

    const createToken2 = await request.post('/tokens', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: tokenName2, defaultValue: expectedValue },
    });
    assertResponseOk(createToken2, 'second token creation');

    // Verify TokenValues were created for this theme and these tokens
    const tokenValues = await prisma.tokenValue.findMany({
      where: { themeId: theme.id },
      include: { token: true },
    });
    // Verify that each token created in this test has a TokenValue for this theme
    expect(
      tokenValues.some(
        tv => tv.token.name === tokenName1 && tv.value === expectedValue
      ),
      `Token ${tokenName1} should have value for theme ${themeName}`
    ).toBe(true);
    expect(
      tokenValues.some(
        tv => tv.token.name === tokenName2 && tv.value === expectedValue
      ),
      `Token ${tokenName2} should have value for theme ${themeName}`
    ).toBe(true);
  });
});
