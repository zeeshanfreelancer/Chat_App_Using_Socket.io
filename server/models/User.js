import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "https://www.w3schools.com/howto/img_avatar.png", // default avatar
    },
    bio: {
      type: String,
      default: "Hey there! I am using the Chat App 🚀",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
