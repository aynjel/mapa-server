import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    slug: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "section",
      required: [true, "Section Slug is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false, timestamps: true }
);

const Post = model("post", postSchema);

export { Post };
