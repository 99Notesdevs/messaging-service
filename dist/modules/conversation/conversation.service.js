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
exports.ConversationService = void 0;
const conversation_model_1 = require("./conversation.model");
const client_1 = require("../../grpc/client/client");
exports.ConversationService = {
    findOrCreateConversation: (userId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
        let conversation = yield conversation_model_1.Conversation.findOne({
            participants: { $all: [userId, receiverId] },
        });
        if (!conversation) {
            conversation = new conversation_model_1.Conversation({ participants: [userId, receiverId] });
            yield conversation.save();
        }
        return conversation;
    }),
    getUserConversations: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const conversations = yield conversation_model_1.Conversation.find({
            participants: userId,
        })
            .sort({ updatedAt: -1 })
            .lean()
            .exec();
        if (!conversations || conversations.length === 0) {
            return [];
        }
        // Collect unique participant IDs (excluding any non-numeric or invalid ones)
        const idSet = new Set();
        for (const conv of conversations) {
            const participants = conv.participants || [];
            for (const pid of participants) {
                const parsed = Number(pid);
                if (!Number.isNaN(parsed)) {
                    idSet.add(parsed);
                }
            }
        }
        const userIds = Array.from(idSet);
        let usersById = {};
        if (userIds.length > 0) {
            try {
                const response = yield (0, client_1.getUserDetails)(userIds);
                if ((response === null || response === void 0 ? void 0 : response.users) && Array.isArray(response.users)) {
                    usersById = Object.fromEntries(response.users.map((u) => {
                        var _a, _b;
                        return [
                            Number(u.userId),
                            {
                                firstName: (_a = u.firstName) !== null && _a !== void 0 ? _a : "",
                                lastName: (_b = u.lastName) !== null && _b !== void 0 ? _b : "",
                                rating: typeof u.rating === "number" ? u.rating : 0,
                            },
                        ];
                    }));
                }
            }
            catch (err) {
                console.error("Failed to fetch user details for conversations", err);
            }
        }
        // Attach user details for each participant in each conversation
        const hydratedConversations = conversations.map((conv) => {
            const participants = conv.participants || [];
            const participantsDetails = participants.map((pid) => {
                const numericId = Number(pid);
                const info = usersById[numericId];
                return info
                    ? {
                        id: numericId,
                        firstName: info.firstName,
                        lastName: info.lastName,
                        rating: info.rating,
                    }
                    : { id: numericId, firstName: "", lastName: "", rating: 0 };
            });
            return Object.assign(Object.assign({}, conv), { participantsDetails });
        });
        return hydratedConversations;
    }),
};
