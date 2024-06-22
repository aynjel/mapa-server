import { createPostValidation } from "../helpers/validation.js";
import { Post } from "../models/post.model.js";
import path from "path";
import fs from "fs/promises";
import { httpError } from "../helpers/httpError.js";

const createPost = async (req, res, next) => {
  const { _id } = req.user;
  const { title, description, section } = req.body;
  const { path: tempPath, originalname } = req.file;

  const { error } = createPostValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const extension = path.extname(originalname);

  const filename = `${_id}${extension}`;
  const newPath = path.join("public", "posts", "uploads", filename);
  await fs.rename(tempPath, newPath);

  let contentURL = path.join("/posts", "uploads", filename);
  contentURL = contentURL.replace(/\\/g, "/");

  const post = await Post.create({
    title,
    description,
    content: contentURL,
    section,
  });

  return res.status(201).json({ post });
};

const getPosts = async (_req, res) => {
  const posts = await Post.find();

  return res.json({ posts });
};

const getPostById = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    throw httpError(404, "Not found");
  }

  return res.json({ post });
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  const { title, description, section } = req.body;
  const { path: tempPath, originalname } = req.file;

  const { error } = createPostValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const extension = path.extname(originalname);

  const filename = `${_id}${extension}`;
  const newPath = path.join("public", "posts", "uploads", filename);
  await fs.rename(tempPath, newPath);

  let contentURL = path.join("/posts", "uploads", filename);
  contentURL = contentURL.replace(/\\/g, "/");

  const post = await Post.findByIdAndUpdate(
    id,
    {
      title,
      description,
      content: contentURL,
      section,
    },
    { new: true }
  );

  if (!post) {
    throw httpError(404, "Not found");
  }

  return res.json({ post });
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    throw httpError(404, "Not found");
  }

  return res.json({ post });
};

export { createPost, getPosts, getPostById, updatePost, deletePost };
