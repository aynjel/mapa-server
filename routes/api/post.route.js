import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../../controllers/post.controller.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();

/* POST: // http://localhost:3000/api/posts
{
  "title": "Post title",
  "description": "Post description",
  "contentPdf": "Post content",
  "section": "Post section"
}
*/
router.post(
  "/",
  authenticateToken,
  upload.single("content"),
  ctrlWrapper(createPost)
);

/* GET: // http://localhost:3000/api/posts */
router.get("/", authenticateToken, ctrlWrapper(getPosts));

/* GET: // http://localhost:3000/api/posts/:id */
router.get("/:id", authenticateToken, ctrlWrapper(getPostById));

/* PATCH: // http://localhost:3000/api/posts/:id
{
    "title":"New post title",
    "description":"New post description",
    "contentPdf":"New post content",
    "section":"New post section"
}
*/
router.patch(
  "/:id",
  authenticateToken,
  upload.single("content"),
  ctrlWrapper(updatePost)
);

/* DELETE: // http://localhost:3000/api/posts/:id */
router.delete("/:id", authenticateToken, ctrlWrapper(deletePost));

export { router };
