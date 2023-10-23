"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthTokenWrongException {
    constructor() {
        this.status = 401;
        this.message = 'Access denied, Not authorized';
    }
}
exports.default = AuthTokenWrongException;
