"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthCredentialWrongException {
    constructor() {
        this.status = 400;
        this.message = 'Wrong Email/Password';
    }
}
exports.default = AuthCredentialWrongException;
