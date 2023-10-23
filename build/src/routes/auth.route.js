"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const AuthRoutes = express_1.default.Router();
// Register user route
// router.post('/register', signUpHandler);
// Login user route
AuthRoutes.post('/login', auth_controller_1.signInHandler);
// // Refresh access toke route
AuthRoutes.get('/refresh', auth_controller_1.refreshTokenHandler);
// // Logout User
// AuthRoutes.get('/logout', deserializeUser, requireUser, logoutHandler);
exports.default = AuthRoutes;
