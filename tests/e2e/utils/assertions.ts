import { expect } from '@playwright/test';

/**
 * Assert that an API response is successful
 */
export function assertResponseOk(response: any, context?: string) {
  const message = context
    ? `Response failed for ${context}`
    : 'Response failed';
  expect(response.ok(), message).toBeTruthy();
}

/**
 * Assert that an entity exists in the database
 */
export function assertEntityExists(entity: any, entityName: string) {
  expect(entity, `${entityName} should exist`).toBeTruthy();
}

/**
 * Assert that an entity does not exist in the database
 */
export function assertEntityDeleted(entity: any, entityName: string) {
  expect(entity, `${entityName} should be deleted`).toBeNull();
}

/**
 * Assert that an entity has the expected name
 */
export function assertEntityName(
  entity: any,
  expectedName: string,
  entityType: string
) {
  expect(entity.name, `${entityType} name should match`).toBe(expectedName);
}

/**
 * Assert that a collection contains an entity with the given name
 */
export function assertCollectionContains(
  collection: any[],
  entityName: string,
  collectionType: string
) {
  const hasEntity = collection.some((item: any) => item.name === entityName);
  expect(hasEntity, `${collectionType} should contain ${entityName}`).toBe(
    true
  );
}

/**
 * Assert that a token has the expected value
 */
export function assertTokenValue(tokenValue: any, expectedValue: string) {
  expect(tokenValue.value, 'Token value should match').toBe(expectedValue);
}

/**
 * Assert that a token has values for specific themes
 */
export function assertTokenHasValuesForThemes(
  tokenValues: any[],
  tokenName: string,
  themeNames: string[]
) {
  themeNames.forEach(themeName => {
    const hasValue = tokenValues.some(tv => tv.theme.name === themeName);
    expect(
      hasValue,
      `Token ${tokenName} should have value for theme ${themeName}`
    ).toBe(true);
  });
}
