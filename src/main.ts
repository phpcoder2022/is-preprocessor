import { parse as esParse } from 'espree';

export const parse = (jsCode: string): ReturnType<typeof esParse> => {
  return esParse(jsCode, { ecmaVersion: 'latest', sourceType: 'module', tokens: true });
};

export type WannabeNode = {
  type: string,
  start: number,
  end: number,
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

export const filterAst = <Obj extends object>(node: Obj, filter: (node: WannabeNode) => boolean):
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
