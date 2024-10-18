import {findNodeAtLocation} from 'jsonc-parser';
import {errorCodes} from '../../errors.js';
import type {ValidationRule} from '../../validation-rule.js';

/**
 * Validates that the package.json keywords field includes "web components".
 */
export const validatePackageKeywords: ValidationRule = async function* ({
  packageJsonTree,
  packageJson,
}) {
  const keywordsNode = findNodeAtLocation(packageJsonTree, ['keywords']);

  // Validate the main field
  if (keywordsNode?.type !== 'array') {
    yield {
      filePath: 'package.json',
      path: 'keywords',
      code: errorCodes.invalid_keywords,
      message: `keywords field should be set and include "web components"`,
      start: keywordsNode?.offset,
      length: keywordsNode?.length,
      severity: 'warning',
    };
    return;
  }

  // Check that the module exists
  const keywords = packageJson.keywords!;

  if (!keywords.includes('web components')) {
    yield {
      filePath: 'package.json',
      path: 'keywords',
      code: errorCodes.invalid_package_type,
      message: `keywords is missing "web components": ${keywords}`,
      start: keywordsNode!.offset,
      length: keywordsNode!.length,
      severity: 'error',
    };
  }
};
