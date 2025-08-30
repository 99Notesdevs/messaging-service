import { Conversation } from "./conversation.model";

export const ConversationService = {
  findOrCreateConversation: async (userId: string, receiverId: string) => {
    // Sort participants to ensure consistent order
    const participants = [userId, receiverId].sort();
    
    let conversation = await Conversation.findOne({
      participants: participants
    });

    if (!conversation) {
      conversation = new Conversation({ participants });
      console.log("Conversation", conversation);
      try {
        await conversation.save();
        console.log("Conversation saved");
      } catch (error) {
        // In case of race condition, try to fetch again
        if (error.code === 11000) { // Duplicate key error
          conversation = await Conversation.findOne({
            participants: participants
          });
          console.log("Conversation found", conversation);
          if (!conversation) {
            throw new Error('Failed to create or find conversation');
          }
        } else {
          throw error;
        }
      }
    }
    return conversation;
  },

  getUserConversations: async (userId: string) => {
    console.log("userId", typeof userId, userId);
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return conversations;
  },
};
