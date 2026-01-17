"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversation_controller_1 = require("./conversation.controller");
const router = (0, express_1.Router)();
router.post("/", conversation_controller_1.createConversation);
router.get("/", conversation_controller_1.getUserConversations);
exports.default = router;
