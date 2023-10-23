"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenHandler = exports.signInHandler = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authCredentialInvalid_exception_1 = __importDefault(require("../exceptions/authCredentialInvalid.exception"));
const authCredentialWrong_exception_1 = __importDefault(require("../exceptions/authCredentialWrong.exception"));
const basicError_exception_1 = __importDefault(require("../exceptions/basicError.exception"));
const authTokenWrong_exception_1 = __importDefault(require("../exceptions/authTokenWrong.exception"));
function signInHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const schema = joi_1.default.object({
                email: joi_1.default.string().min(3).max(200).required().email(),
                password: joi_1.default.string().min(6).max(200).required(),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                const { status, message } = new authCredentialInvalid_exception_1.default();
                return res.status(status).send(message);
            }
            let user = true;
            // await User.findOne({ email: req.body.email });
            if (!user) {
                const { status, message } = new authCredentialWrong_exception_1.default();
                return res.status(status).send(message);
            }
            const validPassword = true;
            // await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                const { status, message } = new authCredentialWrong_exception_1.default();
                return res.status(status).send(message);
            }
            let userOnline = {
                uid: 'a',
                username: 'a',
                name: 'a',
                sex: 'a',
                email: 'a',
            };
            // const token                    = jwt.sign(userOnline, jwtSecretKey);
            const jwtSecretKey = process.env.TODO_APP_JWT_SECRET_KEY || 'S0M3WH3R3';
            const jwtRefreshKey = process.env.TODO_APP_JWT_REFRESH_KEY || 'S0M3WH3R3';
            const accessToken = jsonwebtoken_1.default.sign(userOnline, jwtSecretKey, { expiresIn: '1m' });
            const refreshToken = jsonwebtoken_1.default.sign(userOnline, jwtRefreshKey, { expiresIn: '3m' });
            res.cookie('refresh_token', refreshToken, {
                // httpOnly: true,
                // sameSite: 'None',
                // secure  : true,
                maxAge: 24 * 60 * 60 * 1000,
                // maxAge: 10000,
                // useCredentials: true
            });
            res.send(accessToken);
        }
        catch (error) {
            const { status, message } = new basicError_exception_1.default();
            res.status(status).send(message);
        }
    });
}
exports.signInHandler = signInHandler;
function refreshTokenHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.refreshToken) {
                const refreshToken = req.body.refreshToken;
                const jwtSecretKey = process.env.TODO_APP_JWT_SECRET_KEY || 'S0M3WH3R3';
                const jwtRefreshKey = process.env.TODO_APP_JWT_REFRESH_KEY || 'S0M3WH3R3';
                jsonwebtoken_1.default.verify(refreshToken, jwtRefreshKey, (err, payload) => {
                    if (err) {
                        return res.status(402).send({ message: err.message });
                    }
                    else {
                        let userOnline = {
                            uid: payload.uid,
                            username: payload.username,
                            name: payload.name,
                            sex: payload.sex,
                            email: payload.email,
                        };
                        const accessToken = jsonwebtoken_1.default.sign(userOnline, jwtSecretKey, { expiresIn: '1m' });
                        return res.send(accessToken);
                    }
                });
            }
            else {
                const { status, message } = new authTokenWrong_exception_1.default();
                res.status(status).send(message);
            }
        }
        catch (error) {
            const { status, message } = new basicError_exception_1.default();
            res.status(status).send(message);
        }
    });
}
exports.refreshTokenHandler = refreshTokenHandler;
// export const signUpHandler = async (req: Request, res: Response) => {
//   const schema = Joi.object({
//     name    : Joi.string().min(3).max(30).required(),
//     email   : Joi.string().min(3).max(200).required().email(),
//     password: Joi.string().min(6).max(200).required(),
//   });
//   const { error } = schema.validate(req.body);
//   if (error) {
//     const { status, message } = new AuthCredentialWrongException();
//     return res.status(status).send(message);
//   }
//   let user: Partial<User> | any = true;
//   // await User.findOne({ email: req.body.email });
//   if (user) {
//     const { status, message } = new AuthCredentialInvalidException();
//     return res.status(status).send("User already exists...");
//   }
//   const { name, email, password } = req.body;
//   user = {
//     name    : name,
//     email   : email,
//     password: password,
//   }
//   const salt    = await bcryptjs.genSalt(10);
//   user.password = await bcryptjs.hash(user.password, salt);
//   await user.save();
//   const jwtSecretKey: jwt.Secret = process.env.TODO_APP_JWT_SECRET_KEY || 'S0M3WH3R3';
//   const token                    = jwt.sign(user, jwtSecretKey)
//   res.send(token);
// }
