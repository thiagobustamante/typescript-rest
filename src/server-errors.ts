'use strict';

import { HttpError } from './server-types';

/**
 * Represents a BAD REQUEST error. The request could not be understood by the
 * server due to malformed syntax. The client SHOULD NOT repeat the request
 * without modifications.
 */
export class BadRequestError extends HttpError {
    constructor(message?: string) {
        super('BadRequestError', 400, message || 'Bad Request');
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

/**
 * Represents an UNAUTHORIZED error. The request requires user authentication. The response
 * MUST include a WWW-Authenticate header field containing a challenge applicable to the
 * requested resource.
 */
export class UnauthorizedError extends HttpError {
    constructor(message?: string) {
        super('UnauthorizedError', 401, message || 'Unauthorized');
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

/**
 * Represents a FORBIDEN error. The server understood the request, but is refusing to
 * fulfill it. Authorization will not help and the request SHOULD NOT be repeated.
 */
export class ForbidenError extends HttpError {
    constructor(message?: string) {
        super('ForbidenError', 403, message || 'Forbiden');
        // Object.setPrototypeOf(this, ForbidenError.prototype);
        // this['__proto__'] = ForbidenError.prototype;
        Object.setPrototypeOf(this, ForbidenError.prototype);
    }
}

/**
 * Represents a NOT FOUND error. The server has not found anything matching
 * the Request-URI. No indication is given of whether the condition is temporary
 * or permanent. The 410 (GoneError) status code SHOULD be used if the server knows,
 * through some internally configurable mechanism, that an old resource is permanently
 * unavailable and has no forwarding address.
 *
 * This error is commonly used when
 * the server does not wish to reveal exactly why the request has been refused,
 * or when no other response is applicable.
 */
export class NotFoundError extends HttpError {
    constructor(message?: string) {
        super('NotFoundError', 404, message || 'Not Found');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Represents a METHOD NOT ALLOWED error. The method specified in the Request-Line is not allowed for
 * the resource identified by the Request-URI. The response MUST include an Allow header
 * containing a list of valid methods for the requested resource.
 */
export class MethodNotAllowedError extends HttpError {
    constructor(message?: string) {
        super('MethodNotAllowedError', 405, message || 'Method Not Allowed');
        Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
    }
}

/**
 * Represents a NOT ACCEPTABLE error. The resource identified by the request is only capable of
 * generating response entities which have content characteristics not acceptable according
 * to the accept headers sent in the request.
 */
export class NotAcceptableError extends HttpError {
    constructor(message?: string) {
        super('NotAcceptableError', 406, message || 'Not Acceptable');
        Object.setPrototypeOf(this, NotAcceptableError.prototype);
    }
}
/**
 * Represents a CONFLICT error. The request could not be completed due to a
 * conflict with the current state of the resource.
 */
export class ConflictError extends HttpError {
    constructor(message?: string) {
        super('ConflictError', 409, message || 'Conflict');
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * Represents a GONE error. The requested resource is no longer available at the server
 * and no forwarding address is known. This condition is expected to be considered
 * permanent. Clients with link editing capabilities SHOULD delete references to
 * the Request-URI after user approval. If the server does not know, or has
 * no facility to determine, whether or not the condition is permanent, the
 * error 404 (NotFoundError) SHOULD be used instead. This response is
 * cacheable unless indicated otherwise.
 */
export class GoneError extends HttpError {
    constructor(message?: string) {
        super('GoneError', 410, message || 'Gone');
        Object.setPrototypeOf(this, GoneError.prototype);
    }
}

/**
 * Represents an UNSUPPORTED MEDIA TYPE error. The server is refusing to service the request
 * because the entity of the request is in a format not supported by the requested resource
 * for the requested method.
 */
export class UnsupportedMediaTypeError extends HttpError {
    constructor(message?: string) {
        super('UnsupportedMediaTypeError', 415, message || 'Unsupported Media Type');
        Object.setPrototypeOf(this, UnsupportedMediaTypeError.prototype);
    }
}

/**
 * Represents an INTERNAL SERVER error. The server encountered an unexpected condition
 * which prevented it from fulfilling the request.
 */
export class InternalServerError extends HttpError {
    constructor(message?: string) {
        super('InternalServerError', 500, message || 'Internal Server Error');
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

/**
 * Represents a NOT IMPLEMENTED error. The server does not support the functionality required
 *  to fulfill the request. This is the appropriate response when the server does not recognize
 * the request method and is not capable of supporting it for any resource.
 */
export class NotImplementedError extends HttpError {
    constructor(message?: string) {
        super('NotImplementedError', 501, message || 'Not Implemented');
        Object.setPrototypeOf(this, NotImplementedError.prototype);
    }
}
