import * as path from 'node:path';
import {errorCodes} from '../../errors.js';
import {findNodeAtPath} from '../../utils.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the modules in the custom elements manifest exist.
 */
export const validateManifestModuleExists: ValidationRule = async function* ({
  packageName,
  version,
  customElementsManifestFileName,
  manifestTree,
  manifestData,
  files,
}: ValidationRuleArgs) {
  if (
    customElementsManifestFileName === undefined ||
    manifestTree === undefined ||
    manifestData === undefined
  ) {
    return;
  }

  const manifestDir = path.dirname(customElementsManifestFileName);

  for (let modIndex = 0; modIndex < manifestData.modules.length; modIndex++) {
    const mod = manifestData.modules[modIndex];
    const modPath = path.join(manifestDir, mod.path);
    try {
      await files.getFile(packageName, version, modPath);
    } catch (e) {
      const node = findNodeAtPath(manifestTree, `modules/${modIndex}/path`);
      yield {
        filePath: customElementsManifestFileName,
        key: 'custom-elements-manifest',
        path: `modules/${modIndex}/path`,
        code: errorCodes.file_not_found,
        message: `Module not found: ${mod.path}`,
        start: node?.offset,
        length: node?.length,
        severity: 'error',
      };
    }
  }
};
