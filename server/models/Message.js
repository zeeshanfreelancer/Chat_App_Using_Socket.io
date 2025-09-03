import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Sender
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Recipient (null = public)
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  text: { type: String, required: true },

  type: { type: String, enum: ["public", "private"], default: "public" },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
