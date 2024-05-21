import { ParseError } from './errors';
import { filterAst, isNode, parse } from './main';

/** @throws {ParseError} If declaration with replacingFunc not found */
export const processFileIs = (jsCode: string): string => {
  const declarationOfIs = findDeclarationOfIs(jsCode);
  return deleteReplacingFunc(jsCode, declarationOfIs);
};

/** @throws {ParseError} If declaration not found */
const findDeclarationOfIs = (jsCode: string) => {
  const ast = parse(jsCode);
  const declarationOfIs = filterAst(ast, node => {
    if (!(node.type === 'FunctionDeclaration' && node.id?.name === 'is')) return false;
    return node;
  })[0];
  if (!declarationOfIs) throw new ParseError('declaration of `is` not found', { jsCode });
  return declarationOfIs;
};

/** @throws {ParseError} If replacingFunc not found */
const deleteReplacingFunc = (
  jsCode: string,
  declarationOfIs: ReturnType<typeof findDeclarationOfIs>,
): string => {
  const replacingFunc = filterAst(declarationOfIs, node => {
    if (!(node.type === 'ArrowFunctionExpression')) return false;
    return node.params.find(item => (
      isNode(item) && 'name' in item && item.name === 'returnToCompile'
    )) ? node : false;
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
