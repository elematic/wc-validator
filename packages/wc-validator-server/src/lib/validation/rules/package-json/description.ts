import {findNodeAtLocation} from 'jsonc-parser';
import {errorCodes, type ValidationProblem} from '../../errors.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the package.json description field is a non-empty string.
 */
export const validatePackageJsonDescription: ValidationRule = async function* ({
  packageJsonTree,
}: ValidationRuleArgs) {
  const descriptionNode = findNodeAtLocation(packageJsonTree, ['description']);

  if (descriptionNode?.type !== 'string' || descriptionNode?.value === '') {
    yield {
      filePath: 'package.json',
      path: 'description',
      code: errorCodes.invalid_package_type,
      message: `Description field should be a non-empty string`,
      start: descriptionNode?.offset,
      length: descriptionNode?.length,
      severity: 'warning',
    } satisfies ValidationProblem;
  }
};
