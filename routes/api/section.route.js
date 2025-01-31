import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import * as SectionController from "../../controllers/section.controller.js";

const router = express.Router();

/* POST: // http://localhost:3000/api/sections
{
  "title": "Section title",
  "description": "Section description"
}
*/
router.post("/", authenticateToken, ctrlWrapper(SectionController.create));

/* GET: // http://localhost:3000/api/sections */
router.get("/", authenticateToken, ctrlWrapper(SectionController.index));

router.get(
  "/by-author",
  authenticateToken,
  ctrlWrapper(SectionController.indexByAuthor)
);

/* GET: // http://localhost:3000/api/sections/:sectionSlug */
router.get(
  "/:sectionSlug",
  authenticateToken,
  ctrlWrapper(SectionController.show)
);

/* PATCH: // http://localhost:3000/api/sections/:sectionId
{
    "title":"New section title",
    "description":"New section description"
}
*/
router.patch(
  "/:sectionSlug",
  authenticateToken,
  ctrlWrapper(SectionController.update)
);

/* DELETE: // http://localhost:3000/api/sections/:sectionId */
router.delete(
  "/:sectionSlug",
  authenticateToken,
  ctrlWrapper(SectionController.destroy)
);

export { router };
