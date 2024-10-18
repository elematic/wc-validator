import * as path from 'node:path';
import {errorCodes} from '../../errors.js';
import {findNodeAtPath} from '../../utils.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the custom elements manifest readme field points to a valid
 * file if it's set.
 */
export const validateManifestReadme: ValidationRule = async function* ({
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

  if (manifestData.readme !== undefined) {
    const {readme} = manifestData;
    const node = findNodeAtPath(manifestTree, 'readme');
    if (typeof readme !== 'string') {
      yield {
        filePath: customElementsManifestFileName,
        key: 'custom-elements-manifest',
        path: 'readme',
        code: errorCodes.invalid_property_type,
        message: `readme field should be a string`,
        start: node?.offset,
        length: node?.length,
        severity: 'warning',
      };
    }

    const manifestDir = path.dirname(customElementsManifestFileName);
    const readmePath = path.join(manifestDir, readme);

    try {
      await files.getFile(packageName, version, readmePath);
    } catch (e) {
      yield {
        filePath: customElementsManifestFileName,
        key: 'custom-elements-manifest',
        path: 'readme',
        code: errorCodes.file_not_found,
        message: `readme not found: ${readme}`,
        start: node!.offset,
        length: node!.length,
        severity: 'error',
      };
    }
  }
};
