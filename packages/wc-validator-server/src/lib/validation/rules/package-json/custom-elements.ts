import {findNodeAtLocation} from 'jsonc-parser';
import {errorCodeMessages, errorCodes} from '../../errors.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the package.json customElements field is set and points to a
 * valid file.
 */
export const validatePackageJsonCustomElements: ValidationRule =
  async function* ({
    packageName,
    version,
    packageJsonTree,
    files,
  }: ValidationRuleArgs) {
    // Get manifest file name
    let customElementsManifestFileName: string | undefined = undefined;
    const customElementsManifestNode = findNodeAtLocation(packageJsonTree, [
      'customElements',
    ]);
    if (customElementsManifestNode?.type === 'string') {
      customElementsManifestFileName = customElementsManifestNode.value;
    }
    if (
      customElementsManifestNode === undefined ||
      customElementsManifestFileName === undefined
    ) {
      yield {
        filePath: 'package.json',
        path: 'customElements',
        code: errorCodes.customElements_field_missing,
        message: errorCodeMessages[errorCodes.customElements_field_missing],
        start: 0,
        length: 0,
        severity: 'error',
      };
      return;
    }

    // Check that the custom elements manifest exists
    try {
      await files.getFile(packageName, version, customElementsManifestFileName);
    } catch (e) {
      yield {
        filePath: 'package.json',
        path: 'customElements',
        code: errorCodes.custom_elements_manifest_not_found,
        message: `Custom elements manifest not found: ${customElementsManifestFileName}`,
        start: customElementsManifestNode.offset,
        length: customElementsManifestNode.length,
        severity: 'error',
      };
    }
  };
