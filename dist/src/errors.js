"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = void 0;
class ParseError extends Error {
    data;
    constructor(message, data) {
        super(message + (data ? '\nexists error.data' : ''));
        this.data = data;
        this.name = this.constructor.name;
    }
}
exports.ParseError = ParseError;
