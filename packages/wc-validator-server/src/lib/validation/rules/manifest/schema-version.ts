import {findNodeAtLocation} from 'jsonc-parser';
import {
  errorCodes,
  errorCodeMessages,
  type ValidationProblem,
} from '../../errors.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';
import semver from 'semver';

const {satisfies, lt} = semver;

/**
 * Validates that the custom elements manifest schemaVersion field is set to a
 * supported version.
 */
export const validateManifestSchemaVersion: ValidationRule = async function* ({
  customElementsManifestFileName,
  manifestTree,
}: ValidationRuleArgs) {
  if (
    customElementsManifestFileName === undefined ||
    manifestTree === undefined
  ) {
    return;
  }

  const schemaVersionNode = findNodeAtLocation(manifestTree, ['schemaVersion']);
  if (schemaVersionNode?.type !== 'string') {
    throw new Error('Not implemented: validate manifest against JSON schema');
  }
  const schemaVersion = schemaVersionNode.value;

  // TODO: read current version from custom-elements-manifest
  if (!satisfies(schemaVersion, '^2.1.0')) {
    if (lt(schemaVersion, '2.1.0')) {
      yield {
        filePath: customElementsManifestFileName,
        key: 'custom-elements-manifest',
        path: 'schemaVersion',
        code: errorCodes.outdated_schema_version,
        message: `${
          errorCodeMessages[errorCodes.outdated_schema_version]
        }: ${schemaVersion}`,
        start: schemaVersionNode.offset,
        length: schemaVersionNode.length,
        severity: 'warning',
      } satisfies ValidationProblem;
    } else {
      yield {
        filePath: customElementsManifestFileName,
        key: 'custom-elements-manifest',
        path: 'schemaVersion',
        code: errorCodes.invalid_schema_version,
        message: `${
          errorCodeMessages[errorCodes.invalid_schema_version]
        }: ${schemaVersion}`,
        start: schemaVersionNode.offset,
        length: schemaVersionNode.length,
        severity: 'error',
      } satisfies ValidationProblem;
    }
  }
};
