import {findNodeAtLocation} from 'jsonc-parser';
import {errorCodes, type ValidationProblem} from '../../errors.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the package.json exports field is set to a valid value.
 */
export const validatePackageJsonExports: ValidationRule = async function* ({
  packageJsonTree,
}: ValidationRuleArgs) {
  const exportsNode = findNodeAtLocation(packageJsonTree, ['exports']);

  if (exportsNode?.type !== 'object') {
    yield {
      filePath: 'package.json',
      path: 'exports',
      code: errorCodes.invalid_package_type,
      message: `exports field should be present`,
      start: exportsNode?.offset,
      length: exportsNode?.length,
      severity: 'warning',
    } as ValidationProblem;
  }

  // TODO: Validate the exports field against a schema?
};
