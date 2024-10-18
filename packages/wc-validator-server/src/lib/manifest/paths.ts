import type {Declaration, Package} from 'custom-elements-manifest';

/**
 * Returns the JSON path to a declaration in a package object.
 */
export const getDeclarationPath = (
  pkg: Package,
  decl: Declaration,
): string | void => {
  let modIndex = 0;
  for (const mod of pkg.modules) {
    if (!mod.declarations) {
      continue;
    }
    let declarationIndex = 0;
    for (const d of mod.declarations) {
      if (d === decl) {
        return `modules/${modIndex}/declarations/${declarationIndex}`;
      }
      declarationIndex++;
    }
    modIndex++;
  }
};
