// Copyright 2017 Quip

export class DefaultError extends Error {
    constructor(message = "Default Error") {
        super(message);
        Object.setPrototypeOf(this, DefaultError.prototype);
        this.message_ = message;
    }

    getMessage() {
        return this.message_;
    }

    setMessage(message) {
        this.message_ = message;
    }

    getName() {
        return this.name;
    }
}

export class TypeNotSupportedError extends DefaultError {
    constructor(message = "Type Not Supported", id, type) {
        super(message);
        Object.setPrototypeOf(this, TypeNotSupportedError.prototype);
        this.dataId_ = id;
        this.dataType_ = type;
    }

    getMessage() {
        return (
            this.message_ + ". Id: " + this.dataId + " Type: " + this.dataType_
        );
    }

    getId() {
        return this.dataId_;
    }

    getType() {
        return this.type_;
    }
}

export class InvalidValueError extends DefaultError {
    constructor(message = "Invalid Value") {
        super(message);
        Object.setPrototypeOf(this, InvalidValueError.prototype);
    }
}

export class FieldsCannotBeUpdatedError extends DefaultError {
    constructor(message = "Fields Cannot Be Updated") {
        super(message);
        Object.setPrototypeOf(this, FieldsCannotBeUpdatedError.prototype);
    }
}

export class TimeoutError extends DefaultError {
    constructor(message = "Timeout Error") {
        super(message);
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}

export class UnauthenticatedError extends DefaultError {
    constructor(message = "Unauthenticated Error") {
        super(message);
        Object.setPrototypeOf(this, UnauthenticatedError.prototype);
    }
}

// HTTP error with status code
export class HttpError extends DefaultError {
    constructor(message = "Http Error") {
        super(message);
        Object.setPrototypeOf(this, HttpError.prototype);
        this.code_ = null;
    }

    getCode() {
        return this.code_;
    }
}

export class BadRequestError extends HttpError {
    constructor(message = "Bad Request Error") {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
        this.code_ = 400;
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = "Unauthorized Error") {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
        this.code_ = 401;
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = "Forbidden Error") {
        super(message);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
        this.code_ = 403;
    }
}

export class NotFoundError extends HttpError {
    constructor(message = "NotFound Error") {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
        this.code_ = 404;
    }
}

export class InternalServerError extends HttpError {
    constructor(message = "Internal Server Error") {
        super(message);
        Object.setPrototypeOf(this, InternalServerError.prototype);
        this.code_ = 500;
    }
}

export class ServiceUnavailableError extends HttpError {
    constructor(message = "Service Unavailable Error") {
        super(message);
        Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
        this.code_ = 503;
    }
}

export class GatewayTimeoutError extends HttpError {
    constructor(message = "Gateway Timeout Error") {
        super(message);
        Object.setPrototypeOf(this, GatewayTimeoutError.prototype);
        this.code_ = 504;
    }
}

/**
 * Returns whether an error is an instance of an Error class derived from
 * DefaultError, but not DefaultError itself. Error objects that were not
 * constructed from a class derived from DefaultError will also be falsey (e.g.
 * null, POJSOs, strings).
 * @param {?DefaultError|Error|Object|string} maybeError
 * @return {boolean}
 */
export function isNonDefaultError(maybeError) {
    return (
        maybeError instanceof DefaultError &&
        maybeError.constructor !== DefaultError
    );
}
