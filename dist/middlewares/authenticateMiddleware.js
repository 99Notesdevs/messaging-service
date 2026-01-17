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
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("../grpc/client/client");
dotenv_1.default.config();
const secret = process.env.TOKEN_SECRET || '';
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['token'];
        if (!cookie)
            throw new Error('No Cookie provided');
        const token = cookie.trim();
        if (!token)
            throw new Error("No token provided");
        const authRepo = yield (0, client_1.getAuthToken)(cookie);
        if (!authRepo)
            throw new Error("Cannot get token");
        const type = authRepo.type;
        const { id } = jsonwebtoken_1.default.verify(token, secret);
        if (!id)
            throw new Error('Cannot verify token');
        req.authUser = id;
        req.authType = type;
        next();
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(401).json({
                success: false,
                message: err.message
            });
        }
        else {
            res.status(401).json({
                success: false,
                message: 'Error checking token'
            });
        }
    }
});
exports.authenticate = authenticate;
