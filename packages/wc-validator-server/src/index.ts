import {CdnPackageService} from './lib/npm/cdn-package-service.js';
import {LocalPackageService} from './lib/npm/local-package-service.js';
import {makeApp} from './lib/server/server.js';
import {parseArgs} from 'node:util';

const {
  values: {dev},
} = parseArgs({options: {dev: {type: 'boolean', short: 'd'}}});

const files = dev
  ? new LocalPackageService()
  : new CdnPackageService('https://cdn.jsdelivr.net/npm/');

makeApp(files);
