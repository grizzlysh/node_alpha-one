"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
const authTokenWrong_exception_1 = __importDefault(require("../exceptions/authTokenWrong.exception"));
const authTokenInvalid_exception_1 = __importDefault(require("../exceptions/authTokenInvalid.exception"));
(0, dotenv_1.config)();
function auth(req, res, next) {
    const token = req.header("x-auth-token");
    const { status, message } = new authTokenWrong_exception_1.default();
    if (!token)
        return res.status(status).send(message);
    try {
        const jwtSecretKey = process.env.JWT_SECRET_KEY || "s0m3wh3r3";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecretKey);
        res.user = decoded;
        next();
    }
    catch (error) {
        const { status, message } = new authTokenInvalid_exception_1.default();
        res.status(status).send(message);
    }
}
exports.default = auth;
