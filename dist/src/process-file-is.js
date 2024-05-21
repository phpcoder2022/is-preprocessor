"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFileIs = void 0;
const errors_1 = require("./errors");
const main_1 = require("./main");
/** @throws {ParseError} If declaration with replacingFunc not found */
const processFileIs = (jsCode) => {
    const declarationOfIs = findDeclarationOfIs(jsCode);
    return deleteReplacingFunc(jsCode, declarationOfIs);
};
exports.processFileIs = processFileIs;
/** @throws {ParseError} If declaration not found */
const findDeclarationOfIs = (jsCode) => {
    const ast = (0, main_1.parse)(jsCode);
    const declarationOfIs = (0, main_1.filterAst)(ast, node => {
        if (!(node.type === 'FunctionDeclaration' && node.id?.name === 'is'))
            return false;
        return node;
    })[0];
    if (!declarationOfIs)
        throw new errors_1.ParseError('declaration of `is` not found', { jsCode });
    return declarationOfIs;
};
/** @throws {ParseError} If replacingFunc not found */
const deleteReplacingFunc = (jsCode, declarationOfIs) => {
    const replacingFunc = (0, main_1.filterAst)(declarationOfIs, node => {
        if (!(node.type === 'ArrowFunctionExpression'))
            return false;
        return node.params.find(item => ((0, main_1.isNode)(item) && 'name' in item && item.name === 'returnToCompile')) ? node : false;
    })[0];
    if (!replacingFunc) {
        throw new errors_1.ParseError('replacing func not found in is declaration', { declarationOfIs, code: jsCode.slice(declarationOfIs.start, declarationOfIs.end) });
    }
    const replacement = '/* Second argument was replaced by preprocessor */';
    return jsCode.slice(0, replacingFunc.start) + replacement + jsCode.slice(replacingFunc.end);
};
