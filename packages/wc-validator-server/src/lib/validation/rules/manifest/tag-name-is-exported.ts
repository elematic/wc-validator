import {
  getCustomElementDeclarations,
  getCustomElementExports,
} from '../../../manifest/custom-elements.js';
import {errorCodes} from '../../errors.js';
import {findNodeAtPath} from '../../utils.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that a custom elements tag name matches at least one of the
 * custom element export names.
 */
export const validateTagNameIsExported: ValidationRule = async function* ({
  packageName,
  version,
  customElementsManifestFileName,
  manifestTree,
  manifestData,
}: ValidationRuleArgs) {
  if (
    customElementsManifestFileName === undefined ||
    manifestTree === undefined ||
    manifestData === undefined
  ) {
    return;
  }

  const customElementExports = getCustomElementExports(
    manifestData,
    packageName,
    version,
  );

  const customElementDeclarations = getCustomElementDeclarations(manifestData);

  for (const info of customElementDeclarations) {
    if (!info.declaration.tagName) {
      continue;
    }
    const exports = customElementExports.filter(
      (exp) => exp.customElementExport?.name === info.declaration.tagName,
    );

    if (exports.length === 0) {
      const node = findNodeAtPath(manifestTree, info.declarationPath);
      yield {
        filePath: customElementsManifestFileName,
        key: 'custom-elements-manifest',
        path: info.declarationPath,
        code: errorCodes.non_exported_tag_name,
        message: `Custom element declaration tagName not exported: ${info.declaration.tagName}`,
        start: node?.offset,
        length: node?.length,
        severity: 'error',
      };
    }
  }
};
