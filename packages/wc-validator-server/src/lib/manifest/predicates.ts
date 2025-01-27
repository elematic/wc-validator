import type {
  Declaration,
  ClassDeclaration,
  CustomElementDeclaration,
  FunctionDeclaration,
  CustomElement,
  CustomElementMixinDeclaration,
} from 'custom-elements-manifest/schema.js';

export const isVariableDeclaration = (
  d: Declaration,
): d is FunctionDeclaration => d.kind === 'variable';

export const isFunctionDeclaration = (
  d: Declaration,
): d is FunctionDeclaration => d.kind === 'function';

export const isClassDeclaration = (d: Declaration): d is ClassDeclaration =>
  d.kind === 'class';

export const isMixinDeclaration = (d: Declaration): d is FunctionDeclaration =>
  d.kind === 'mixin';

export const isCustomElement = (
  d: Declaration,
): d is CustomElementDeclaration | CustomElementMixinDeclaration =>
  (d as CustomElement).customElement === true;

export const isCustomElementDeclaration = (
  d: Declaration,
): d is CustomElementDeclaration => isClassDeclaration(d) && isCustomElement(d);

export const isCustomElementMixinDeclaration = (
  d: Declaration,
): d is CustomElementMixinDeclaration =>
  isMixinDeclaration(d) && isCustomElement(d);
