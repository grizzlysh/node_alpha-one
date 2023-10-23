"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthCredentialInvalidException {
    constructor() {
        this.status = 400;
        this.message = 'Invalid Credentials';
    }
}
exports.default = AuthCredentialInvalidException;
