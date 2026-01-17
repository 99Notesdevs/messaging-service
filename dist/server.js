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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("./config/db");
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./socket");
const PORT = Number(process.env.PORT || 4000);
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, db_1.connectDB)();
        const { server } = yield (0, socket_1.createSocketServer)(app_1.default);
        server.listen(PORT, () => {
            console.log(`Messaging service listening on port ${PORT}`);
        });
    });
}
start().catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
});
