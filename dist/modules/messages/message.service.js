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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessage = saveMessage;
exports.listMessagesForConversation = listMessagesForConversation;
exports.markMessageRead = markMessageRead;
const message_model_1 = require("./message.model");
const conversation_model_1 = require("../conversation/conversation.model");
// Save message and return saved doc
function saveMessage(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const msg = new message_model_1.Message({
            conversationId: data.conversationId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            createdAt: new Date(),
            status: "SENT",
        });
        const message = yield msg.save();
        yield conversation_model_1.Conversation.findByIdAndUpdate(data.conversationId, {
            $set: {
                lastMessage: message._id
            },
        });
        return message;
    });
}
// List messages with simple cursor pagination (cursor = ISO date string)
function listMessagesForConversation(conversationId_1) {
    return __awaiter(this, arguments, void 0, function* (conversationId, limit = 50, cursor) {
        const query = { conversationId };
        if (cursor)
            query.createdAt = { $lt: new Date(cursor) };
        const msgs = yield message_model_1.Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        return msgs;
    });
}
// Mark message read (set status to READ)
function markMessageRead(messageId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Make sure only recipient can mark read
        const m = yield message_model_1.Message.findById(messageId);
        if (!m)
            throw new Error("message_not_found");
        if (m.receiverId !== userId)
            throw new Error("not_recipient");
        m.status = "READ";
        yield m.save();
        return m;
    });
}
