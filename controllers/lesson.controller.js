import {
  createPostValidation,
  updatePostValidation,
} from "../helpers/validation.js";
import path from "path";
import fs from "fs/promises";
import { httpError } from "../helpers/httpError.js";
import { cloudinary } from "../helpers/cloudinaryUpload.js";
import { Lesson } from "../models/lesson.model.js";
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

  const checkPost = await Lesson.findOne({ title });
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

  const newPost = await Lesson.create({
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
  const lessons = await Lesson.find().sort({ createdAt: -1 });

  if (!lessons) {
    return next(httpError(404, "No Lessons Found"));
  }

  return res.status(200).json({
    message: "Lessons fetched successfully",
    data: lessons,
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

  const posts = await Lesson.find({
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
  const { lessonSlug } = req.params;
  const lesson = await Lesson.findOne({ slug: lessonSlug });
  if (!lesson) {
    return next(httpError(404));
  }

  const post = await Lesson.findById(lesson._id).populate("section");
  if (!post) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Lesson fetched successfully",
    data: post,
  });
};

const update = async (req, res, next) => {
  const { lessonSlug } = req.params;
  const post = await Lesson.findOne({ slug: lessonSlug });
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

  const updatedLesson = await post.save();
  if (!updatedLesson) {
    return next(httpError(500, "Lesson update error"));
  }

  return res.status(200).json({
    message: "Lesson updated successfully",
    data: updatedLesson,
  });
};

const destroy = async (req, res, next) => {
  const { lessonSlug } = req.params;
  const post = await Lesson.findOneAndDelete({ slug: lessonSlug });
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
