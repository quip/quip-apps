// Copyright 2019 Quip

class ClientError extends Error {
    constructor(message, errorName) {
        super();
        this.name = errorName || "QuipError";
        this.message = message;
        this.stack = new Error().stack;
    }
}

module.exports = ClientError;
