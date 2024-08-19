import { createPostValidation } from "../helpers/validation.js";
import path from "path";
import fs from "fs/promises";
import { httpError } from "../helpers/httpError.js";
import { cloudinary } from "../helpers/cloudinaryUpload.js";
import { Post } from "../models/post.model.js";
import { Section } from "../models/section.model.js";
import { slugifyChars } from "../helpers/slugify.js";

const create = async (req, res, next) => {
  const { _id } = req.user;
  const { sectionSlug } = req.params;
  const { title, description } = req.body;
  const { path: tempPath, originalname } = req.file;
  const { error } = createPostValidation.validate(req.body);

  if (error) {
    return next(httpError(400, error.message));
  }

  const section = await Section.findOne({ slug: sectionSlug });
  if (!section) {
    return next(httpError(404, "Section not found"));
  }

  try {
    const slug = slugifyChars(title);
    const { secure_url } = await cloudinary.uploader.upload(tempPath, {
      folder: "posts",
      public_id: `${_id}-${slug}`,
    });
    const filename = `${Date.now()}-${originalname}`;
    const newPath = path.join("public", "posts", filename);
    await fs.rename(tempPath, newPath);
    const post = await Post.create({
      slug,
      title,
      description,
      content: secure_url,
      section: section._id,
      author: _id,
    });
    section.postsCount += 1;
    await section.save();
    return res.status(201).json({
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    return next(httpError(500));
  }
};

const index = async (req, res, next) => {
  const { sectionId } = req.params;
  const posts = await Post.find({ sectionId }).populate("section");

  if (!posts) {
    return next(httpError(404, "No Posts Found"));
  }

  return res.status(200).json({
    message: "Posts fetched successfully",
    data: posts,
  });
};

const show = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("section");

  if (!post) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Post fetched successfully",
    data: post,
  });
};

const update = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, section } = req.body;
  const post = await Post.findByIdAndUpdate(
    id,
    { title, description, content, section },
    { new: true }
  );

  if (!post) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.status(200).json({
    message: "Post updated successfully",
    data: post,
  });
};

const destroy = async (req, res) => {
  const { sectionSlug, postSlug } = req.params;
  const post = await Post.findOneAndDelete({ slug: postSlug });

  if (!post) {
    return res.status(404).json({ message: "Not found" });
  }

  // decrement section posts count
  const section = await Section.findOne({ slug: sectionSlug });
  section.postsCount -= 1;
  await section.save();

  await cloudinary.uploader.destroy(post.slug);

  return res.status(200).json({
    message: "Post deleted successfully",
    data: post,
  });
};

export { create, index, show, update, destroy };
