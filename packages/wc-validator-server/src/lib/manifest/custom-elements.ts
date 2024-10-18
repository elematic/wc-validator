import type {
  CustomElementDeclaration,
  CustomElementExport,
  JavaScriptExport,
  Module,
  Package,
  Reference,
} from 'custom-elements-manifest/schema.js';
import {getDeclarationPath} from './paths.js';
import {isCustomElementDeclaration} from './predicates.js';
import {resolveReference} from './references.js';

export type CustomElementExportInfo = {
  package: Package;
  module: Module;
  exportPath: string;
  customElementExport: CustomElementExport;
  jsExports: Array<JavaScriptExport>;
  declaration: CustomElementDeclaration;
  declarationPath: string;
  declarationReference: Reference;
};

/**
 * Gets all the custom element exports of a package.
 */
export const getCustomElementExports = (
  pkg: Package,
  packageName: string,
  packageVersion: string,
  logger?: Console,
): Array<CustomElementExportInfo> => {
  const customElements = new Map<
    CustomElementDeclaration,
    CustomElementExportInfo
  >();

  let modIndex = 0;
  for (const mod of pkg.modules) {
    if (mod.exports) {
      let exportIndex = 0;
      for (const e of mod.exports) {
        if (e.kind === 'custom-element-definition') {
          logger?.log(
            `Found custom element <${e.name}> (${e.declaration.name})`,
          );
          // TODO (justinfagnani): for large manifests we want to index ahead
          // of time to avoid polynomial lookups
          const decl = resolveReference(
            pkg,
            mod,
            e.declaration,
            packageName,
            packageVersion,
          );
          if (decl !== undefined && isCustomElementDeclaration(decl)) {
            const exportPath = `modules/${modIndex}/exports/${exportIndex}`;
            const declarationPath = getDeclarationPath(pkg, decl)!;
            customElements.set(decl, {
              package: pkg,
              module: mod,
              exportPath,
              customElementExport: e,
              jsExports: [],
              declaration: decl,
              declarationPath,
              declarationReference: e.declaration,
            });
          } else {
            // This is some kind of manifest error, should we warn?
            // Or assume it was handled in a validation pass?
          }
        } else if (e.kind === 'js') {
          const decl = resolveReference(
            pkg,
            mod,
            e.declaration,
            packageName,
            packageVersion,
          );
          if (decl !== undefined && isCustomElementDeclaration(decl)) {
            let info = customElements.get(decl);
            info?.jsExports.push(e);
          }
        }
        exportIndex++;
      }
      modIndex++;
    }
  }
  return [...customElements.values()];
};

export type CustomElementDeclarationInfo = {
  package: Package;
  module: Module;
  declaration: CustomElementDeclaration;
  declarationPath: string;
};

/**
 * Gets all the custom element declarations of a package
 */
export const getCustomElementDeclarations = (
  pkg: Package,
): Array<CustomElementDeclarationInfo> => {
  const customElements: Array<CustomElementDeclarationInfo> = [];

  let modIndex = 0;
  for (const mod of pkg.modules) {
    if (mod.declarations) {
      let declIndex = 0;
      for (const decl of mod.declarations) {
        if (decl.kind === 'class' && isCustomElementDeclaration(decl)) {
          customElements.push({
            package: pkg,
            module: mod,
            declaration: decl,
            declarationPath: `modules/${modIndex}/declarations/${declIndex}`,
          });
        }
        declIndex++;
      }
      modIndex++;
    }
  }
  return [...customElements.values()];
};
