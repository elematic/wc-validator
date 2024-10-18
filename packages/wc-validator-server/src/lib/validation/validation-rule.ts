import type {Package} from 'custom-elements-manifest/schema.js';
import type {Node} from 'jsonc-parser';
import type {Version} from '../npm/npm.js';
import type {PackageService} from '../npm/package-service.js';
import type {ValidationProblem} from './errors.js';

export interface ValidationRuleArgs {
  packageName: string;
  version: string;
  packageJsonTree: Node;
  packageJson: Version;
  customElementsManifestFileName: string | undefined;
  manifestTree: Node | undefined;
  manifestData: Package | undefined;
  files: PackageService;
}

export type ValidationRule = (
  args: ValidationRuleArgs,
) => AsyncGenerator<ValidationProblem>;
