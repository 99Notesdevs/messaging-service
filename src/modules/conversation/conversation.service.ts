import { Conversation } from "./conversation.model";
import { getUserDetails } from "../../grpc/client/client";

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

    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Collect unique participant IDs (excluding any non-numeric or invalid ones)
    const idSet = new Set<number>();
    for (const conv of conversations as Array<{ participants?: string[] }>) {
      const participants = conv.participants || [];
      for (const pid of participants) {
        const parsed = Number(pid);
        if (!Number.isNaN(parsed)) {
          idSet.add(parsed);
        }
      }
    }

    const userIds = Array.from(idSet);

    let usersById: Record<
      number,
      { firstName: string; lastName: string; rating: number }
    > = {};

    if (userIds.length > 0) {
      try {
        const response = await getUserDetails(userIds);
        if (response?.users && Array.isArray(response.users)) {
          usersById = Object.fromEntries(
            response.users.map((u: any) => [
              Number(u.userId),
              {
                firstName: u.firstName ?? "",
                lastName: u.lastName ?? "",
                rating: typeof u.rating === "number" ? u.rating : 0,
              },
            ])
          );
        }
      } catch (err) {
        console.error("Failed to fetch user details for conversations", err);
      }
    }

    // Attach user details for each participant in each conversation
    const hydratedConversations = (conversations as Array<any>).map((conv) => {
      const participants = conv.participants || [];
      const participantsDetails = participants.map((pid: string) => {
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

      return {
        ...conv,
        participantsDetails,
      };
    });

    return hydratedConversations;
  },
};
