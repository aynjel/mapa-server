import { Schema, model } from "mongoose";

const sectionSchema = new Schema(
  {
    slug: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      unique: true,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false, timestamps: true }
);

const Section = model("section", sectionSchema);

export { Section };
