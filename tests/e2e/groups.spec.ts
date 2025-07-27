import { test, expect } from './utils/test-setup';
import { UserRole } from '@prisma/client';
import {
  assertResponseOk,
  assertEntityExists,
  assertEntityName,
  assertCollectionContains,
  assertEntityDeleted,
} from './utils/assertions';
import { TestDataFactory, generateUniqueName } from './utils/factories';
import { prisma, createUserWithRole, createAuthHeaders } from './utils/auth';
import { cleanupDatabaseExceptThemes } from './utils/database';

test.describe('Groups API E2E Tests', () => {
  test.beforeEach(async () => {
    // Clean up the database before each test (except themes)
    await cleanupDatabaseExceptThemes();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create group and verify DB state', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const groupName = generateUniqueName('test-group');

    // Create group via API
    const createResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: groupName },
    });
    assertResponseOk(createResponse, 'group creation');

    const createdGroup = await createResponse.json();
    assertEntityName(createdGroup, groupName, 'created group');

    // Verify database state
    const dbGroup = await prisma.tokenGroup.findFirst({
      where: { name: groupName },
    });
    assertEntityExists(dbGroup, 'database group');
    assertEntityName(dbGroup!, groupName, 'database group');
  });

  test('should create group with parent and verify DB state', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const parentName = generateUniqueName('parent-group');
    const childName = generateUniqueName('child-group');

    // Create parent group first
    const parentResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: parentName },
    });
    assertResponseOk(parentResponse, 'parent group creation');

    const parentGroup = await parentResponse.json();

    // Create child group with parent reference
    const childResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: childName, parentId: parentGroup.id },
    });
    assertResponseOk(childResponse, 'child group creation');

    const childGroup = await childResponse.json();

    // Verify parent-child relationship
    expect(childGroup.parentId, 'Child should have parent ID').toBe(
      parentGroup.id
    );

    // Verify database state
    const dbChildGroup = await prisma.tokenGroup.findFirst({
      where: { name: childName },
      include: { parent: true },
    });
    assertEntityExists(dbChildGroup, 'database child group');
    expect(dbChildGroup!.parent!.name, 'Parent name should match').toBe(
      parentName
    );
  });

  test('should delete group and verify DB state', async ({
    request,
    authInfo,
  }) => {
    // 1. Create a group first
    const createResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: 'group-to-delete' },
    });
    expect(createResponse.ok()).toBeTruthy();

    const createdGroup = await createResponse.json();
    const groupId = createdGroup.id;

    // 2. Verify group exists in DB
    const existingGroup = await prisma.tokenGroup.findFirst({
      where: { name: 'group-to-delete' },
    });
    expect(existingGroup).toBeTruthy();

    // 3. Delete group via API
    const deleteResponse = await request.delete(`/groups/${groupId}`, {
      headers: createAuthHeaders(authInfo.accessToken),
    });
    expect(deleteResponse.ok()).toBeTruthy();

    // 4. Verify DB state
    const deletedGroup = await prisma.tokenGroup.findFirst({
      where: { name: 'group-to-delete' },
    });
    expect(deletedGroup).toBeNull();
  });

  test('should get groups and verify response matches DB', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const groupName1 = generateUniqueName('group-1');
    const groupName2 = generateUniqueName('group-2');

    // Create test groups
    const group1Response = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: groupName1 },
    });
    assertResponseOk(group1Response, 'first group creation');

    const group2Response = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: groupName2 },
    });
    assertResponseOk(group2Response, 'second group creation');

    // Get groups via API
    const getResponse = await request.get('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
    });
    assertResponseOk(getResponse, 'groups retrieval');

    const groups = await getResponse.json();
    expect(Array.isArray(groups), 'Response should be an array').toBeTruthy();

    // Verify our specific groups are in the response
    const groupNames = groups.map((g: any) => g.name);
    expect(groupNames, 'Response should contain first group').toContain(
      groupName1
    );
    expect(groupNames, 'Response should contain second group').toContain(
      groupName2
    );

    // Verify database state
    const dbGroups = await prisma.tokenGroup.findMany({
      where: {
        name: { in: [groupName1, groupName2] },
      },
    });
    expect(
      dbGroups.length,
      'Should have created groups in database'
    ).toBeGreaterThan(0);
  });

  test('should get specific group by ID with children and tokens', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const parentName = generateUniqueName('parent-group');
    const childName = generateUniqueName('child-group');
    const tokenName = generateUniqueName('group-token');

    // Create required themes using factory
    const themes = await TestDataFactory.createThemesForTokens(2);

    // Create parent group
    const parentResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: parentName },
    });
    assertResponseOk(parentResponse, 'parent group creation');
    const parentGroup = await parentResponse.json();

    // Create child group
    const childResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: childName, parentId: parentGroup.id },
    });
    assertResponseOk(childResponse, 'child group creation');
    const childGroup = await childResponse.json();

    // Create token in parent group
    const tokenResponse = await request.post('/tokens', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: {
        name: tokenName,
        groupId: parentGroup.id,
        defaultValue: '#000000',
      },
    });
    assertResponseOk(tokenResponse, 'token creation');

    // Get specific group via API
    const getResponse = await request.get(`/groups/${parentGroup.id}`, {
      headers: createAuthHeaders(authInfo.accessToken),
    });
    assertResponseOk(getResponse, 'group retrieval');

    const group = await getResponse.json();
    expect(group.id, 'Group ID should match').toBe(parentGroup.id);
    assertEntityName(group, parentName, 'retrieved group');

    // Verify relationships
    assertCollectionContains(group.children, childName, 'children collection');
    assertCollectionContains(group.tokens, tokenName, 'tokens collection');
  });

  test('should delete group with children and verify cascade deletion', async ({
    request,
    authInfo,
  }) => {
    // Test data
    const parentName = generateUniqueName('parent-to-delete');
    const childName = generateUniqueName('child-to-delete');
    const parentTokenName = generateUniqueName('parent-token');
    const childTokenName = generateUniqueName('child-token');

    // Create required themes using factory
    const themes = await TestDataFactory.createThemesForTokens(2);

    // Create parent group with child
    const parentResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: parentName },
    });
    assertResponseOk(parentResponse, 'parent group creation');
    const parentGroup = await parentResponse.json();

    const childResponse = await request.post('/groups', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: { name: childName, parentId: parentGroup.id },
    });
    assertResponseOk(childResponse, 'child group creation');

    // Create tokens in both groups
    const parentTokenResponse = await request.post('/tokens', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: {
        name: parentTokenName,
        groupId: parentGroup.id,
        defaultValue: '#000000',
      },
    });
    assertResponseOk(parentTokenResponse, 'parent token creation');

    const childGroup = await childResponse.json();
    const childTokenResponse = await request.post('/tokens', {
      headers: createAuthHeaders(authInfo.accessToken),
      data: {
        name: childTokenName,
        groupId: childGroup.id,
        defaultValue: '#000000',
      },
    });
    assertResponseOk(childTokenResponse, 'child token creation');

    // Delete parent group
    const deleteResponse = await request.delete(`/groups/${parentGroup.id}`, {
      headers: createAuthHeaders(authInfo.accessToken),
    });
    assertResponseOk(deleteResponse, 'group deletion');

    // Verify cascade deletion
    const deletedParent = await prisma.tokenGroup.findFirst({
      where: { name: parentName },
    });
    assertEntityDeleted(deletedParent, 'deleted parent group');

    const deletedChild = await prisma.tokenGroup.findFirst({
      where: { name: childName },
    });
    assertEntityDeleted(deletedChild, 'deleted child group');

    // Verify tokens are also deleted
    const deletedTokens = await prisma.token.findMany({
      where: { name: { in: [parentTokenName, childTokenName] } },
    });
    expect(deletedTokens.length, 'All tokens should be deleted').toBe(0);
  });
});
