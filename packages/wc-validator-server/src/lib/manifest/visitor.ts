import type {
  Attribute,
  ClassDeclaration,
  ClassField,
  ClassMember,
  ClassMethod,
  CssCustomProperty,
  CssCustomState,
  CssPart,
  CustomElementDeclaration,
  CustomElementExport,
  CustomElementMixinDeclaration,
  Declaration,
  Demo,
  Event,
  Export,
  FunctionDeclaration,
  JavaScriptExport,
  MixinDeclaration,
  Module,
  Package,
  Parameter,
  Reference,
  Slot,
  SourceReference,
  Type,
  TypeReference,
  VariableDeclaration,
} from 'custom-elements-manifest/schema.js';
import {
  isCustomElementDeclaration,
  isCustomElementMixinDeclaration,
} from './predicates.js';

/**
 * A visitor for the custom elements manifest.
 */
export interface CustomElementsManifestVisitor {
  visitPackage?(pkg: Package): boolean | void;

  // Modules
  visitModule?(mod: Module, path: string): boolean | void;
  visitExport?(exp: Export, path: string): boolean | void;
  visitJavaScriptExport?(exp: JavaScriptExport, path: string): boolean | void;
  visitCustomElementExport?(
    exp: CustomElementExport,
    path: string,
  ): boolean | void;

  // Declarations
  visitDeclaration?(decl: Declaration): boolean | void;
  visitClass?(decl: ClassDeclaration): boolean | void;
  visitCustomElement?(decl: CustomElementDeclaration): boolean | void;
  visitFunction?(decl: FunctionDeclaration): boolean | void;
  visitMixin?(decl: MixinDeclaration): boolean | void;
  visitCustomElementMixin?(decl: CustomElementMixinDeclaration): boolean | void;
  visitVariable?(decl: VariableDeclaration): boolean | void;

  // References and types
  visitReference?(ref: Reference, path: string): boolean | void;
  visitSourceReference?(ref: SourceReference, path: string): boolean | void;
  visitType?(type: Type, path: string): boolean | void;
  visitTypeReference?(type: TypeReference, path: string): boolean | void;

  // Classes
  visitClassMember?(member: ClassMember): boolean | void;
  visitClassField?(field: ClassField): boolean | void;
  visitClassMethod?(method: ClassMethod): boolean | void;

  // Functions
  visitParameter?(param: Parameter): boolean | void;

  // Custom elements
  visitAttribute?(attr: Attribute): boolean | void;
  visitEvent?(event: Event): boolean | void;
  visitSlot?(slot: Slot): boolean | void;
  visitCssPart?(part: CssPart): boolean | void;
  visitCssCustomProperty?(prop: CssCustomProperty): boolean | void;
  visitCssCustomState?(state: CssCustomState): boolean | void;
  visitDemo?(demo: Demo): boolean | void;
}

export const visitPackage = (
  visitor: CustomElementsManifestVisitor,
  pkg: Package,
): void => {
  if (visitor.visitPackage?.(pkg) === false) {
    return;
  }
  pkg.modules.forEach((mod, i) => visitModule(visitor, mod, `modules/${i}`));
};

export const visitModule = (
  visitor: CustomElementsManifestVisitor,
  mod: Module,
  path: string,
): void => {
  if (visitor.visitModule?.(mod, path) === false) {
    return;
  }
  mod.exports?.forEach((exp, i) =>
    visitExport(visitor, exp, path + `/exports/${i}`),
  );
  mod.declarations?.forEach((decl, i) =>
    visitDeclaration(visitor, decl, path + `/declarations/${i}`),
  );
};

export const visitExport = (
  visitor: CustomElementsManifestVisitor,
  exp: Export,
  path: string,
): void => {
  if (visitor.visitExport?.(exp, path) === false) {
    return;
  }
  switch (exp.kind) {
    case 'js':
      if (visitJavaScriptExport(visitor, exp, path) === false) {
        return;
      }
      break;
    case 'custom-element-definition':
      if (visitCustomElementExport(visitor, exp, path) === false) {
        return;
      }
      break;
    default:
      // exhaustiveness check
      exp as void;
  }

  if (exp.declaration) {
    visitor.visitReference?.(exp.declaration, path + '/declaration');
  }
};

export const visitJavaScriptExport = (
  visitor: CustomElementsManifestVisitor,
  exp: JavaScriptExport,
  path: string,
): boolean | void => {
  return visitor.visitJavaScriptExport?.(exp, path);
};

export const visitCustomElementExport = (
  visitor: CustomElementsManifestVisitor,
  exp: CustomElementExport,
  path: string,
): boolean | void => {
  return visitor.visitCustomElementExport?.(exp, path);
};

export const visitType = (
  visitor: CustomElementsManifestVisitor,
  type: Type,
  path: string,
): void => {
  if (visitor.visitType?.(type, path) === false) {
    return;
  }
  type.references?.forEach((ref, i) =>
    visitTypeReference(visitor, ref, path + `/references/${i}`),
  );
  if (type.source) {
    visitor.visitSourceReference?.(type.source, path + '/source');
  }
};

export const visitTypeReference = (
  visitor: CustomElementsManifestVisitor,
  type: TypeReference,
  path: string,
): void => {
  if (visitor.visitTypeReference?.(type, path) === false) {
    return;
  }
  visitor.visitReference?.(type, path);
};

export const visitDeclaration = (
  visitor: CustomElementsManifestVisitor,
  decl: Declaration,
  path: string,
): void => {
  if (visitor.visitDeclaration?.(decl) === false) {
    return;
  }
  switch (decl.kind) {
    case 'class':
      visitClass(visitor, decl, path);
      break;
    case 'function':
      visitFunction(visitor, decl, path);
      break;
    case 'mixin':
      visitMixin(visitor, decl, path);
      break;
    case 'variable':
      visitVariable(visitor, decl, path);
      break;
    default:
      // exhaustiveness check
      decl as void;
  }
};

export const visitClass = (
  visitor: CustomElementsManifestVisitor,
  decl: ClassDeclaration,
  path: string,
): void => {
  if (visitor.visitClass?.(decl) === false) {
    return;
  }
  if (
    isCustomElementDeclaration(decl) &&
    visitCustomElement(visitor, decl as CustomElementDeclaration, path) ===
      false
  ) {
    return;
  }
  if (decl.superclass) {
    visitor.visitReference?.(decl.superclass, path + '/superclass');
  }
  decl.mixins?.forEach((mixin, i) =>
    visitor.visitReference?.(mixin, path + `/mixins/${i}`),
  );
  decl.members?.forEach((member, i) =>
    visitClassMember(visitor, member, path + `/members/${i}`),
  );
  if (decl.source) {
    visitor.visitSourceReference?.(decl.source, path + '/source');
  }
};

export const visitFunction = (
  visitor: CustomElementsManifestVisitor,
  decl: FunctionDeclaration,
  path: string,
): void => {
  if (visitor.visitFunction?.(decl) === false) {
    return;
  }
  decl.parameters?.forEach((param, i) =>
    visitParameter(visitor, param, path + `/parameters/${i}`),
  );
  if (decl.return?.type) {
    visitType(visitor, decl.return.type, path + '/return/type');
  }
};

export const visitMixin = (
  visitor: CustomElementsManifestVisitor,
  decl: MixinDeclaration,
  path: string,
): void => {
  if (visitor.visitMixin?.(decl) === false) {
    return;
  }
  if (
    isCustomElementMixinDeclaration(decl) &&
    visitCustomElementMixin(visitor, decl as CustomElementMixinDeclaration) ===
      false
  ) {
    return;
  }
  if (decl.superclass) {
    visitor.visitReference?.(decl.superclass, path + '/superclass');
  }
  decl.mixins?.forEach((mixin, i) =>
    visitor.visitReference?.(mixin, path + `/mixins/${i}`),
  );
};

export const visitVariable = (
  visitor: CustomElementsManifestVisitor,
  decl: VariableDeclaration,
  path: string,
): void => {
  if (visitor.visitVariable?.(decl) === false) {
    return;
  }
  if (decl.source) {
    visitor.visitSourceReference?.(decl.source, path + '/source');
  }
  if (decl.type) {
    visitType(visitor, decl.type, path + '/type');
  }
};

export const visitCustomElement = (
  visitor: CustomElementsManifestVisitor,
  decl: CustomElementDeclaration,
  path: string,
): boolean | void => {
  if (visitor.visitCustomElement?.(decl) === false) {
    return false;
  }
  decl.attributes?.forEach((attr, i) =>
    visitAttribute(visitor, attr, path + `/attributes/${i}`),
  );
  decl.events?.forEach((event, i) =>
    visitEvent(visitor, event, path + `/events/${i}`),
  );
  if (decl.slots) {
    for (const slot of decl.slots) {
      visitSlot(visitor, slot);
    }
  }
  if (decl.cssParts) {
    for (const part of decl.cssParts) {
      visitCssPart(visitor, part);
    }
  }
  if (decl.cssProperties) {
    for (const prop of decl.cssProperties) {
      visitCssCustomProperty(visitor, prop);
    }
  }
  if (decl.cssStates) {
    for (const state of decl.cssStates) {
      visitCssCustomState(visitor, state);
    }
  }
};

export const visitCustomElementMixin = (
  visitor: CustomElementsManifestVisitor,
  decl: CustomElementMixinDeclaration,
): boolean | void => {
  if (visitor.visitCustomElementMixin?.(decl) === false) {
    return false;
  }
};

export const visitClassMember = (
  visitor: CustomElementsManifestVisitor,
  member: ClassMember,
  path: string,
): void => {
  if (visitor.visitClassMember?.(member) === false) {
    return;
  }
  switch (member.kind) {
    case 'field':
      if (visitClassField(visitor, member, path) === false) {
        return;
      }
      break;
    case 'method':
      if (visitClassMethod(visitor, member, path) === false) {
        return;
      }
      break;
    default:
      // exhaustiveness check
      member as void;
  }
};

export const visitClassField = (
  visitor: CustomElementsManifestVisitor,
  field: ClassField,
  path: string,
): boolean | void => {
  if (visitor.visitClassField?.(field) === false) {
    return false;
  }
  if (field.inheritedFrom) {
    visitor.visitReference?.(field.inheritedFrom, path + '/inheritedFrom');
  }
  if (field.source) {
    visitor.visitSourceReference?.(field.source, path + '/source');
  }
  if (field.type) {
    visitType(visitor, field.type, path + '/type');
  }
};

export const visitClassMethod = (
  visitor: CustomElementsManifestVisitor,
  method: ClassMethod,
  path: string,
): boolean | void => {
  if (visitor.visitClassMethod?.(method) === false) {
    return false;
  }
  if (method.inheritedFrom) {
    visitor.visitReference?.(method.inheritedFrom, path + '/inheritedFrom');
  }
  if (method.source) {
    visitor.visitSourceReference?.(method.source, path + '/source');
  }
  method.parameters?.forEach((param, i) =>
    visitParameter(visitor, param, path + `/parameters/${i}`),
  );
  if (method.return?.type) {
    visitType(visitor, method.return.type, path + '/return/type');
  }
};

export const visitParameter = (
  visitor: CustomElementsManifestVisitor,
  param: Parameter,
  path: string,
): void => {
  if (visitor.visitParameter?.(param) === false) {
    return;
  }
  if (param.type) {
    visitType(visitor, param.type, path + '/type');
  }
};

export const visitAttribute = (
  visitor: CustomElementsManifestVisitor,
  attr: Attribute,
  path: string,
): void => {
  if (visitor.visitAttribute?.(attr) === false) {
    return;
  }
  if (attr.type) {
    visitType(visitor, attr.type, path + '/type');
  }
};

export const visitEvent = (
  visitor: CustomElementsManifestVisitor,
  event: Event,
  path: string,
): void => {
  if (visitor.visitEvent?.(event) === false) {
    return;
  }
  if (event.type) {
    visitType(visitor, event.type, path + '/type');
  }
};

export const visitSlot = (
  visitor: CustomElementsManifestVisitor,
  slot: Slot,
): void => {
  if (visitor.visitSlot?.(slot) === false) {
    return;
  }
};

export const visitCssPart = (
  visitor: CustomElementsManifestVisitor,
  part: CssPart,
): void => {
  if (visitor.visitCssPart?.(part) === false) {
    return;
  }
};

export const visitCssCustomProperty = (
  visitor: CustomElementsManifestVisitor,
  prop: CssCustomProperty,
): void => {
  if (visitor.visitCssCustomProperty?.(prop) === false) {
    return;
  }
};

export const visitCssCustomState = (
  visitor: CustomElementsManifestVisitor,
  state: CssCustomState,
): void => {
  if (visitor.visitCssCustomState?.(state) === false) {
    return;
  }
};
