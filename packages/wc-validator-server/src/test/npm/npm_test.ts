import {describe as suite, test} from 'node:test';
import assert from 'node:assert';
import {parseSpecifier, type NpmFileReference} from '../../lib/npm/npm.js';

suite('parseSpecifier', () => {
  const cases: Array<{
    specifier: string;
    expected: NpmFileReference | undefined;
  }> = [
    {
      specifier: 'foo',
      expected: {pkg: 'foo', version: undefined, path: ''},
    },
    {
      specifier: 'foo@^1.2.3',
      expected: {pkg: 'foo', version: '^1.2.3', path: ''},
    },
    {
      specifier: 'foo/bar.js',
      expected: {pkg: 'foo', version: undefined, path: 'bar.js'},
    },
    {
      specifier: 'foo@^1.2.3/bar.js',
      expected: {pkg: 'foo', version: '^1.2.3', path: 'bar.js'},
    },
    {
      specifier: '@ns/foo',
      expected: {pkg: '@ns/foo', version: undefined, path: ''},
    },
    {
      specifier: '@ns/foo@^1.2.3',
      expected: {pkg: '@ns/foo', version: '^1.2.3', path: ''},
    },
    {
      specifier: '@ns/foo/bar.js',
      expected: {pkg: '@ns/foo', version: undefined, path: 'bar.js'},
    },
    {
      specifier: '@ns/foo@^1.2.3/bar.js',
      expected: {pkg: '@ns/foo', version: '^1.2.3', path: 'bar.js'},
    },
    {
      specifier: '',
      expected: undefined,
    },
  ];

  for (const {specifier, expected} of cases) {
    test(specifier, () => {
      const actual = parseSpecifier(specifier);
      assert.deepEqual(actual, expected);
    });
  }
});
