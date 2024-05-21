export function is<Wide, Narrow extends Wide>(
  predicate: <Input>(
    value: Wide & Input,
    replaceCompileToRuntime: (
      returnToCompile: Narrow,
      returnToRuntime: Wide & Input
    ) => typeof returnToCompile
  ) => Narrow | typeof isnt,
) {
  return (value: Wide): value is Narrow => predicate(
    value,
    // Второй аргумент используется для препроцессинга после tsc
    // На него заменяется весь вызов функции в рантайме
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (returnToCompile, _returnToRuntime) => returnToCompile,
  ) !== isnt;
}
export const isnt = Symbol('@is/isn\'t');
