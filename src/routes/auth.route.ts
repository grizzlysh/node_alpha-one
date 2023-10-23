import express from 'express';
import { refreshTokenHandler, loginHandler, registerHandler } from '../controllers/auth.controller';

const AuthRoutes = express.Router();

// register users
AuthRoutes.post('/register', registerHandler);

// login user
AuthRoutes.post('/login', loginHandler);

// refresh access token
AuthRoutes.get('/refresh', refreshTokenHandler);

// logout User
// AuthRoutes.get('/logout', deserializeUser, requireUser, logoutHandler);sssss

export default AuthRoutes;
