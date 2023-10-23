"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BasicErrorException {
    constructor() {
        this.status = 400;
        this.message = 'Something goes wrong, please try again.';
    }
}
exports.default = BasicErrorException;
