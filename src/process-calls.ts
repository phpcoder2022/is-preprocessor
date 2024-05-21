import { ParseError } from './errors';
import { ReplacingIndexes, WannabeNode, filterAst, isArr, isWannabeNode, parse } from './main';

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
  if (currentIndex) processedCode += jsCode.slice(currentIndex);
  return processedCode;
};

const findIsCalls = (jsCode: string): WannabeNode[] => {
  const ast = parse(jsCode);
  // console.dir(ast, { depth: 20 });
  return filterAst(ast, node => {
    if (!(node.type === 'CallExpression' && 'callee' in node)) return false;
    const { callee } = node;
    return !!(isWannabeNode(callee) && filterAst(callee, findIdentifierIs).length);
  });
};

const findIdentifierIs = (node: WannabeNode): boolean => {
  if (!(node.type === 'Identifier' && 'name' in node)) return false;
  return node.name === 'is';
};

const findReplacingFuncCalls = (isCallExpr: WannabeNode): WannabeNode[] => {
  if (!('arguments' in isCallExpr)) return [];
  const { arguments: callArguments } = isCallExpr;
  if (!(isArr(callArguments))) return [];

  const arrowFunc = callArguments[0];
  if (!(isWannabeNode(arrowFunc)
    && arrowFunc.type === 'ArrowFunctionExpression'
    && ('params' in arrowFunc && 'body' in arrowFunc)
  )) return [];
  const { params, body } = arrowFunc;
  if (!(isArr(params) && isWannabeNode(body))) return [];
  const secondParam = params[1];
  if (!(isWannabeNode(secondParam) && secondParam.type === 'Identifier' && 'name' in secondParam)) {
    return [];
  }

  const { name: replacingFuncName } = secondParam;
  if (!(typeof replacingFuncName === 'string')) return [];
  return filterAst(body, node => {
    if (!(node.type === 'CallExpression' && 'callee' in node)) return false;
    const { callee } = node;
    return !!((isWannabeNode(callee) && callee.type === 'Identifier')
      && ('name' in callee && callee.name === replacingFuncName)
    );
  });
};

/** @throws {ParseError} If found call of replacing func haven't second argument */
const getReplacingIndexes = (replaceCall: WannabeNode, jsCode: string): ReplacingIndexes => {
  const result = findReplacingIndexes(replaceCall);
  if (!result) {
    throw new ParseError(
      'replaceCall isn\'t CallExpression with arguments',
      { replaceCall, code: jsCode.slice(replaceCall.start, replaceCall.end) },
    );
  }
  return result;
};

const findReplacingIndexes = (replaceCall: WannabeNode): ReplacingIndexes | null => {
  if (!(replaceCall.type === 'CallExpression' && 'arguments' in replaceCall)) return null;
  const { arguments: callArguments } = replaceCall;
  if (!isArr(callArguments)) return null;
  const secondArg = callArguments[1];
  if (!isWannabeNode(secondArg)) return null;
  return {
    outer: { start: replaceCall.start, end: replaceCall.end },
    inner: { start: secondArg.start, end: secondArg.end },
  };
};
