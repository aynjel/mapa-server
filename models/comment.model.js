import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: [true, "Post ID is required"],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

const Comment = model("comment", commentSchema);

export { Comment };
