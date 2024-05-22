export const sumNum = (...args: number[]): number => args.reduce((sum, item) => sum + item, 0);
export const sumInt = (...args: bigint[]): bigint => args.reduce((sum, item) => sum + item, 0n);
export const sumStr = (...args: string[]): string => args.reduce((sum, item) => sum + item, '');
