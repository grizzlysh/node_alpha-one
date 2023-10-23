"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthTokenInvalidException {
    constructor() {
        this.status = 401;
        this.message = 'Invalid Auth Token';
    }
}
exports.default = AuthTokenInvalidException;
