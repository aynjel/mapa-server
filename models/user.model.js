import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    slug: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    hashPassword: {
      type: String,
      required: [true, "Password is required"],
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    role: {
      type: String,
      enum: ["student", "parent", "teacher", "admin"],
      default: "student",
    },
    avatarURL: {
      type: String,
    },
    token: {
      type: String,
      default: null,
    },
    likedPosts: {
      type: [Schema.Types.ObjectId],
      ref: "post",
      default: [],
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

const User = model("user", userSchema);

export { User };
