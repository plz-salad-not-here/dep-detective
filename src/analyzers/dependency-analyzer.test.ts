import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { O } from '@mobily/ts-belt';
import { analyzeDependencies } from '@/analyzers/dependency-analyzer';
import type { PackageJson } from '@/domain/types';

describe('dependency-analyzer', () => {
  const testDir = './test-analyze-deps';

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test('should find unused dependencies', async () => {
    await writeFile(`${testDir}/index.ts`, `import { pipe } from '@mobily/ts-belt';\nconsole.log(pipe);`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        '@mobily/ts-belt': '^3.0.0',
        'unused-package': '^1.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toContain('unused-package');
    expect(result.unused).not.toContain('@mobily/ts-belt');
    expect(result.unused.length).toBe(1);
    expect(Array.isArray(result.unused)).toBe(true);
    expect(Array.isArray(result.misplaced)).toBe(true);
  });

  test('should find misplaced dependencies in devDependencies', async () => {
    await writeFile(`${testDir}/index.ts`, `import express from 'express';\nconsole.log(express);`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.None,
      devDependencies: O.Some({
        express: '^4.0.0',
        typescript: '^5.0.0',
      }),
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.misplaced).toContain('express');
    expect(result.misplaced).not.toContain('typescript');
  });

  test('should not check devDependencies for unused by default', async () => {
    await writeFile(`${testDir}/index.ts`, `console.log('test');`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.None,
      devDependencies: O.Some({
        typescript: '^5.0.0',
        jest: '^29.0.0',
      }),
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toEqual([]);
  });

  test('should check devDependencies for unused when checkAll is true', async () => {
    await writeFile(`${testDir}/index.ts`, `console.log('test');`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.None,
      devDependencies: O.Some({
        typescript: '^5.0.0',
        jest: '^29.0.0',
      }),
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, true);

    expect(result.unused.length).toBe(2);
    expect(result.unused).toContain('typescript');
    expect(result.unused).toContain('jest');
  });

  test('should return empty arrays when no issues found', async () => {
    await writeFile(`${testDir}/index.ts`, `import { pipe } from '@mobily/ts-belt';\nconsole.log(pipe);`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        '@mobily/ts-belt': '^3.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toEqual([]);
    expect(result.misplaced).toEqual([]);
  });

  test('should handle multiple unused dependencies', async () => {
    await writeFile(`${testDir}/index.ts`, `console.log('no imports');`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        react: '^18.0.0',
        lodash: '^4.0.0',
        express: '^4.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toContain('react');
    expect(result.unused).toContain('lodash');
    expect(result.unused).toContain('express');
    expect(result.unused.length).toBe(3);
  });

  test('should handle multiple misplaced dependencies', async () => {
    await writeFile(`${testDir}/index.ts`, `import React from 'react';\nimport express from 'express';\nimport lodash from 'lodash';`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.None,
      devDependencies: O.Some({
        react: '^18.0.0',
        express: '^4.0.0',
        lodash: '^4.0.0',
        typescript: '^5.0.0',
      }),
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.misplaced).toContain('react');
    expect(result.misplaced).toContain('express');
    expect(result.misplaced).toContain('lodash');
    expect(result.misplaced).not.toContain('typescript');
    expect(result.misplaced.length).toBe(3);
  });

  test('should handle mixed dependencies and devDependencies', async () => {
    await writeFile(`${testDir}/index.ts`, `import React from 'react';`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        react: '^18.0.0',
        'unused-dep': '^1.0.0',
      }),
      devDependencies: O.Some({
        typescript: '^5.0.0',
        jest: '^29.0.0',
      }),
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toContain('unused-dep');
    expect(result.unused).not.toContain('react');
    expect(result.unused).not.toContain('typescript');
    expect(result.unused).not.toContain('jest');
  });

  test('should sort results alphabetically', async () => {
    await writeFile(`${testDir}/index.ts`, `console.log('test');`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        zulu: '^1.0.0',
        alpha: '^1.0.0',
        bravo: '^1.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused[0]).toBe('alpha');
    expect(result.unused[1]).toBe('bravo');
    expect(result.unused[2]).toBe('zulu');
  });

  test('should handle scoped packages', async () => {
    await writeFile(`${testDir}/index.ts`, `import { pipe } from '@mobily/ts-belt';`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        '@mobily/ts-belt': '^3.0.0',
        '@types/node': '^20.0.0',
        '@unused/package': '^1.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toContain('@types/node');
    expect(result.unused).toContain('@unused/package');
    expect(result.unused).not.toContain('@mobily/ts-belt');
  });

  test('should handle deep imports correctly', async () => {
    await writeFile(`${testDir}/index.ts`, `import map from 'lodash/map';`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        lodash: '^4.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toEqual([]);
    expect(result.misplaced).toEqual([]);
  });

  test('should handle relative imports correctly', async () => {
    await writeFile(`${testDir}/index.ts`, `import { utils } from './utils';\nimport { helper } from '../helper';`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        react: '^18.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toContain('react');
    expect(result.misplaced).toEqual([]);
  });

  test('should check all dependency types when checkAll is true', async () => {
    await writeFile(`${testDir}/index.ts`, `console.log('test');`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        react: '^18.0.0',
      }),
      devDependencies: O.Some({
        typescript: '^5.0.0',
      }),
      peerDependencies: O.Some({
        'react-dom': '^18.0.0',
      }),
    };

    const result = await analyzeDependencies(packageJson, testDir, true);

    expect(result.unused).toContain('react');
    expect(result.unused).toContain('typescript');
    expect(result.unused).toContain('react-dom');
    expect(result.unused.length).toBe(3);
  });

  test('should handle empty package.json', async () => {
    await writeFile(`${testDir}/index.ts`, `import React from 'react';`);

    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.None,
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toEqual([]);
    expect(result.misplaced).toEqual([]);
  });

  test('should handle directory with no source files', async () => {
    const packageJson: PackageJson = {
      name: O.Some('test'),
      version: O.Some('1.0.0'),
      dependencies: O.Some({
        react: '^18.0.0',
      }),
      devDependencies: O.None,
      peerDependencies: O.None,
    };

    const result = await analyzeDependencies(packageJson, testDir, false);

    expect(result.unused).toContain('react');
  });
});
