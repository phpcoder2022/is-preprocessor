import { is, isnt } from './is';

export const isObj = is<unknown, object>((value): object | typeof isnt => {
  return (typeof value === 'object' && value) ? value : isnt;
});

export type Entry = {
  id: number,
  name: string,
};

export const isEntry = is<unknown, Entry>((value, replaceCompileToRuntime): Entry | typeof isnt => {
  if (!(isObj(value) && 'id' in value && 'name' in value)) return isnt;
  const { id, name } = value;
  if (!(typeof id === 'number' && typeof name === 'string')) return isnt;
  return replaceCompileToRuntime({ id, name }, value);
});

export const isEntryWithCalledCallback = is<unknown, Entry>((value, replaceCompileToRuntime):
Entry | typeof isnt => {
  if (!isEntry(value)) return isnt;
  // There used senseless expression for test
  return replaceCompileToRuntime((value => {
    return value;
  })(value), value);
});

export const isEntryWithShortArrow = is<unknown, Entry>(
  // There used senseless expression for test
  (value, replace): Entry | typeof isnt => isEntry(value) ? replace(value, value) : isnt,
);

export const isEntryWithManyReplacingFunc = is<unknown, Entry>((value, replace) => (
  Math.random() < 0.5
    ? isEntry(value) ? replace(value, value) : isnt
    : isEntry(value) ? replace(value, value) : isnt
));

export const isEntryWithRegularFunction = is<unknown, Entry>(function (value, replace) {
  return isEntry(value) ? replace(value, value) : isnt;
});
