import {findNodeAtLocation} from 'jsonc-parser';
import {errorCodes, type ValidationProblem} from '../../errors.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the package.json main field is set and points to a valid
 * module.
 */
export const validatePackageJsonMain: ValidationRule = async function* ({
  packageName,
  version,
  packageJsonTree,
  files,
}: ValidationRuleArgs) {
  const mainNode = findNodeAtLocation(packageJsonTree, ['main']);

  // Validate the main field
  if (mainNode?.type !== 'string') {
    yield {
      filePath: 'package.json',
      path: 'main',
      code: errorCodes.invalid_package_type,
      message: `main field should be set`,
      start: mainNode?.offset,
      length: mainNode?.length,
      severity: 'warning',
    } satisfies ValidationProblem;
  }

  // Check that the module exists
  const mainModule = mainNode?.value;
  if (mainModule !== undefined) {
    try {
      await files.getFile(packageName, version, mainModule);
    } catch (e) {
      console.error(e);
      yield {
        filePath: 'package.json',
        path: 'main',
        code: errorCodes.invalid_package_type,
        message: `main module not found: ${mainModule}`,
        start: mainNode!.offset,
        length: mainNode!.length,
        severity: 'error',
      } satisfies ValidationProblem;
    }
  }
};
