import { createPostValidation } from "../helpers/validation.js";
import { Post } from "../models/post.model.js";
import path from "path";
import fs from "fs/promises";
import { httpError } from "../helpers/httpError.js";
import { cloudinary } from "../helpers/cloudinaryUpload.js";

const createPost = async (req, res, next) => {
  const { _id } = req.user;
  const { title, description, section } = req.body;
  const { path: tempPath, originalname } = req.file;
  const { error } = createPostValidation.validate(req.body);

  if (error) {
    return next(httpError(400, error.message));
  }

  try {
    const extension = path.extname(originalname);
    const filename = `${_id}${extension}`;
    const newPath = path.join("public", "posts", "uploads", filename);
    await fs.rename(tempPath, newPath);

    const uploadedResponse = await cloudinary.uploader.upload(newPath, {
      folder: "posts",
      format: "jpg",
    });

    const post = await Post.create({
      title,
      description,
      content: uploadedResponse.secure_url,
      section,
    });

    return res.status(201).json({ post });
  } catch (error) {
    return next(httpError(500, error.message));
  }
};

const getPosts = async (_req, res) => {
  const posts = await Post.find().populate("section");

  return res.json({ posts });
};

const getPostById = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("section");

  if (!post) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json({ post });
};

const updatePost = async (req, res) => {
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

  return res.json({ post });
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json({ post });
};

export { createPost, getPosts, getPostById, updatePost, deletePost };
