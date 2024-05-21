"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAst = exports.isArr = exports.isNode = exports.parse = void 0;
const acorn_1 = require("acorn");
const errors_1 = require("./errors");
const parse = (jsCode) => {
    return (0, acorn_1.parse)(jsCode, { ecmaVersion: 'latest', sourceType: 'module' });
};
exports.parse = parse;
/** Manual type guard */
const isNode = (anyPointOfTree) => {
    if (!((typeof anyPointOfTree === 'object' && anyPointOfTree)
        && ('type' in anyPointOfTree && 'start' in anyPointOfTree && 'end' in anyPointOfTree)
        && typeof anyPointOfTree.type === 'string'
        && typeof anyPointOfTree.start === 'number'
        && typeof anyPointOfTree.end === 'number'))
        return false;
    if ('range' in anyPointOfTree) {
        const { range } = anyPointOfTree;
        if (!(((0, exports.isArr)(range) && range.length === 2)
            && (typeof range[0] === 'number' && typeof range[1] === 'number')))
            return false;
    }
    if ('loc' in anyPointOfTree) { // For don't wreck static tipyzation
        throw new errors_1.ParseError('parse option \'locations\' must be disabled');
    }
    return true;
};
exports.isNode = isNode;
/** Manual type guard */
const isArr = (value) => {
    return value instanceof Array;
};
exports.isArr = isArr;
const filterAst = (node, filter) => {
    const resultArr = [];
    if ((0, exports.isNode)(node)) {
        const returnedNode = filter(node);
        if (returnedNode)
            resultArr.push(returnedNode);
    }
    for (const key in node) {
        const prop = node[key];
        if (typeof prop === 'object' && prop) {
            resultArr.push(...(0, exports.filterAst)(prop, filter));
        }
    }
    return resultArr;
};
exports.filterAst = filterAst;
