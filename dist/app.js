"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import messageRoutes from "./modules/messages/message.routes";
const conversation_routes_1 = __importDefault(require("./modules/conversation/conversation.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://main.main.local:3000",
        "http://tests.main.local:5173",
        "http://shop.main.local:5174",
        "http://auth.main.local:5175",
        "http://localhost:44275",
        "http://13.126.229.93:5174",
        "http://13.126.229.93",
        "http://community.main.local:8080",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "X-Auth-Type", "x-auth-type"],
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json());
// app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversation_routes_1.default);
app.get("/healthz", (_req, res) => res.json({ ok: true }));
exports.default = app;
