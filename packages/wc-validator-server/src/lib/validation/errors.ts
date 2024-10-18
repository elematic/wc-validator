export const errorCodeMessages = {
  '1001': 'JSON parse error',
  '1002': 'JSON schema validation error',
  '2001': 'customElements field missing',
  '2002': 'Invalid package type',
  '2003': 'Invalid package keywords',
  '2004': 'Package keywords missing "web components"',
  '3002': 'Custom elements manifest not found',
  '3003': 'Unsupported custom elements manifest schema version',
  '3004': 'Outdated custom elements manifest schema version',
  '3005': 'Deprecated manifest',
  '4001': 'Invalid property type',
  '4002': 'File not found',
  '4003': 'Invalid reference',
  '4004': 'Invalid type',
  '5001': 'Custom element tag name not exported',
} as const;

export type ErrorCode = keyof typeof errorCodeMessages;

export const errorCodes = {
  JSON_parse_error: '1001',
  JSON_schema_validation_error: '1002',
  customElements_field_missing: '2001',
  invalid_package_type: '2002',
  invalid_keywords: '2003',
  custom_elements_manifest_not_found: '3002',
  invalid_schema_version: '3003',
  outdated_schema_version: '3004',
  deprecated_manifest: '3005',
  invalid_property_type: '4001',
  file_not_found: '4002',
  invalid_reference: '4003',
  invalid_type: '4004',
  non_exported_tag_name: '5001',
} as const;

export interface ValidationProblem {
  filePath: string;

  /**
   * Used to filter problems by a key, instead of a path, e.g.
   * 'custom-elements-manifest'. This is useful if a file doesn't have a
   * canonical path, but you still want to filter by that file.
   */
  key?: string;
  path: string | undefined;
  code: ErrorCode;
  message: string;
  severity: 'error' | 'warning';
  start: number | undefined;
  length: number | undefined;
}
