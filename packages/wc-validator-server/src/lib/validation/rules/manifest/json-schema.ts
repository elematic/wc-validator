import {Ajv} from 'ajv';
import schema from 'custom-elements-manifest/schema.json' with {type: 'json'};
import {errorCodes} from '../../errors.js';
import {findNodeAtPath} from '../../utils.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';

const ajv = new Ajv({
  allowUnionTypes: true,
});

const validateJson = ajv.compile(schema);

/**
 * Validates that the custom elements manifest is valid against the JSON schema.
 */
export const validateManifestJsonSchema: ValidationRule = async function* ({
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

  // Validate against JSON schema
  const validJson = validateJson(manifestData);
  if (!validJson) {
    // console.error(validateJson.errors);
    for (const error of validateJson.errors!) {
      const node = findNodeAtPath(manifestTree, error.instancePath);
      yield {
        filePath: customElementsManifestFileName,
        key: 'custom-elements-manifest',
        path: undefined,
        code: errorCodes.JSON_schema_validation_error,
        message: `JSON schema validation error: ${error.message}`,
        start: node?.offset,
        length: node?.length,
        severity: 'error',
      };
    }
  }
};
