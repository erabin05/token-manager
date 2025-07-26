import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a unique name with timestamp and random number
 */
export function generateUniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Factory for creating themes
 */
export class ThemeFactory {
  static async create(
    overrides: Partial<{ name: string; parentId: number }> = {}
  ) {
    const name = overrides.name || generateUniqueName('theme');

    return await prisma.theme.create({
      data: {
        name,
        parentId: overrides.parentId || null,
      },
    });
  }

  static async createMany(count: number, prefix: string = 'theme') {
    const themes = [];
    for (let i = 0; i < count; i++) {
      themes.push(
        await this.create({ name: generateUniqueName(`${prefix}-${i + 1}`) })
      );
    }
    return themes;
  }

  static async createWithParent(parentName?: string) {
    const parent = await this.create({
      name: parentName || generateUniqueName('parent-theme'),
    });
    const child = await this.create({
      name: generateUniqueName('child-theme'),
      parentId: parent.id,
    });
    return { parent, child };
  }
}

/**
 * Factory for creating tokens
 */
export class TokenFactory {
  static async create(
    overrides: Partial<{
      name: string;
      groupId: number | null;
    }> = {}
  ) {
    const name = overrides.name || generateUniqueName('token');

    return await prisma.token.create({
      data: {
        name,
        groupId: overrides.groupId || null,
      },
      include: { tokenValues: true },
    });
  }

  static async createMany(count: number, prefix: string = 'token') {
    const tokens = [];
    for (let i = 0; i < count; i++) {
      tokens.push(
        await this.create({
          name: generateUniqueName(`${prefix}-${i + 1}`),
        })
      );
    }
    return tokens;
  }
}

/**
 * Factory for creating groups
 */
export class GroupFactory {
  static async create(
    overrides: Partial<{
      name: string;
      parentId: number | null;
    }> = {}
  ) {
    const name = overrides.name || generateUniqueName('group');

    return await prisma.tokenGroup.create({
      data: {
        name,
        parentId: overrides.parentId || null,
      },
    });
  }

  static async createMany(count: number, prefix: string = 'group') {
    const groups = [];
    for (let i = 0; i < count; i++) {
      groups.push(
        await this.create({ name: generateUniqueName(`${prefix}-${i + 1}`) })
      );
    }
    return groups;
  }

  static async createWithChildren(parentName?: string, childCount: number = 1) {
    const parent = await this.create({
      name: parentName || generateUniqueName('parent-group'),
    });
    const children = [];

    for (let i = 0; i < childCount; i++) {
      children.push(
        await this.create({
          name: generateUniqueName(`child-group-${i + 1}`),
          parentId: parent.id,
        })
      );
    }

    return { parent, children };
  }
}

/**
 * Factory for creating users
 */
export class UserFactory {
  static async create(
    overrides: Partial<{
      email: string;
      name: string;
    }> = {}
  ) {
    const email = overrides.email || `${generateUniqueName('user')}@test.com`;
    const name = overrides.name || `User ${Date.now()}`;

    return await prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }

  static async createMany(count: number, prefix: string = 'user') {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(
        await this.create({
          email: `${generateUniqueName(`${prefix}-${i + 1}`)}@test.com`,
          name: `User ${i + 1}`,
        })
      );
    }
    return users;
  }
}

/**
 * Factory for creating test data with themes
 */
export class TestDataFactory {
  static async createThemesForTokens(themeCount: number = 2) {
    return await ThemeFactory.createMany(themeCount, 'test-theme');
  }

  static async createCompleteTestScenario() {
    // Create themes
    const themes = await ThemeFactory.createMany(2, 'scenario-theme');

    // Create groups
    const { parent: parentGroup, children: childGroups } =
      await GroupFactory.createWithChildren(
        generateUniqueName('scenario-parent-group'),
        2
      );

    // Create tokens
    const tokens = await TokenFactory.createMany(3, 'scenario-token');

    // Create users
    const users = await UserFactory.createMany(2, 'scenario-user');

    return {
      themes,
      groups: { parent: parentGroup, children: childGroups },
      tokens,
      users,
    };
  }
}
