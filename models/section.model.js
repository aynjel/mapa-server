import { Schema, model } from "mongoose";

const sectionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
    },
  },
  { versionKey: false }
);

const Section = model("section", sectionSchema);

export { Section };
