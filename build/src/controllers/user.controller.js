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
exports.deleteUser = exports.editUser = exports.getUserById = exports.getUser = exports.createUser = void 0;
const joi_1 = __importDefault(require("joi"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const authCredentialWrong_exception_1 = __importDefault(require("../exceptions/authCredentialWrong.exception"));
const authCredentialInvalid_exception_1 = __importDefault(require("../exceptions/authCredentialInvalid.exception"));
const basicError_exception_1 = __importDefault(require("../exceptions/basicError.exception"));
const pagination_util_1 = require("../utils/pagination.util");
const prisma = new client_1.PrismaClient();
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const schema = joi_1.default.object({
                name: joi_1.default.string().min(3).max(30).required(),
                email: joi_1.default.string().min(3).max(200).required().email(),
                password: joi_1.default.string().min(6).max(200).required(),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                const { status, message } = new authCredentialWrong_exception_1.default();
                return res.status(status).send(message);
            }
            // let user: Partial<User> | any = true;
            // await User.findOne({ email: req.body.email });
            const checkUser = yield prisma.users.findUnique({
                where: {
                    username: 'fuckoff',
                },
            });
            if (checkUser) {
                const { status, message } = new authCredentialInvalid_exception_1.default();
                return res.status(status).send("User already exists...");
            }
            const { username, name, sex, email, password } = req.body;
            // const user = {
            //   username: username,
            //   name    : name,
            //   sex     : sex,
            //   email   : email,
            //   password: password,
            // }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const encryptPassword = yield bcryptjs_1.default.hash(password, salt);
            const user = yield prisma.users.create({
                data: {
                    uid: 'asdasdasdad',
                    username: username,
                    name: name,
                    sex: sex,
                    email: email,
                    password: encryptPassword,
                    created_at: '2022-01-21 10:00:00',
                    updated_at: '2022-01-21 10:00:00',
                    created_by: 1,
                    updated_by: 1,
                },
            });
            res.send(user);
        }
        catch (error) {
            let { status, message } = new basicError_exception_1.default();
            res.status(status).send(message);
        }
    });
}
exports.createUser = createUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let user: Partial<User> | any = 'ok';
        // await User.findOne({ email: req.body.email });
        const { page, size, title } = req.query;
        const condition = title ? title : null;
        const { limit, offset } = (0, pagination_util_1.getPagination)(page, size);
        const userList = yield prisma.users.findMany({
            skip: offset,
            take: limit,
            // where: {
            //   email: {
            //     contains: 'Prisma',
            //   },
            // },
            orderBy: {
                username: 'desc',
            },
        });
        res.json(userList);
    }
    catch (error) {
        let { status, message } = new basicError_exception_1.default();
        res.status(status).send(message);
    }
});
exports.getUser = getUser;
function getUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // let user: Partial<User> | any = 'ok';
            // await User.findOne({ email: req.body.email });
            const { uid } = req.query;
            const user = yield prisma.users.findUnique({
                where: {
                    // uid: uid,
                    username: uid === null || uid === void 0 ? void 0 : uid.toString()
                },
            });
            res.json(user);
        }
        catch (error) {
            let { status, message } = new basicError_exception_1.default();
            res.status(status).send(message);
        }
    });
}
exports.getUserById = getUserById;
function editUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // let user: Partial<User> | any = 'ok';
            // await User.findOne({ email: req.body.email });
            const { uid } = req.query;
            const user = yield prisma.users.update({
                where: {
                    uid: uid === null || uid === void 0 ? void 0 : uid.toString()
                },
                data: req.body,
            });
            res.json(user);
        }
        catch (error) {
            let { status, message } = new basicError_exception_1.default();
            res.status(status).send(message);
        }
    });
}
exports.editUser = editUser;
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // let user: Partial<User> | any = 'ok';
            // await User.findOne({ email: req.body.email });
            const { uid } = req.query;
            const user = yield prisma.users.delete({
                where: {
                    uid: uid === null || uid === void 0 ? void 0 : uid.toString()
                },
            });
            res.json(user);
        }
        catch (error) {
            let { status, message } = new basicError_exception_1.default();
            res.status(status).send(message);
        }
    });
}
exports.deleteUser = deleteUser;
