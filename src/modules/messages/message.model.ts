import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  status?: string;
}

const MessageSchema: Schema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  status: { type: String, default: "SENT" }
});

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
