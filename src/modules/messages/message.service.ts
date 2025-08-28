import { Message, IMessage } from "./message.model";
import { Conversation } from "../conversation/conversation.model";

// Save message and return saved doc
export async function saveMessage(data: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
}): Promise<IMessage> {
  const msg = new Message({
    conversationId: data.conversationId,
    senderId: data.senderId,
    receiverId: data.receiverId,
    content: data.content,
    createdAt: new Date(),
    status: "SENT",
  });
  const message = await msg.save();
  await Conversation.findByIdAndUpdate(data.conversationId, {
    $set: {
      lastMessage: message._id
    },
  });
  
  return message;
}

// List messages with simple cursor pagination (cursor = ISO date string)
export async function listMessagesForConversation(
  conversationId: string,
  limit = 50,
  cursor?: string
) {
  const query: any = { conversationId };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };
  const msgs = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();
  return msgs;
}

// Mark message read (set status to READ)
export async function markMessageRead(messageId: string, userId: string) {
  // Make sure only recipient can mark read
  const m = await Message.findById(messageId);
  if (!m) throw new Error("message_not_found");
  if (m.receiverId !== userId) throw new Error("not_recipient");
  m.status = "READ";
  await m.save();
  return m;
}
