import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import * as LessonController from "../../controllers/lesson.controller.js";
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
  "/create/:section",
  authenticateToken,
  upload.single("content"),
  ctrlWrapper(LessonController.create)
);

/* GET: // http://localhost:3000/api/posts */
router.get("/", authenticateToken, ctrlWrapper(LessonController.index));

router.get(
  "/sections/:section",
  authenticateToken,
  ctrlWrapper(LessonController.indexBySection)
);

/* GET: // http://localhost:3000/api/posts/:id */
router.get(
  "/:lessonSlug",
  authenticateToken,
  ctrlWrapper(LessonController.show)
);

/* PATCH: // http://localhost:3000/api/posts/:postSlug
{
    "title":"New post title",
    "description":"New post description",
    "contentPdf":"New post content",
    "section":"New post section"
}
*/
router.put(
  "/:lessonSlug",
  authenticateToken,
  upload.single("content"),
  ctrlWrapper(LessonController.update)
);

/* DELETE: // http://localhost:3000/api/posts/:lessonSlug */
router.delete(
  "/:lessonSlug",
  authenticateToken,
  ctrlWrapper(LessonController.destroy)
);

export { router };
