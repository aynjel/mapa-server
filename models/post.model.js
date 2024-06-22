import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
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
    },
  },
  { versionKey: false }
);

const Post = model("post", postSchema);

export { Post };
