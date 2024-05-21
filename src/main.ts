import {
  parse as esParse,
  AnyNode,
  Node,
} from 'acorn';
import { ParseError } from './errors';

export { AnyNode };

export const parse = (jsCode: string): ReturnType<typeof esParse> => {
  return esParse(jsCode, { ecmaVersion: 'latest', sourceType: 'module' });
};

export type IndexesPair = Pick<Node, 'start' | 'end'>
& { [Key in Exclude<keyof Node, 'start' | 'end'>]?: never };

export type ReplacingIndexes = {
  outer: IndexesPair,
  inner: IndexesPair,
};

/** Manual type guard */
export const isNode = (anyPointOfTree: unknown): anyPointOfTree is AnyNode => {
  if (!((typeof anyPointOfTree === 'object' && anyPointOfTree)
    && ('type' in anyPointOfTree && 'start' in anyPointOfTree && 'end' in anyPointOfTree)
    && typeof anyPointOfTree.type === 'string'
    && typeof anyPointOfTree.start === 'number'
    && typeof anyPointOfTree.end === 'number'
  )) return false;
  if ('range' in anyPointOfTree) {
    const { range } = anyPointOfTree;
    if (!((isArr(range) && range.length === 2)
      && (typeof range[0] === 'number' && typeof range[1] === 'number')
    )) return false;
  }
  if ('loc' in anyPointOfTree) { // For don't wreck static tipyzation
    throw new ParseError('parse option \'locations\' must be disabled');
  }
  return true;
};

/** Manual type guard */
export const isArr = (value: unknown): value is unknown[] => {
  return value instanceof Array;
};

export const filterAst = <Obj extends object, ReturnNode extends AnyNode>(
  node: Obj, filter: (node: AnyNode) => ReturnNode | false,
): ReturnNode[] => {
  const resultArr: ReturnNode[] = [];
  if (isNode(node)) {
    const returnedNode = filter(node);
    if (returnedNode) resultArr.push(returnedNode);
  }
  for (const key in node) {
    const prop = node[key];
    if (typeof prop === 'object' && prop) {
      resultArr.push(...filterAst(prop, filter));
    }
  }
  return resultArr;
};
