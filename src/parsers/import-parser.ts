import { A, O, pipe, S } from '@mobily/ts-belt';
import type { Option } from '@mobily/ts-belt/dist/types/Option';
import { Glob } from 'bun';
import { match, P } from 'ts-pattern';
import type { FilePath, ImportStatement, PackageName } from '../domain/types.js';

const IMPORT_REGEX = /(?:import|from)\s+['"]([^'"]+)['"]|require\s*\(['"]([^'"]+)['"]\)/g;

const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/test/**',
  '**/tests/**',
];

function shouldExcludeFile(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filePath);
  });
}

async function scanPattern(pattern: string): Promise<ReadonlyArray<FilePath>> {
  const glob = new Glob(pattern);
  const files: FilePath[] = [];

  for await (const file of glob.scan('.')) {
    if (!shouldExcludeFile(file)) {
      files.push(file);
    }
  }

  return files;
}

function getSourcePatterns(rootDir: string): ReadonlyArray<string> {
  return [`${rootDir}/**/*.ts`, `${rootDir}/**/*.tsx`, `${rootDir}/**/*.js`, `${rootDir}/**/*.jsx`];
}

export async function findSourceFiles(rootDir: string): Promise<ReadonlyArray<FilePath>> {
  const patterns = getSourcePatterns(rootDir);
  const fileGroups = await Promise.all(A.map(patterns, scanPattern));
  return A.flat(fileGroups);
}

function extractImportsFromContent(content: string): ReadonlyArray<ImportStatement> {
  const imports: ImportStatement[] = [];
  let regexMatch: RegExpExecArray | null = IMPORT_REGEX.exec(content);

  while (regexMatch !== null) {
    const importPath = regexMatch[1] ?? regexMatch[2];
    if (importPath) {
      imports.push(importPath);
    }
    regexMatch = IMPORT_REGEX.exec(content);
  }

  return imports;
}

export async function extractImportsFromFile(
  filePath: FilePath,
): Promise<ReadonlyArray<ImportStatement>> {
  try {
    const file = Bun.file(filePath);
    const content = await file.text();
    return extractImportsFromContent(content);
  } catch {
    return [];
  }
}

export function extractPackageName(importPath: ImportStatement): Option<PackageName> {
  return match(importPath)
    .with(P.string.startsWith('.'), () => O.None)
    .with(P.string.startsWith('/'), () => O.None)
    .with(P.string.startsWith('@'), () => {
      const parts = S.split(importPath, '/');
      return parts.length >= 2 ? O.Some(`${parts[0]}/${parts[1]}`) : O.None;
    })
    .otherwise(() => {
      const parts = S.split(importPath, '/');
      return O.fromNullable(parts[0]);
    });
}

function extractPackageNames(imports: ReadonlyArray<ImportStatement>): ReadonlyArray<PackageName> {
  return pipe(
    imports,
    A.map(extractPackageName),
    A.map(O.toNullable),
    A.filter((name): name is PackageName => name !== null),
  );
}

function collectUniquePackages(
  allImports: ReadonlyArray<ReadonlyArray<ImportStatement>>,
): ReadonlyArray<PackageName> {
  return pipe(allImports, A.map(extractPackageNames), A.flat, A.uniq);
}

export async function getAllUsedPackages(rootDir: string): Promise<ReadonlyArray<PackageName>> {
  const files = await findSourceFiles(rootDir);
  const allImports = await Promise.all(A.map(files, extractImportsFromFile));
  return collectUniquePackages(allImports);
}
