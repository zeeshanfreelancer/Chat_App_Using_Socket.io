import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  reactions: [String],
  createdAt: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false }
});

export default mongoose.model("Message", messageSchema);
