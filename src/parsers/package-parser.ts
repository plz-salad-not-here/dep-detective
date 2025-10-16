import { A, D, O, pipe, R } from '@mobily/ts-belt';
import type { AppResult, DependencyType, PackageJson, PackageName } from '../domain/types.js';

export async function readPackageJson(path: string): Promise<AppResult<PackageJson>> {
  try {
    const file = Bun.file(path);
    const content = await file.json();

    return R.Ok({
      name: O.fromNullable(content.name),
      version: O.fromNullable(content.version),
      dependencies: O.fromNullable(content.dependencies),
      devDependencies: O.fromNullable(content.devDependencies),
      peerDependencies: O.fromNullable(content.peerDependencies),
    });
  } catch (error) {
    return R.Error(`Failed to read package.json: ${error}`);
  }
}

export function extractDependencies(
  packageJson: PackageJson,
  type: DependencyType,
): ReadonlyArray<PackageName> {
  return O.mapWithDefault(packageJson[type], [], (deps) => D.keys(deps));
}

function getDependencyKeys(
  packageJson: PackageJson,
  type: DependencyType,
): ReadonlyArray<PackageName> {
  return O.mapWithDefault(packageJson[type], [], (deps) => D.keys(deps));
}

function mergeDependencyKeys(
  packageJson: PackageJson,
  types: ReadonlyArray<DependencyType>,
): ReadonlyArray<PackageName> {
  return pipe(
    types,
    A.map((type) => getDependencyKeys(packageJson, type)),
    A.flat,
    A.uniq,
  );
}

export function extractAllDependencies(packageJson: PackageJson): ReadonlyArray<PackageName> {
  return mergeDependencyKeys(packageJson, ['dependencies', 'devDependencies', 'peerDependencies']);
}

export function extractProductionDependencies(
  packageJson: PackageJson,
): ReadonlyArray<PackageName> {
  return mergeDependencyKeys(packageJson, ['dependencies']);
}
