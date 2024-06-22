import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} from "../../controllers/section.controller.js";

const router = express.Router();

/* POST: // http://localhost:3000/api/sections
{
  "title": "Section title",
  "description": "Section description"
}
*/
router.post("/", authenticateToken, ctrlWrapper(createSection));

/* GET: // http://localhost:3000/api/sections */
router.get("/", authenticateToken, ctrlWrapper(getSections));

/* GET: // http://localhost:3000/api/sections/:id */
router.get("/:id", authenticateToken, ctrlWrapper(getSectionById));

/* PATCH: // http://localhost:3000/api/sections/:id
{
    "title":"New section title",
    "description":"New section description"
}
*/
router.patch("/:id", authenticateToken, ctrlWrapper(updateSection));

/* DELETE: // http://localhost:3000/api/sections/:id */
router.delete("/:id", authenticateToken, ctrlWrapper(deleteSection));

export { router };
