import { A, pipe } from '@mobily/ts-belt';
import type { AnalysisResult, PackageJson, PackageName } from '@/domain/types';
import { getAllUsedPackages } from '@/parsers/import-parser';
import {
  extractAllDependencies,
  extractDependencies,
  extractProductionDependencies,
} from '@/parsers/package-parser';

function getDeclaredDependencies(
  packageJson: PackageJson,
  checkAll: boolean,
): ReadonlyArray<PackageName> {
  return checkAll
    ? extractAllDependencies(packageJson)
    : extractProductionDependencies(packageJson);
}

function createAnalysisResult(
  packageJson: PackageJson,
  usedPackages: ReadonlyArray<PackageName>,
  checkAll: boolean,
): AnalysisResult {
  const devDeps = extractDependencies(packageJson, 'devDependencies');
  const declaredDeps = getDeclaredDependencies(packageJson, checkAll);

  return {
    unused: findUnusedDependencies(declaredDeps, usedPackages),
    misplaced: findMisplacedDependencies(devDeps, usedPackages),
  };
}

export async function analyzeDependencies(
  packageJson: PackageJson,
  rootDir: string,
  checkAll: boolean,
): Promise<AnalysisResult> {
  const usedPackages = await getAllUsedPackages(rootDir);
  return createAnalysisResult(packageJson, usedPackages, checkAll);
}

function findUnusedDependencies(
  declared: ReadonlyArray<PackageName>,
  used: ReadonlyArray<PackageName>,
): ReadonlyArray<PackageName> {
  const usedSet = new Set(used);

  return pipe(
    declared,
    A.filter((dep) => !usedSet.has(dep)),
    A.sort((a, b) => a.localeCompare(b)),
  );
}

function findMisplacedDependencies(
  devDeps: ReadonlyArray<PackageName>,
  used: ReadonlyArray<PackageName>,
): ReadonlyArray<PackageName> {
  const usedSet = new Set(used);

  return pipe(
    devDeps,
    A.filter((dep) => usedSet.has(dep)),
    A.sort((a, b) => a.localeCompare(b)),
  );
}
