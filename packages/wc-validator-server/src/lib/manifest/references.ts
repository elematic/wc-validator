import type {
  Declaration,
  Module,
  Package,
  Reference,
} from 'custom-elements-manifest/schema.js';
import {getModule, normalizeModulePath} from './modules.js';

/**
 * Resolves Reference to a Declaration.
 *
 * Resolving a reference requires the package and module that the reference is
 * in, as well as the reference itself. The reference may be to a declaration in
 * the same module, or to an export of another module. Only references pointing
 * to within the local package are supported.
 *
 * Same-module references are resolved by looking up the declaration in the
 * module's declarations array. Cross-module references are resolved by looking
 * up the export in the target module's exports array, then recursively
 * resolving the declaration that the export points to.
 */
export const resolveReference = (
  pkg: Package,
  fromModule: Module,
  ref: Reference,
  fromPackageName: string,
  fromPackageVersion: string,
  visited = new Set<Reference>(),
): Declaration | undefined => {
  // Warn and bail if the reference is to a different package.
  if (ref.package !== undefined && ref.package !== fromPackageName) {
    console.warn(
      `Cross-package reference are not supported.\n` +
        `Trying to resolve ${JSON.stringify(ref)} from package ${fromPackageName}`,
    );
    return undefined;
  }

  if (
    ref.module === undefined ||
    normalizeModulePath(ref.module) === normalizeModulePath(fromModule.path)
  ) {
    // Same-module references refer to declarations in the local module scope.
    return fromModule.declarations?.find((d) => d.name === ref.name);
  }

  // Cross-module references refer to an export of another module.
  const mod = getModule(pkg, ref.module);
  if (mod === undefined) {
    return undefined;
  }
  const exprt = mod.exports?.find((e) => e.name === ref.name);
  if (exprt === undefined) {
    return undefined;
  }

  // Now that we have the export, we need to resolve the declaration that it
  // points to.

  const declaration = exprt.declaration;

  // Protect against infinite recursion:
  visited.add(ref);
  if (visited.has(declaration)) {
    // TODO (justinfagnani): print the path to the cycle?
    throw new Error(`Detected reference cycle: ${JSON.stringify(declaration)}`);
  }

  // Recursively resolve the declaration reference.
  return resolveReference(
    pkg,
    mod,
    declaration,
    fromPackageName,
    fromPackageVersion,
    visited,
  );
};
