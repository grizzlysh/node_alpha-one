import express from 'express';
import { refreshTokenHandler, signInHandler, signUpHandler } from '../controllers/auth.controller';

const AuthRoutes = express.Router();

// register users
AuthRoutes.post('/register', signUpHandler);

// login user
AuthRoutes.post('/login', signInHandler);

// refresh access token
AuthRoutes.get('/refresh', refreshTokenHandler);

// logout User
// AuthRoutes.get('/logout', deserializeUser, requireUser, logoutHandler);sssss

export default AuthRoutes;
