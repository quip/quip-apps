export default class ClientError extends Error {
    constructor(message: string, errorName?: string) {
        super();
        this.name = errorName || "QuipError";
        this.message = message;
        this.stack = new Error().stack;
    }
}
