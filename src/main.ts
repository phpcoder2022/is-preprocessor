import { parse as esParse } from 'espree';

export const parse = (jsCode: string): ReturnType<typeof esParse> => {
  return esParse(jsCode, { ecmaVersion: 'latest', sourceType: 'module', tokens: true });
};

export type WannabeNode = {
  type: string,
  start: number,
  end: number,
};

export type ReplacingIndexes = {
  outer: Pick<WannabeNode, 'start' | 'end'>,
  inner: Pick<WannabeNode, 'start' | 'end'>,
};

/** Manual type guard */
export const isWannabeNode = (anyPointOfTree: unknown): anyPointOfTree is WannabeNode => {
  return !!((typeof anyPointOfTree === 'object' && anyPointOfTree)
    && ('type' in anyPointOfTree && 'start' in anyPointOfTree && 'end' in anyPointOfTree)
    && typeof anyPointOfTree.type === 'string'
    && typeof anyPointOfTree.start === 'number'
    && typeof anyPointOfTree.end === 'number'
  );
};

/** Manual type guard */
export const isArr = (value: unknown): value is unknown[] => {
  return value instanceof Array;
};

export const filterAst = <Obj extends object>(node: Obj, filter: (node: WannabeNode) => boolean):
WannabeNode[] => {
  const resultArr = [];
  if (isWannabeNode(node) && filter(node)) resultArr.push(node);
  for (const key in node) {
    const prop = node[key];
    if (typeof prop === 'object' && prop) {
      resultArr.push(...filterAst(prop, filter));
    }
  }
  return resultArr;
};
