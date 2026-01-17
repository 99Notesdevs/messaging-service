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
exports.createSocketServer = createSocketServer;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = __importDefault(require("ioredis"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = __importDefault(require("cookie"));
const message_service_1 = require("./modules/messages/message.service");
const conversation_service_1 = require("./modules/conversation/conversation.service");
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const JWT_SECRET = process.env.JWT_SECRET || "vansh123";
function createSocketServer(expressApp) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = http_1.default.createServer(expressApp);
        const io = new socket_io_1.Server(server, {
            cors: { origin: "*" },
            path: "/socket.io"
        });
        // Redis adapter (pub/sub) for scaling across instances
        const pubClient = new ioredis_1.default(REDIS_URL);
        const subClient = pubClient.duplicate();
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        // Simple JWT auth middleware for socket.io
        io.use((socket, next) => {
            var _a;
            let token = (socket.handshake.auth && socket.handshake.auth.token) ||
                ((_a = socket.handshake.query) === null || _a === void 0 ? void 0 : _a.token);
            // If not provided, try to read from cookies
            try {
                if (!token && socket.handshake.headers.cookie) {
                    const cookies = cookie_1.default.parse(socket.handshake.headers.cookie);
                    token = cookies.token;
                }
                if (!token)
                    return next(new Error("auth error"));
                const { id } = jsonwebtoken_1.default.verify(String(token), JWT_SECRET);
                socket.userId = id;
                return next();
            }
            catch (err) {
                return next(new Error("auth error"));
            }
        });
        io.on("connection", (socket) => {
            const userId = socket.userId;
            console.log(`socket connected: ${socket.id} user:${userId}`);
            // Join a personal room for the user so any instance can emit to them
            const personalRoom = `user:${userId}`;
            socket.join(personalRoom);
            // Client asks for message list for a conversation
            socket.on("LIST_MESSAGES", (data, ack) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { conversationId, limit = 50, cursor } = data || {};
                    const messages = yield (0, message_service_1.listMessagesForConversation)(conversationId, limit, cursor);
                    if (ack)
                        ack({ ok: true, messages });
                }
                catch (err) {
                    if (ack)
                        ack({ ok: false, error: String(err) });
                }
            }));
            // Send a message: save to DB, emit to recipient's personal room
            socket.on("SEND_MESSAGE", (data, ack) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { toUserId, content } = data;
                    const senderId = userId;
                    const conversation = yield conversation_service_1.ConversationService.findOrCreateConversation(senderId, toUserId);
                    const saved = yield (0, message_service_1.saveMessage)({ conversationId: conversation.id, senderId, receiverId: toUserId, content });
                    io.to(`user:${senderId}`).emit("CONVERSATION_UPDATED", { conversationId: conversation.id, lastMessage: saved });
                    io.to(`user:${toUserId}`).emit("CONVERSATION_UPDATED", { conversationId: conversation.id, lastMessage: saved });
                    // emit NEW_MESSAGE to recipient's personal room
                    const payload = { type: "NEW_MESSAGE", message: saved };
                    io.to(`user:${toUserId}`).emit("NEW_MESSAGE", payload);
                    // ack to sender
                    if (ack)
                        ack({ ok: true, message: saved });
                }
                catch (err) {
                    if (ack)
                        ack({
                            ok: false,
                            error: err instanceof Error ? err.message : String(err),
                        });
                }
            }));
            // Mark read (message-level)
            socket.on("MARK_READ", (data, ack) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { messageId } = data;
                    const msg = yield (0, message_service_1.markMessageRead)(messageId, userId);
                    // (notify the sender via their personal room)
                    io.to(`user:${msg.senderId}`).emit("MESSAGE_READ", {
                        type: "MESSAGE_READ",
                        messageId,
                        readerId: userId,
                    });
                    if (ack)
                        ack({ ok: true });
                }
                catch (err) {
                    if (ack)
                        ack({ ok: false, error: String(err) });
                }
            }));
            socket.on("disconnect", (reason) => {
                console.log(`socket disconnect: ${socket.id} user:${userId} reason:${reason}`);
            });
        });
        return { server, io };
    });
}
