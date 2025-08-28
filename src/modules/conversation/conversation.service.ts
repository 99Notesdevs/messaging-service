import { Conversation } from "./conversation.model";

export const ConversationService = {
  findOrCreateConversation: async (userId: string, receiverId: string) => {
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({ participants: [userId, receiverId] });
      await conversation.save();
    }
    return conversation;
  },

  getUserConversations: async (userId: string) => {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return conversations;
  },
};
