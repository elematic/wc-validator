import {findNodeAtLocation} from 'jsonc-parser';
import {errorCodes, type ValidationProblem} from '../../errors.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

/**
 * Validates that the package.json type field is set to "module".
 */
export const validatePackageJsonType: ValidationRule = async function* ({
  packageJsonTree,
}: ValidationRuleArgs) {
  const typeNode = findNodeAtLocation(packageJsonTree, ['type']);

  if (typeNode?.type !== 'string' || typeNode?.value !== 'module') {
    yield {
      filePath: 'package.json',
      path: 'type',
      code: errorCodes.invalid_package_type,
      message: `Package type should be "module"`,
      start: typeNode?.offset,
      length: typeNode?.length,
      severity: 'error',
    } satisfies ValidationProblem;
  }
};
