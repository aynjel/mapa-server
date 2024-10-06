import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import * as CommentController from "../../controllers/comment.controller.js";

const router = express.Router();

router.post(
  "/create/:postSlug",
  authenticateToken,
  ctrlWrapper(CommentController.create)
);

router.get(
  "/index/:postSlug",
  authenticateToken,
  ctrlWrapper(CommentController.index)
);

router.get(
  "/show/:commentID",
  authenticateToken,
  ctrlWrapper(CommentController.show)
);

router.patch(
  "/update/:postSlug",
  authenticateToken,
  ctrlWrapper(CommentController.update)
);

router.delete(
  "/delete/:commentID",
  authenticateToken,
  ctrlWrapper(CommentController.destroy)
);

export { router };
