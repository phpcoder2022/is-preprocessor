import { parse as esParse, AnyNode, Node } from 'acorn';
export { AnyNode };
export declare const parse: (jsCode: string) => ReturnType<typeof esParse>;
export type IndexesPair = Pick<Node, 'start' | 'end'> & {
    [Key in Exclude<keyof Node, 'start' | 'end'>]?: never;
};
export type ReplacingIndexes = {
    outer: IndexesPair;
    inner: IndexesPair;
};
/** Manual type guard */
export declare const isNode: (anyPointOfTree: unknown) => anyPointOfTree is AnyNode;
/** Manual type guard */
export declare const isArr: (value: unknown) => value is unknown[];
export declare const filterAst: <Obj extends object, ReturnNode extends AnyNode>(node: Obj, filter: (node: AnyNode) => ReturnNode | false) => ReturnNode[];
