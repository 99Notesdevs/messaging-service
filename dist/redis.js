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
exports.redisSubscriber = exports.redisPublisher = void 0;
exports.initRedis = initRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
exports.redisPublisher = new ioredis_1.default(REDIS_URL);
exports.redisSubscriber = new ioredis_1.default(REDIS_URL);
exports.redisPublisher.on("error", (err) => console.error("Redis Pub Error", err));
exports.redisSubscriber.on("error", (err) => console.error("Redis Sub Error", err));
function initRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        // ioredis connects automatically, but you can test connection here
        yield exports.redisPublisher.ping();
        yield exports.redisSubscriber.ping();
    });
}
