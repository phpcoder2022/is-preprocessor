export class ParseError extends Error {
  constructor(message: string, public data?: object) {
    super(message + (data ? '\nexists error.data' : ''));
    this.name = this.constructor.name;
  }
}
