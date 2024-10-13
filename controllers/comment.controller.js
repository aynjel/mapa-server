import {
  createCommentValidation,
  updateCommentValidation,
} from "../helpers/validation.js";
import { httpError } from "../helpers/httpError.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";

const create = async (req, res, next) => {
  const { _id } = req.user;
  const { postSlug } = req.params;

  const { error } = createCommentValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { content } = req.body;
  const post = await Post.findOne({ slug: postSlug });
  if (!post) {
    return next(httpError(404, "No Posts Found"));
  }

  const newComment = await Comment.create({
    content,
    author: _id,
    post: post._id,
  });

  if (!newComment) {
    return next(httpError(500, "Comment creation error"));
  }

  post.commentsCount = post.commentsCount + 1;
  await post.save();

  const comment = await Comment.findOne({ _id: newComment._id });

  if (!comment) {
    return next(httpError(500, "Comment creation error"));
  }

  await comment.save();
  await Post.findOneAndUpdate(
    { _id: post._id },
    { $inc: { commentsCount: 1 } }
  );

  return res.status(201).json({
    message: "Comment created successfully",
    data: comment,
  });
};

const index = async (req, res, next) => {
  const { postSlug } = req.params;
  const posts = await Post.findOne({ slug: postSlug });
  if (!posts) {
    return next(httpError(404, "No Posts Found"));
  }
  const comments = await Comment.find({
    post: posts._id,
  }).sort({ createdAt: -1 });
  if (!comments) {
    return next(httpError(404, "No Comments Found"));
  }

  return res.status(200).json({
    message: "Comments fetched successfully",
    data: comments,
  });
};

const show = async (req, res, next) => {
  const { commentID } = req.params;
  const comment = await Comment.findOne({ _id: commentID });
  if (!comment) {
    return next(httpError(404));
  }

  return res.status(200).json({
    message: "Comment fetched successfully",
    data: comment,
  });
};

const update = async (req, res, next) => {
  const { commentID } = req.params;
  const comment = await Comment.find({
    _id: commentID,
  });
  if (!comment) {
    return next(httpError(404));
  }

  const { error } = updateCommentValidation.validate(req.body);
  if (error) {
    return next(httpError(400, error.message));
  }

  const { content } = req.body;

  comment.content = content;

  const updatedComment = await comment.save();
  if (!updatedComment) {
    return next(httpError(500, "Comment update error"));
  }

  return res.status(200).json({
    message: "Comment updated successfully",
    data: updatedComment,
  });
};

const destroy = async (req, res, next) => {
  const { commentID } = req.params;
  const comment = await Comment.find({
    _id: commentID,
  });
  if (!comment) {
    return next(httpError(404));
  }

  const post = await Post.findOne({ _id: comment.post });
  if (!post) {
    return next(httpError(404));
  }
  post.commentsCount = post.commentsCount - 1;
  await post.save();

  const deletedComment = await comment.remove();
  if (!deletedComment) {
    return next(httpError(500, "Comment delete error"));
  }

  return res.status(200).json({
    message: "Comment deleted successfully",
    data: deletedComment,
  });
};

export { create, index, show, update, destroy };
