import {errorCodes} from '../../errors.js';
import {findNodeAtPath} from '../../utils.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the custom elements manifest deprecated field is not set.
 */
export const validateManifestDeprecated: ValidationRule = async function* ({
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

  if (manifestData.deprecated) {
    const node = findNodeAtPath(manifestTree, 'deprecated');
    yield {
      filePath: customElementsManifestFileName,
      key: 'custom-elements-manifest',
      path: 'deprecated',
      code: errorCodes.deprecated_manifest,
      message: `Deprecated manifest: ${manifestData.deprecated}`,
      start: node?.offset,
      length: node?.length,
      severity: 'warning',
    };
  }
};
