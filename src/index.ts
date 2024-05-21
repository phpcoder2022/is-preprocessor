import { parse as esParse } from 'espree';
import { ParseError } from './errors';

const parse = (jsCode: string) => {
  return esParse(jsCode, { ecmaVersion: 'latest', sourceType: 'module', tokens: true });
};

type WannabeNode = {
  type: string,
  start: number,
  end: number,
};

/** Manual type guard */
const isWannabeNode = (anyPointOfTree: unknown): anyPointOfTree is WannabeNode => {
  return !!((typeof anyPointOfTree === 'object' && anyPointOfTree)
    && ('type' in anyPointOfTree && 'start' in anyPointOfTree && 'end' in anyPointOfTree)
    && typeof anyPointOfTree.type === 'string'
    && typeof anyPointOfTree.start === 'number'
    && typeof anyPointOfTree.end === 'number'
  );
};

const filterAst = <Obj extends object>(node: Obj, filter: (node: WannabeNode) => boolean):
WannabeNode[] => {
  const resultArr = [];
  for (const key in node) {
    const prop = node[key];
    if (isWannabeNode(prop) && filter(prop)) {
      resultArr.push(prop);
    }
    if (typeof prop === 'object' && prop) {
      resultArr.push(...filterAst(prop, filter));
    }
  }
  return resultArr;
};

const findDeclarationOfIs = (jsCode: string): WannabeNode => {
  const ast = parse(jsCode);
  const declarationOfIs = filterAst(ast, node => {
    if (!(node.type === 'FunctionDeclaration' && 'id' in node)) return false;
    const { id } = node;
    if (!(isWannabeNode(id) && id.type === 'Identifier' && 'name' in id)) return false;
    const { name } = id;
    return name === 'is';
  })[0];
  if (!declarationOfIs) throw new ParseError('declaration of `is` not found', { jsCode });
  return declarationOfIs;
};

const deleteReplacingFunc = (jsCode: string, declarationOfIs: WannabeNode): string => {
  const replacingFunc = filterAst(declarationOfIs, node => {
    if (!(isWannabeNode(node) && node.type === 'ArrowFunctionExpression' && 'params' in node)) return false;
    const { params } = node;
    return Boolean(params instanceof Array && params.find(item => (
      isWannabeNode(item) && 'name' in item && item.name === 'returnToCompile'
    )));
  })[0];
  if (!replacingFunc) {
    throw new ParseError(
      'replacing func not found in is declaration',
      { declarationOfIs, code: jsCode.slice(declarationOfIs.start, declarationOfIs.end) },
    );
  }
  const replacement = '/* Second argument was replaced by preprocessor */';
  return jsCode.slice(0, replacingFunc.start) + replacement + jsCode.slice(replacingFunc.end);
};

export const processFileIs = (jsCode: string): string => {
  const declarationOfIs = findDeclarationOfIs(jsCode);
  return deleteReplacingFunc(jsCode, declarationOfIs);
};
