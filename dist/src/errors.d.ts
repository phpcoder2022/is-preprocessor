export declare class ParseError extends Error {
    data?: object | undefined;
    constructor(message: string, data?: object | undefined);
}
