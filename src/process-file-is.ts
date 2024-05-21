import { ParseError } from './errors';
import { WannabeNode, filterAst, isArr, isWannabeNode, parse } from './main';

/** @throws {ParseError} If declaration with replacingFunc not found */
export const processFileIs = (jsCode: string): string => {
  const declarationOfIs = findDeclarationOfIs(jsCode);
  return deleteReplacingFunc(jsCode, declarationOfIs);
};

/** @throws {ParseError} If declaration not found */
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

/** @throws {ParseError} If replacingFunc not found */
const deleteReplacingFunc = (jsCode: string, declarationOfIs: WannabeNode): string => {
  const replacingFunc = filterAst(declarationOfIs, node => {
    if (!(isWannabeNode(node) && node.type === 'ArrowFunctionExpression' && 'params' in node)) return false;
    const { params } = node;
    return Boolean(isArr(params) && params.find(item => (
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
