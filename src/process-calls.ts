import { CallExpression, Identifier } from 'acorn';
import { ParseError } from './errors';
import { ReplacingIndexes, AnyNode, filterAst, isNode, parse } from './main';

/** @throws {ParseError} If found calls of replacing func haven't second argument */
export const processCalls = (jsCode: string): string => {
  const indexes = findIsCalls(jsCode)
    .flatMap(findReplacingFuncCalls)
    .map(call => getReplacingIndexes(call, jsCode));
  let currentIndex = 0, processedCode = '';
  indexes.forEach(indexes => {
    processedCode += jsCode.slice(currentIndex, indexes.outer.start)
      + jsCode.slice(indexes.inner.start, indexes.inner.end);
    currentIndex = indexes.outer.end;
  });
  processedCode += jsCode.slice(currentIndex);
  return processedCode;
};

const findIsCalls = (jsCode: string): CallExpression[] => {
  const ast = parse(jsCode);
  // console.dir(ast, { depth: 20 });
  return filterAst(ast, node => {
    if (!(node.type === 'CallExpression')) return false;
    return filterAst(node.callee, findIdentifierIs).length ? node : false;
  });
};

const findIdentifierIs = (node: AnyNode): Identifier | false => {
  return node.type === 'Identifier' && node.name === 'is' ? node : false;
};

const findReplacingFuncCalls = (isCallExpr: CallExpression): CallExpression[] => {
  const { arguments: callArguments } = isCallExpr;
  const arrowFunc = callArguments[0];
  if (!(isNode(arrowFunc) && arrowFunc.type === 'ArrowFunctionExpression')) return [];
  const { params, body } = arrowFunc;
  const secondParam = params[1];
  if (!(isNode(secondParam) && secondParam.type === 'Identifier')) {
    return [];
  }

  const { name: replacingFuncName } = secondParam;
  if (!(typeof replacingFuncName === 'string')) return [];
  return filterAst(body, node => {
    if (!(node.type === 'CallExpression')) return false;
    return (node.callee.type === 'Identifier'
      && node.callee.name === replacingFuncName
    ) ? node : false;
  });
};

/** @throws {ParseError} If found call of replacing func haven't second argument */
const getReplacingIndexes = (replaceCall: CallExpression, jsCode: string): ReplacingIndexes => {
  const result = findReplacingIndexes(replaceCall);
  if (!result) {
    throw new ParseError(
      'replaceCall isn\'t CallExpression with arguments',
      { replaceCall, code: jsCode.slice(replaceCall.start, replaceCall.end) },
    );
  }
  return result;
};

const findReplacingIndexes = (replaceCall: CallExpression): ReplacingIndexes | null => {
  const { arguments: callArguments } = replaceCall;
  const secondArg = callArguments[1];
  if (!isNode(secondArg)) return null;
  return {
    outer: { start: replaceCall.start, end: replaceCall.end },
    inner: { start: secondArg.start, end: secondArg.end },
  };
};
