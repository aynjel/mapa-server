import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import * as PostController from "../../controllers/post.controller.js";
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
  "/create/:sectionSlug",
  authenticateToken,
  upload.single("content"),
  ctrlWrapper(PostController.create)
);

/* GET: // http://localhost:3000/api/posts */
router.get(
  "/:sectionSlug",
  authenticateToken,
  ctrlWrapper(PostController.index)
);

/* GET: // http://localhost:3000/api/posts/:id */
router.get(
  "/:sectionSlug/details/:postSlug",
  authenticateToken,
  ctrlWrapper(PostController.show)
);

/* PATCH: // http://localhost:3000/api/posts/:postSlug
{
    "title":"New post title",
    "description":"New post description",
    "contentPdf":"New post content",
    "section":"New post section"
}
*/
router.patch(
  "/:postSlug",
  authenticateToken,
  upload.single("content"),
  ctrlWrapper(PostController.update)
);

/* DELETE: // http://localhost:3000/api/posts/:postSlug */
router.delete(
  "/:sectionSlug/:postSlug",
  authenticateToken,
  ctrlWrapper(PostController.destroy)
);

export { router };
