"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCalls = void 0;
const errors_1 = require("./errors");
const main_1 = require("./main");
/** @throws {ParseError} If found calls of replacing func haven't second argument */
const processCalls = (jsCode) => {
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
exports.processCalls = processCalls;
const findIsCalls = (jsCode) => {
    const ast = (0, main_1.parse)(jsCode);
    // console.dir(ast, { depth: 20 });
    return (0, main_1.filterAst)(ast, node => {
        if (!(node.type === 'CallExpression'))
            return false;
        return (0, main_1.filterAst)(node.callee, findIdentifierIs).length ? node : false;
    });
};
const findIdentifierIs = (node) => {
    return node.type === 'Identifier' && node.name === 'is' ? node : false;
};
const findReplacingFuncCalls = (isCallExpr) => {
    const { arguments: callArguments } = isCallExpr;
    const arrowFunc = callArguments[0];
    if (!((0, main_1.isNode)(arrowFunc) && arrowFunc.type === 'ArrowFunctionExpression'))
        return [];
    const { params, body } = arrowFunc;
    const secondParam = params[1];
    if (!((0, main_1.isNode)(secondParam) && secondParam.type === 'Identifier')) {
        return [];
    }
    const { name: replacingFuncName } = secondParam;
    if (!(typeof replacingFuncName === 'string'))
        return [];
    return (0, main_1.filterAst)(body, node => {
        if (!(node.type === 'CallExpression'))
            return false;
        return (node.callee.type === 'Identifier'
            && node.callee.name === replacingFuncName) ? node : false;
    });
};
/** @throws {ParseError} If found call of replacing func haven't second argument */
const getReplacingIndexes = (replaceCall, jsCode) => {
    const result = findReplacingIndexes(replaceCall);
    if (!result) {
        throw new errors_1.ParseError('replaceCall isn\'t CallExpression with arguments', { replaceCall, code: jsCode.slice(replaceCall.start, replaceCall.end) });
    }
    return result;
};
const findReplacingIndexes = (replaceCall) => {
    const { arguments: callArguments } = replaceCall;
    const secondArg = callArguments[1];
    if (!(0, main_1.isNode)(secondArg))
        return null;
    return {
        outer: { start: replaceCall.start, end: replaceCall.end },
        inner: { start: secondArg.start, end: secondArg.end },
    };
};
