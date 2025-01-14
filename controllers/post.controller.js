import {
  createPostValidation,
  updatePostValidation,
} from "../helpers/validation.js";
import path from "path";
import fs from "fs/promises";
import { httpError } from "../helpers/httpError.js";
import { cloudinary } from "../helpers/cloudinaryUpload.js";
import { Post } from "../models/post.model.js";
import { Section } from "../models/section.model.js";
import { slugifyChars } from "../helpers/slugify.js";

const create = async (req, res, next) => {
  const { _id } = req.user;
  const { section } = req.params;
  const { path: tempPath, originalname } = req.file;

  const { error } = createPostValidation.validate(req.body);
  if (error) next(httpError(400, error.message));

  const { title, description } = req.body;
  const slug = slugifyChars(title);

  const postSection = await Section.findOne({ slug: section });
  if (!postSection) next(httpError(404));

  const checkPost = await Post.findOne({ title });
  if (checkPost) next(httpError(409, "Post already exists"));

  const slugOriginal = slugifyChars(originalname);
  const filename = `${Date.now()}-${slugOriginal}`;
  const newPath = path.join("public", "posts", filename);
  await fs.rename(tempPath, newPath);
  const { secure_url } = await cloudinary.uploader.upload(newPath, {
    folder: "posts",
    public_id: `${_id}-${slug}`,
  });

  await fs.unlink(newPath);

  const newPost = await Post.create({
    slug,
    title,
    description,
    content: secure_url,
    section: postSection._id,
    author: _id,
  });
  if (!newPost) next(httpError(500));

  postSection.postsCount += 1;
  await postSection.save();

  return res.status(201).json({
    message: "Post created successfully",
    data: newPost,
  });
};

const index = async (req, res, next) => {
  const posts = await Post.find().sort({ createdAt: -1 });

  if (!posts) {
    return next(httpError(404, "No Posts Found"));
  }

  return res.status(200).json({
    message: "Posts fetched successfully",
    data: posts,
  });
};

const indexBySection = async (req, res, next) => {
  const { page, limit } = req.query;
  const { section } = req.params;
  if (!section) {
    return next(httpError(404, "No Posts Found"));
  }

  const sectionFound = await Section.findOne({ slug: section });
  if (!sectionFound) {
    return next(httpError(404, "No Posts Found"));
  }

  const posts = await Post.find({
    section: sectionFound._id,
  })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })
    .populate("section");

  if (!posts) {
    return next(httpError(404, "No Posts Found"));
  }

  return res.status(200).json({
    message: "Posts fetched successfully",
    data: posts,
  });
};

const show = async (req, res, next) => {
  const { postSlug } = req.params;
  const post = await Post.findOne({ slug: postSlug }).populate("section");

  if (!post) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Post fetched successfully",
    data: post,
  });
};

const update = async (req, res, next) => {
  const { postSlug } = req.params;
  const post = await Post.findOne({ slug: postSlug });
  if (!post) {
    return next(httpError(404));
  }

  const { error } = updatePostValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { title, description } = req.body;
  const { path: tempPath, originalname } = req.file;

  post.title = title;
  post.description = description;

  if (tempPath) {
    const slugOriginal = slugifyChars(originalname);
    const filename = `${Date.now()}-${slugOriginal}`;
    const newPath = path.join("public", "posts", filename);
    await fs.rename(tempPath, newPath);
    const { secure_url } = await cloudinary.uploader.upload(newPath, {
      folder: "posts",
      public_id: post.slug,
    });

    await fs.unlink(newPath);
    post.content = secure_url;
  }

  const updatedPost = await post.save();
  if (!updatedPost) {
    return next(httpError(500, "Post update error"));
  }

  return res.status(200).json({
    message: "Post updated successfully",
    data: updatedPost,
  });
};

const destroy = async (req, res, next) => {
  const { postSlug } = req.params;
  const post = await Post.findOneAndDelete({ slug: postSlug });
  if (!post) {
    return next(httpError(404));
  }

  // const section = await Section.findOne({ slug: sectionSlug });
  // if (!section) {
  //   return next(httpError(404));
  // }
  // section.postsCount -= 1;
  // await section.save();

  await cloudinary.uploader.destroy(post.slug);

  return res.status(200).json({
    message: "Post deleted successfully",
    data: post,
  });
};

export { create, index, indexBySection, show, update, destroy };
